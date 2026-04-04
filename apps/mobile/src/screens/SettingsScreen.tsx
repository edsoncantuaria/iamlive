import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlive } from '../context/AliveContext';
import {
  notificationsUnavailableInExpoGoAndroid,
  runNotificationSelfTest,
} from '../lib/notifications';
import { DEFAULT_REMINDER_IDS, REMINDER_OPTIONS, type ReminderOffsetId } from '../lib/reminderOffsets';
import type { AppStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import * as authStorage from '../lib/authStorage';
import { isBiometricLoginAvailable } from '../lib/biometric';
import { colors, gradients } from '../theme';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const REMINDER_ICON: Record<ReminderOffsetId, keyof typeof Ionicons.glyphMap> = {
  '24h': 'calendar-outline',
  '12h': 'sunny-outline',
  '10h': 'partly-sunny-outline',
  '6h': 'cloud-outline',
  '1h': 'hourglass-outline',
  '10m': 'alarm-outline',
  at_deadline: 'flag-outline',
};

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { session, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const { config, setIntervalDays, setMessage, reminderIds, setReminderIds } = useAlive();
  const [days, setDays] = useState(String(config.intervalDays));
  const [msg, setMsg] = useState(config.emergencyMessage);
  const [savedInterval, setSavedInterval] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioProtectSession, setBioProtectSession] = useState(false);
  const intervalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const ok = await isBiometricLoginAvailable();
        setBioAvailable(ok);
        setBioProtectSession(await authStorage.getUseBiometricForToken());
      })();
    }, []),
  );

  const flashSaved = useCallback(
    (which: 'interval' | 'message') => {
      if (which === 'interval') {
        setSavedInterval(true);
        if (intervalTimer.current) clearTimeout(intervalTimer.current);
        intervalTimer.current = setTimeout(() => setSavedInterval(false), 2200);
      } else {
        setSavedMessage(true);
        if (messageTimer.current) clearTimeout(messageTimer.current);
        messageTimer.current = setTimeout(() => setSavedMessage(false), 2200);
      }
    },
    [],
  );

  useEffect(() => {
    setDays(String(config.intervalDays));
    setMsg(config.emergencyMessage);
  }, [config.intervalDays, config.emergencyMessage]);

  useEffect(() => {
    return () => {
      if (intervalTimer.current) clearTimeout(intervalTimer.current);
      if (messageTimer.current) clearTimeout(messageTimer.current);
    };
  }, []);

  const dayNum = parseInt(days, 10);
  const validDays = Number.isFinite(dayNum) && dayNum >= 1 && dayNum <= 365;

  const bumpDays = (delta: number) => {
    const n = Number.isFinite(dayNum) ? dayNum : config.intervalDays;
    const next = Math.min(365, Math.max(1, n + delta));
    setDays(String(next));
  };

  const saveInterval = async () => {
    const n = parseInt(days, 10);
    if (!Number.isFinite(n) || n < 1 || n > 365) {
      Alert.alert('Intervalo inválido', 'Use um número entre 1 e 365 dias.');
      return;
    }
    await setIntervalDays(n);
    flashSaved('interval');
  };

  const saveEmergencyMessage = async () => {
    await setMessage(msg);
    flashSaved('message');
  };

  const activeReminderCount = reminderIds.length;

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
          <Text style={styles.topTitle}>Configurações</Text>
          <View style={{ width: 72 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="options" size={34} color={colors.darkTeal} />
            </View>
            <Text style={styles.heroTitle}>Como você quer ser lembrado</Text>
            <Text style={styles.heroBody}>
              Ajuste o tempo entre check-ins, os avisos no celular e a mensagem que as pessoas de
              confiança recebem se o prazo passar sem confirmação.
            </Text>
          </View>

          {notificationsUnavailableInExpoGoAndroid ? (
            <View style={styles.notice}>
              <Ionicons name="information-circle" size={22} color={colors.darkTeal} />
              <View style={styles.noticeTextCol}>
                <Text style={styles.noticeTitle}>Sobre os lembretes neste Android</Text>
                <Text style={styles.noticeBody}>
                  Neste modo de teste, os avisos no celular podem não aparecer. Quando instalar o
                  app pelo jeito habitual (loja ou arquivo oficial), os lembretes costumam
                  funcionar melhor. O restante do app e o WhatsApp seguem normais.
                </Text>
              </View>
            </View>
          ) : null}

          {/* Check-in */}
          <Text style={styles.kicker}>Check-in</Text>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="timer-outline" size={22} color={colors.darkTeal} />
              <Text style={styles.cardTitle}>Prazo entre confirmações</Text>
            </View>
            <Text style={styles.cardLead}>
              Quantos dias você pode ficar sem tocar no botão antes do limite “estourar” e os
              contatos serem avisados.
            </Text>

            <View style={styles.stepperBlock}>
              <Text style={styles.stepperLabel}>Dias</Text>
              <View style={styles.stepperRow}>
                <Pressable
                  style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
                  onPress={() => bumpDays(-1)}
                  accessibilityLabel="Menos um dia"
                >
                  <Ionicons name="remove" size={22} color={colors.darkTeal} />
                </Pressable>
                <TextInput
                  value={days}
                  onChangeText={setDays}
                  keyboardType="number-pad"
                  maxLength={3}
                  style={styles.stepperInput}
                  placeholder="3"
                  placeholderTextColor="#9ca3af"
                />
                <Pressable
                  style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
                  onPress={() => bumpDays(1)}
                  accessibilityLabel="Mais um dia"
                >
                  <Ionicons name="add" size={22} color={colors.darkTeal} />
                </Pressable>
              </View>
              <Text style={styles.stepperHint}>Entre 1 e 365 dias</Text>
            </View>

            <Pressable
              style={[styles.primaryBtn, !validDays && styles.primaryBtnDisabled]}
              onPress={() => void saveInterval()}
              disabled={!validDays}
            >
              <LinearGradient
                colors={[...gradients.safe]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryGrad}
              >
                <Text style={styles.primaryTxt}>Guardar intervalo</Text>
              </LinearGradient>
            </Pressable>
            {savedInterval ? (
              <View style={styles.savedRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.safeGreen} />
                <Text style={styles.savedHint}>Intervalo guardado</Text>
              </View>
            ) : null}
          </View>

          {/* Lembretes */}
          <Text style={styles.kicker}>Lembretes no celular</Text>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="notifications-outline" size={22} color={colors.darkTeal} />
              <Text style={styles.cardTitle}>Antes do prazo</Text>
            </View>
            <Text style={styles.cardLead}>
              {activeReminderCount} de {REMINDER_OPTIONS.length} avisos ativos — escolha quando quer
              ser chamado à atenção para abrir o app.
            </Text>

            {REMINDER_OPTIONS.map((opt, i) => (
              <View
                key={opt.id}
                style={[styles.reminderRow, i === REMINDER_OPTIONS.length - 1 && styles.reminderRowLast]}
              >
                <View style={styles.reminderIconBox}>
                  <Ionicons name={REMINDER_ICON[opt.id]} size={18} color={colors.darkTeal} />
                </View>
                <View style={styles.reminderTextCol}>
                  <Text style={styles.reminderLabel}>{opt.label}</Text>
                  <Text style={styles.reminderSub}>
                    {opt.id === 'at_deadline'
                      ? 'No instante em que o prazo acaba'
                      : `${opt.shortLabel} antes do limite`}
                  </Text>
                </View>
                <Switch
                  value={reminderIds.includes(opt.id)}
                  onValueChange={(on) => {
                    const next: ReminderOffsetId[] = on
                      ? [...new Set([...reminderIds, opt.id])]
                      : reminderIds.filter((x) => x !== opt.id);
                    void setReminderIds(next);
                  }}
                  trackColor={{ false: '#d1d5db', true: 'rgba(78,205,196,0.5)' }}
                  thumbColor={reminderIds.includes(opt.id) ? colors.darkTeal : '#f4f4f5'}
                />
              </View>
            ))}

            <View style={styles.reminderActions}>
              <Pressable
                onPress={() => void setReminderIds([...DEFAULT_REMINDER_IDS])}
                style={styles.ghostChip}
              >
                <Text style={styles.ghostChipTxt}>Ativar todos</Text>
              </Pressable>
              <Pressable onPress={() => void setReminderIds([])} style={styles.ghostChip}>
                <Text style={styles.ghostChipTxt}>Desativar todos</Text>
              </Pressable>
            </View>

            {!notificationsUnavailableInExpoGoAndroid ? (
              <Pressable
                style={styles.testNotifBtn}
                onPress={() => {
                  void (async () => {
                    const r = await runNotificationSelfTest();
                    const lines: string[] = [];
                    if (r.localOk) {
                      lines.push('Foi agendada uma notificação local daqui a 2 segundos.');
                    } else if (r.localError) {
                      lines.push(`Local: ${r.localError}`);
                    }
                    if (r.expoPushToken) {
                      lines.push(
                        `Token Expo Push (primeiros caracteres): ${r.expoPushToken.slice(0, 28)}…`,
                      );
                    } else if (r.expoPushError) {
                      lines.push(
                        `Expo Push (opcional): ${r.expoPushError}\n\nIsto é normal se as credenciais FCM/APNs ainda não estiverem ligadas no EAS.`,
                      );
                    }
                    Alert.alert(
                      'Teste de notificações',
                      lines.length > 0
                        ? lines.join('\n\n')
                        : 'Nada a reportar.',
                      [{ text: 'OK' }],
                    );
                  })();
                }}
              >
                <Ionicons name="send-outline" size={18} color={colors.darkTeal} />
                <Text style={styles.testNotifTxt}>Testar notificação (local + Expo Push)</Text>
              </Pressable>
            ) : null}
            <Text style={styles.testNotifHint}>
              O teste local confirma som e canal no aparelho. O token Expo Push valida o projeto no
              Expo; o envio pelo vosso servidor ainda não está ligado no código.
            </Text>
          </View>

          {/* Mensagem */}
          <Text style={styles.kicker}>Emergência</Text>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.darkTeal} />
              <Text style={styles.cardTitle}>Mensagem aos contatos</Text>
            </View>
            <Text style={styles.cardLead}>
              Este texto é enviado por WhatsApp se o prazo expirar e você não tiver confirmado que
              está bem.
            </Text>
            <TextInput
              value={msg}
              onChangeText={setMsg}
              multiline
              numberOfLines={6}
              style={styles.textArea}
              placeholder="Escreva com o seu tom — as pessoas vão entender o contexto."
              placeholderTextColor="#9ca3af"
            />
            <Pressable style={styles.primaryBtn} onPress={() => void saveEmergencyMessage()}>
              <LinearGradient
                colors={[...gradients.safe]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryGrad}
              >
                <Text style={styles.primaryTxt}>Guardar mensagem</Text>
              </LinearGradient>
            </Pressable>
            {savedMessage ? (
              <View style={styles.savedRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.safeGreen} />
                <Text style={styles.savedHint}>Mensagem guardada</Text>
              </View>
            ) : null}
          </View>

          {/* Atalhos */}
          <Text style={styles.kicker}>Atalhos</Text>
          <View style={styles.card}>
            <Pressable
              style={styles.linkRow}
              onPress={() => navigation.navigate('Contacts')}
              accessibilityRole="button"
              accessibilityLabel="Abrir contatos de confiança"
            >
              <View style={styles.linkIcon}>
                <Ionicons name="people-outline" size={22} color={colors.darkTeal} />
              </View>
              <View style={styles.linkTextCol}>
                <Text style={styles.linkTitle}>Contatos de confiança</Text>
                <Text style={styles.linkSub}>Quem recebe avisos e mensagens</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
            <View style={styles.linkSep} />
            <Pressable
              style={styles.linkRow}
              onPress={() => navigation.navigate('WhatsApp')}
              accessibilityRole="button"
              accessibilityLabel="Estou Vivo — conexão no WhatsApp"
            >
              <View style={styles.linkIcon}>
                <Ionicons name="logo-whatsapp" size={22} color={colors.darkTeal} />
              </View>
              <View style={styles.linkTextCol}>
                <Text style={styles.linkTitle}>Estou Vivo</Text>
                <Text style={styles.linkSub}>Conexão com o Estou Vivo no WhatsApp…</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>

          {bioAvailable ? (
            <>
              <Text style={styles.kicker}>Segurança</Text>
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="finger-print-outline" size={22} color={colors.darkTeal} />
                  <Text style={styles.cardTitle}>Biometria</Text>
                </View>
                <Text style={styles.cardLead}>
                  Ao abrir o app, pedimos Face ID, Touch ID ou impressão digital para aceder ao
                  token da sessão (continua a precisar de e-mail e senha noutro aparelho).
                </Text>
                <View style={[styles.reminderRow, styles.reminderRowLast]}>
                  <View style={styles.reminderTextCol}>
                    <Text style={styles.reminderLabel}>Proteger sessão neste celular</Text>
                    <Text style={styles.reminderSub}>
                      Recomendado se só você usa este aparelho
                    </Text>
                  </View>
                  <Switch
                    value={bioProtectSession}
                    onValueChange={(on) => {
                      void (async () => {
                        try {
                          await authStorage.setUseBiometricForToken(on);
                          setBioProtectSession(on);
                          if (session?.accessToken) {
                            await authStorage.setAccessToken(session.accessToken);
                          }
                        } catch (e) {
                          Alert.alert(
                            'Biometria',
                            e instanceof Error
                              ? e.message
                              : 'Não foi possível atualizar a proteção.',
                          );
                          setBioProtectSession(await authStorage.getUseBiometricForToken());
                        }
                      })();
                    }}
                    trackColor={{ false: '#d1d5db', true: 'rgba(78,205,196,0.5)' }}
                    thumbColor={bioProtectSession ? colors.darkTeal : '#f4f4f5'}
                  />
                </View>
              </View>
            </>
          ) : null}

          <Text style={styles.kicker}>Conta</Text>
          <View style={styles.card}>
            <Text style={styles.accountEmail}>
              {session?.user.email ?? 'Conta ligada ao Estou Vivo'}
            </Text>
            <Pressable
              style={styles.signOutBtn}
              onPress={() => {
                Alert.alert(
                  'Sair',
                  'Vai terminar a sessão neste dispositivo. Os lembretes locais continuam; para alterar o WhatsApp no servidor, volte a entrar.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Sair',
                      style: 'destructive',
                      onPress: () => void signOut(),
                    },
                  ],
                );
              }}
            >
              <Text style={styles.signOutTxt}>Terminar sessão</Text>
            </Pressable>
          </View>

          <View style={{ height: 32 }} />
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
    paddingBottom: 10,
  },
  backBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  backTxt: { fontSize: 16, color: colors.darkTeal, fontWeight: '600' },
  topTitle: { fontSize: 17, fontWeight: '700', color: colors.fabulousDeep },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 22 },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.fabulousDeep,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  heroBody: {
    fontSize: 15,
    color: colors.warmGray,
    lineHeight: 23,
    textAlign: 'center',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(78, 205, 196, 0.14)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(44, 122, 123, 0.22)',
  },
  noticeTextCol: { flex: 1 },
  noticeTitle: { fontSize: 14, fontWeight: '700', color: colors.darkTeal, marginBottom: 6 },
  noticeBody: { fontSize: 13, color: colors.warmGray, lineHeight: 20 },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#8a8298',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#4A4458',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: colors.fabulousDeep, flex: 1 },
  cardLead: {
    fontSize: 14,
    color: colors.warmGray,
    lineHeight: 21,
    marginBottom: 16,
  },
  stepperBlock: { marginBottom: 16 },
  stepperLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(78, 205, 196, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnPressed: { opacity: 0.85 },
  stepperInput: {
    minWidth: 72,
    fontSize: 28,
    fontWeight: '800',
    color: colors.fabulousDeep,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontVariant: ['tabular-nums'],
  },
  stepperHint: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 8 },
  primaryBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryGrad: { paddingVertical: 15, alignItems: 'center' },
  primaryTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  savedHint: { fontSize: 13, fontWeight: '700', color: colors.safeGreen },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: 10,
  },
  reminderRowLast: { borderBottomWidth: 0 },
  reminderIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderTextCol: { flex: 1, marginRight: 4 },
  reminderLabel: { fontSize: 15, fontWeight: '700', color: colors.fabulousDeep },
  reminderSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  reminderActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
    paddingTop: 4,
  },
  ghostChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(44, 122, 123, 0.08)',
  },
  ghostChipTxt: { fontSize: 14, fontWeight: '700', color: colors.darkTeal },
  testNotifBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(44, 122, 123, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(44, 122, 123, 0.25)',
  },
  testNotifTxt: { fontSize: 15, fontWeight: '700', color: colors.darkTeal },
  testNotifHint: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 18,
    marginTop: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
    minHeight: 140,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
    color: colors.fabulousDeep,
    lineHeight: 22,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  linkSep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 4,
  },
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(78, 205, 196, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTextCol: { flex: 1 },
  linkTitle: { fontSize: 16, fontWeight: '700', color: colors.fabulousDeep },
  linkSub: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  accountEmail: {
    fontSize: 15,
    color: colors.warmGray,
    marginBottom: 16,
    lineHeight: 22,
  },
  signOutBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 70, 0.35)',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 57, 70, 0.06)',
  },
  signOutTxt: { fontSize: 16, fontWeight: '700', color: colors.dangerRed },
});
