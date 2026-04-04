import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrazilPhoneField } from '../components/BrazilPhoneField';
import { BR_PHONE_HELPER, normalizeToBrazilE164 } from '../lib/phoneBr';
import type { AppStackParamList } from '../navigation/types';
import { disconnectSocket, ensureSocket } from '../socket';
import { useAuth } from '../context/AuthContext';
import { socketErrorPresentation } from '../lib/userFacingErrors';
import { colors, gradients } from '../theme';

type Nav = NativeStackNavigationProp<AppStackParamList>;

type StatusPayload =
  | { status: 'connecting' }
  | { status: 'connected' }
  | {
      status: 'disconnected';
      shouldReconnect: boolean;
      disconnectReason?: number;
      hint?: string;
    };

export default function WhatsAppScreen() {
  const navigation = useNavigation<Nav>();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [qr, setQr] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState('Preparando…');
  const [sockOk, setSockOk] = useState<boolean | null>(null);
  const [waConnected, setWaConnected] = useState(false);
  const [lastErr, setLastErr] = useState<string | null>(null);
  const [socketEpoch, setSocketEpoch] = useState(0);

  const [phoneLocal, setPhoneLocal] = useState('');
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [pairLoading, setPairLoading] = useState(false);
  const [pairErr, setPairErr] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qrCopyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyStatus = useCallback((payload: string | StatusPayload) => {
    if (typeof payload === 'string') {
      setStatusLine(payload);
      return;
    }
    if (payload.status === 'connecting') {
      setWaConnected(false);
      setLastErr(null);
      setStatusLine('Conectando ao WhatsApp…');
    }
    if (payload.status === 'connected') {
      setWaConnected(true);
      setQr(null);
      setPairCode(null);
      setPairErr(null);
      setStatusLine('WhatsApp pronto para enviar alertas.');
    }
    if (payload.status === 'disconnected') {
      setWaConnected(false);
      if (payload.shouldReconnect) {
        setLastErr(null);
      } else if (payload.hint) {
        setLastErr(payload.hint);
      }
      setStatusLine(
        payload.shouldReconnect
          ? 'Reconectando…'
          : payload.hint
            ? 'Não foi possível manter a sessão do WhatsApp.'
            : 'Sessão encerrada.',
      );
      if (!payload.shouldReconnect) setQr(null);
    }
  }, []);

  useEffect(() => {
    const token = session?.accessToken;
    if (!token) {
      setStatusLine('Inicie sessão para configurar o WhatsApp.');
      setSockOk(false);
      return;
    }

    let sock: ReturnType<typeof ensureSocket>;

    try {
      sock = ensureSocket(token);
    } catch (e) {
      setStatusLine('Não foi possível iniciar a conexão.');
      setLastErr(e instanceof Error ? e.message : String(e));
      setSockOk(false);
      return;
    }

    const onQr = (q: string) => {
      setQr(q);
      setStatusLine('Escaneie o QR ou use o código de pareamento abaixo.');
    };

    const onSocketConnect = () => {
      setSockOk(true);
      setLastErr(null);
      setStatusLine('Ligação pronta. Siga os passos abaixo para vincular o WhatsApp.');
      sock.emit('whatsapp-sync');
    };

    const onConnectError = (err: Error) => {
      setSockOk(false);
      const msg = err?.message || 'Falha de rede';
      setLastErr(msg);
      setStatusLine(
        'Sem ligação com o Estou Vivo. Confira a internet e se o endereço na instalação está certo.',
      );
    };

    const onDisconnect = (reason: string) => {
      setSockOk(false);
      setLastErr(reason || 'Desconectado');
    };

    const onPairingCode = (code: string) => {
      setPairLoading(false);
      setPairErr(null);
      setCodeCopied(false);
      setPairCode(typeof code === 'string' ? code : String(code));
      setStatusLine('Código gerado. Abra o WhatsApp e use “Conectar com número de telefone”.');
    };

    const onPairingError = (msg: string) => {
      setPairLoading(false);
      setPairErr(typeof msg === 'string' ? msg : String(msg));
    };

    sock.on('whatsapp-qr', onQr);
    sock.on('whatsapp-status', applyStatus);
    sock.on('connect', onSocketConnect);
    sock.on('connect_error', onConnectError);
    sock.on('disconnect', onDisconnect);
    sock.on('whatsapp-pairing-code', onPairingCode);
    sock.on('whatsapp-pairing-error', onPairingError);

    if (sock.connected) {
      onSocketConnect();
    }

    return () => {
      sock.off('whatsapp-qr', onQr);
      sock.off('whatsapp-status', applyStatus);
      sock.off('connect', onSocketConnect);
      sock.off('connect_error', onConnectError);
      sock.off('disconnect', onDisconnect);
      sock.off('whatsapp-pairing-code', onPairingCode);
      sock.off('whatsapp-pairing-error', onPairingError);
    };
  }, [applyStatus, socketEpoch, session?.accessToken]);

  const requestPairing = useCallback(() => {
    setPairErr(null);
    setPairCode(null);
    const normalized = normalizeToBrazilE164(phoneLocal);
    if (!normalized) {
      setPairErr('Digite DDD + celular. Ex.: (11) 98765-4321.');
      return;
    }
    setPairLoading(true);
    try {
      const token = session?.accessToken;
      if (!token) {
        setPairLoading(false);
        setPairErr('Sessão inválida. Entre novamente.');
        return;
      }
      const sock = ensureSocket(token);
      sock.emit('whatsapp-request-pairing', { phone: normalized });
    } catch (e) {
      setPairLoading(false);
      setPairErr(e instanceof Error ? e.message : String(e));
    }
  }, [phoneLocal, session?.accessToken]);

  const reconnect = () => {
    disconnectSocket();
    setLastErr(null);
    setPairCode(null);
    setPairErr(null);
    setCodeCopied(false);
    setStatusLine('Atualizando conexão…');
    setSocketEpoch((e) => e + 1);
  };

  const copyPairCode = useCallback(async () => {
    if (!pairCode) return;
    await Clipboard.setStringAsync(pairCode);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCodeCopied(true);
    if (copyResetRef.current) clearTimeout(copyResetRef.current);
    copyResetRef.current = setTimeout(() => setCodeCopied(false), 2500);
  }, [pairCode]);

  const copyQrPayload = useCallback(async () => {
    if (!qr) return;
    await Clipboard.setStringAsync(qr);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setQrCopied(true);
    if (qrCopyResetRef.current) clearTimeout(qrCopyResetRef.current);
    qrCopyResetRef.current = setTimeout(() => setQrCopied(false), 2500);
  }, [qr]);

  useEffect(() => {
    return () => {
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
      if (qrCopyResetRef.current) clearTimeout(qrCopyResetRef.current);
    };
  }, []);

  const configMissing = !session?.accessToken;
  const serverOk = sockOk === true;
  const serverPending = sockOk === null;

  const socketErrBox = useMemo(
    () => (lastErr ? socketErrorPresentation(lastErr) : null),
    [lastErr],
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={[...gradients.screenDawn]} style={styles.flex}>
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={14} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Voltar</Text>
          </Pressable>
          <Text style={styles.topTitle}>WhatsApp para alertas</Text>
          <View style={{ width: 72 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="chatbubbles" size={36} color={colors.darkTeal} />
            </View>
            <Text style={styles.heroTitle}>Por que conectar?</Text>
            <Text style={styles.heroLead}>
              Quando o prazo do seu check-in passar sem confirmação, o app avisa seus contatos de
              confiança por WhatsApp. Uma conta do WhatsApp precisa ficar ligada ao Estou Vivo —
              é ela que envia as mensagens quando for preciso.
            </Text>
          </View>

          {configMissing ? (
            <View style={styles.warnCard}>
              <Ionicons name="shield-outline" size={22} color={colors.warningAmber} />
              <Text style={styles.warnTitle}>Configuração necessária</Text>
              <Text style={styles.warnBody}>
                O app ainda não está configurado para se ligar ao Estou Vivo (instalação
                incompleta). Peça ajuda a quem instalou o aplicativo ou ao suporte.
              </Text>
            </View>
          ) : null}

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: serverOk ? colors.safeGreen : serverPending ? '#c4c0cc' : colors.warningAmber,
                  },
                ]}
              />
              <View style={styles.statusTextCol}>
                <Text style={styles.statusLabel}>Ligação Estou Vivo</Text>
                <Text style={styles.statusValue}>
                  {serverPending
                    ? 'Conectando…'
                    : serverOk
                      ? 'Conectado'
                      : 'Sem conexão'}
                </Text>
              </View>
            </View>
            <View style={[styles.statusRow, { marginTop: 14 }]}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: waConnected ? colors.safeGreen : '#c4c0cc',
                  },
                ]}
              />
              <View style={styles.statusTextCol}>
                <Text style={styles.statusLabel}>WhatsApp</Text>
                <Text style={styles.statusValue}>
                  {waConnected ? 'Conta vinculada e pronta' : 'Aguardando pareamento'}
                </Text>
              </View>
            </View>
          </View>

          {socketErrBox && !configMissing ? (
            <View style={styles.errBox}>
              <Text style={styles.errTitle}>{socketErrBox.title}</Text>
              <Text style={styles.errTxt} selectable>
                {socketErrBox.detail}
              </Text>
              <Text style={styles.errHint}>{socketErrBox.hint}</Text>
            </View>
          ) : null}

          {waConnected ? (
            <LinearGradient
              colors={[...gradients.safe]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successCard}
            >
              <Ionicons name="checkmark-circle" size={32} color="#fff" style={styles.successIcon} />
              <Text style={styles.successTitle}>Tudo certo</Text>
              <Text style={styles.successBody}>
                Os alertas para os seus contatos podem ser enviados por esta conta quando for
                necessário. Você pode voltar à tela inicial com tranquilidade.
              </Text>
            </LinearGradient>
          ) : null}

          {!waConnected && !configMissing ? (
            <View style={styles.stepCard}>
              <Text style={styles.stepBadge}>Passo 1</Text>
              <Text style={styles.stepTitle}>Neste celular (sem QR)</Text>
              <Text style={styles.stepBody}>
                Abra o WhatsApp → Configurações → Aparelhos conectados → Conectar um aparelho →{' '}
                <Text style={styles.stepBold}>Conectar com número de telefone</Text>. Use abaixo o{' '}
                <Text style={styles.stepBold}>mesmo número</Text> da sua conta neste aparelho (com
                DDD; o +55 já está fixo). Se o app disser que o número está errado, confira o 9 após o
                DDD.
              </Text>
              <Text style={styles.fieldHint}>{BR_PHONE_HELPER}</Text>
              <BrazilPhoneField
                valueLocalDigits={phoneLocal}
                onChangeLocalDigits={setPhoneLocal}
                editable={!pairLoading && serverOk}
              />
              <Pressable
                style={[styles.btnPrimary, (pairLoading || !serverOk) && styles.btnDisabled]}
                onPress={requestPairing}
                disabled={pairLoading || !serverOk}
              >
                {pairLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnTxt}>Gerar código de pareamento</Text>
                )}
              </Pressable>
              {pairErr ? (
                <View>
                  <Text style={styles.pairErr}>{pairErr}</Text>
                  <Text style={styles.pairErrHint}>
                    Verifique a internet. Em WhatsApp para alertas, confirme que a ligação ao servidor
                    está verde e toque em “Atualizar conexão” se precisar.
                  </Text>
                </View>
              ) : null}
              {pairCode ? (
                <View style={styles.codeBox}>
                  <Text style={styles.codeLabel}>Seu código</Text>
                  <Text style={styles.codeValue} selectable>
                    {pairCode}
                  </Text>
                  <Pressable
                    style={[styles.btnCopy, codeCopied && styles.btnCopyDone]}
                    onPress={() => void copyPairCode()}
                  >
                    <Text style={[styles.btnCopyTxt, codeCopied && styles.btnCopyTxtDone]}>
                      {codeCopied ? 'Copiado!' : 'Copiar código'}
                    </Text>
                  </Pressable>
                  <Text style={styles.codeHint}>
                    Cole ou digite no WhatsApp quando for pedido.
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {qr && !waConnected && !configMissing ? (
            <>
              <View style={styles.stepCardMuted}>
                <Text style={styles.stepBadgeMuted}>Passo 2</Text>
                <Text style={styles.stepTitle}>Outro aparelho ou tela</Text>
                <Text style={styles.stepBody}>
                  Escaneie o código abaixo com o celular onde está o WhatsApp que deve enviar os
                  alertas — use a mesma conta que você quer usar para o Estou Vivo.
                </Text>
              </View>
              <View style={styles.qrSection}>
                <View style={styles.qrBox}>
                  <QRCode value={qr} size={220} />
                </View>
                <Pressable
                  style={[styles.btnCopyQr, qrCopied && styles.btnCopyDone]}
                  onPress={() => void copyQrPayload()}
                >
                  <Text style={[styles.btnCopyTxt, qrCopied && styles.btnCopyTxtDone]}>
                    {qrCopied ? 'Copiado!' : 'Copiar dados do QR'}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}

          {!configMissing ? (
            <Pressable style={styles.btnGhost} onPress={reconnect}>
              <Text style={styles.btnGhostTxt}>Atualizar conexão</Text>
            </Pressable>
          ) : null}

          <Text style={styles.footerStatus}>{statusLine}</Text>

          <View style={{ height: 28 }} />
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  backTxt: { fontSize: 16, color: colors.darkTeal, fontWeight: '600' },
  topTitle: { fontSize: 17, fontWeight: '700', color: colors.fabulousDeep },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  hero: { alignItems: 'center', marginBottom: 22 },
  heroIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(78, 205, 196, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.fabulousDeep,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  heroLead: {
    fontSize: 15,
    color: colors.warmGray,
    lineHeight: 23,
    textAlign: 'center',
  },
  warnCard: {
    backgroundColor: 'rgba(244, 162, 97, 0.14)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 162, 97, 0.4)',
    gap: 8,
  },
  warnTitle: { fontSize: 16, fontWeight: '700', color: colors.fabulousDeep },
  warnBody: { fontSize: 14, color: colors.warmGray, lineHeight: 21 },
  statusCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(44, 122, 123, 0.18)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  statusTextCol: { flex: 1 },
  statusLabel: { fontSize: 12, fontWeight: '600', color: '#8a8298', marginBottom: 2 },
  statusValue: { fontSize: 16, fontWeight: '700', color: colors.fabulousDeep },
  errBox: {
    backgroundColor: 'rgba(230, 57, 70, 0.08)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 70, 0.2)',
  },
  errTitle: { fontSize: 15, fontWeight: '700', color: colors.dangerRed, marginBottom: 6 },
  errTxt: { fontSize: 13, color: '#5c5668', lineHeight: 19 },
  errHint: { fontSize: 12, color: '#7a7388', marginTop: 10, lineHeight: 18 },
  successCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    alignItems: 'center',
  },
  successIcon: { marginBottom: 8 },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8 },
  successBody: { fontSize: 15, color: 'rgba(255,255,255,0.95)', lineHeight: 22, textAlign: 'center' },
  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.28)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  stepCardMuted: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  stepBadge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    color: colors.darkTeal,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  stepBadgeMuted: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    color: '#8a8298',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fabulousDeep,
    marginBottom: 8,
  },
  stepBody: { fontSize: 14, color: '#5c5668', lineHeight: 22, marginBottom: 8 },
  stepBold: { fontWeight: '700', color: colors.darkTeal },
  fieldHint: { fontSize: 12, color: '#8a8298', marginBottom: 10 },
  btnPrimary: {
    alignSelf: 'stretch',
    backgroundColor: colors.darkTeal,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  btnDisabled: { opacity: 0.55 },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  pairErr: { marginTop: 10, fontSize: 13, color: colors.dangerRed },
  pairErrHint: { marginTop: 8, fontSize: 12, color: '#7a7388', lineHeight: 18 },
  codeBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(78,205,196,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.35)',
  },
  codeLabel: { fontSize: 12, fontWeight: '600', color: colors.darkTeal, marginBottom: 4 },
  codeValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 4,
    color: colors.fabulousDeep,
    fontVariant: ['tabular-nums'],
  },
  btnCopy: {
    alignSelf: 'stretch',
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primaryGreen,
  },
  btnCopyDone: { backgroundColor: colors.safeGreen },
  btnCopyTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  btnCopyTxtDone: { color: '#fff' },
  btnCopyQr: {
    alignSelf: 'stretch',
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primaryGreen,
  },
  codeHint: { fontSize: 12, color: '#6a6378', marginTop: 10, lineHeight: 18 },
  qrSection: { alignItems: 'center', width: '100%', marginBottom: 8 },
  qrBox: { padding: 16, backgroundColor: '#fff', borderRadius: 18, elevation: 2 },
  btnGhost: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnGhostTxt: { fontSize: 15, fontWeight: '600', color: colors.darkTeal },
  footerStatus: {
    fontSize: 13,
    color: '#8a8298',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 19,
  },
});
