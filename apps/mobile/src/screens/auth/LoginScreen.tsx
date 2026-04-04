import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, gradients } from '../../theme';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { login, biometricUnlockFailed, retryBiometricUnlock, abandonBiometricUnlock } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onEmailLogin = useCallback(async () => {
    try {
      setBusy(true);
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('Login', e instanceof Error ? e.message : 'Falha no login');
    } finally {
      setBusy(false);
    }
  }, [email, password, login]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={[...gradients.screenDawn]} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="heart-outline" size={40} color={colors.darkTeal} />
            </View>
            <Text style={styles.title}>Estou Vivo</Text>
            <Text style={styles.sub}>
              Inicie sessão com e-mail e senha para ligar o app ao seu espaço seguro no servidor.
            </Text>
          </View>

          {biometricUnlockFailed ? (
            <View style={styles.bioCard}>
              <Ionicons name="finger-print-outline" size={36} color={colors.darkTeal} />
              <Text style={styles.bioTitle}>Desbloqueio com biometria</Text>
              <Text style={styles.bioBody}>
                Não foi possível confirmar a sua identidade. Tente de novo ou entre com e-mail e
                senha (a proteção por biometria será desligada até voltar a ativar nas
                configurações).
              </Text>
              <Pressable
                style={[styles.primaryBtn, busy && styles.primaryBtnDisabled]}
                disabled={busy}
                onPress={() => {
                  setBusy(true);
                  void retryBiometricUnlock().finally(() => setBusy(false));
                }}
              >
                <LinearGradient colors={[...gradients.safe]} style={styles.primaryGrad}>
                  <Text style={styles.primaryTxt}>Tentar biometria de novo</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={styles.linkBtn}
                disabled={busy}
                onPress={() => {
                  setBusy(true);
                  void abandonBiometricUnlock().finally(() => setBusy(false));
                }}
              >
                <Text style={styles.linkTxt}>Entrar com e-mail e senha</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={[styles.card, biometricUnlockFailed && styles.cardDimmed]}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="seu@email.com"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              editable={!biometricUnlockFailed}
            />
            <Text style={[styles.label, { marginTop: 14 }]}>Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              editable={!biometricUnlockFailed}
            />

            <Pressable
              style={[styles.primaryBtn, busy && styles.primaryBtnDisabled]}
              disabled={busy || biometricUnlockFailed}
              onPress={() => void onEmailLogin()}
            >
              <LinearGradient colors={[...gradients.safe]} style={styles.primaryGrad}>
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryTxt}>Entrar</Text>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.linkBtn}
              onPress={() => navigation.navigate('Register')}
              disabled={busy || biometricUnlockFailed}
            >
              <Text style={styles.linkTxt}>Criar conta com e-mail</Text>
            </Pressable>
          </View>

          <View style={styles.legalRow}>
            <Pressable onPress={() => navigation.navigate('Legal', { doc: 'privacy' })}>
              <Text style={styles.legalLink}>Privacidade</Text>
            </Pressable>
            <Text style={styles.legalSep}>·</Text>
            <Pressable onPress={() => navigation.navigate('Legal', { doc: 'terms' })}>
              <Text style={styles.legalLink}>Termos</Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 22 },
  hero: { alignItems: 'center', marginBottom: 24 },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(78, 205, 196, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.fabulousDeep,
    marginBottom: 8,
  },
  sub: { fontSize: 15, color: colors.warmGray, textAlign: 'center', lineHeight: 22 },
  bioCard: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(44, 122, 123, 0.25)',
    alignItems: 'center',
    gap: 12,
  },
  bioTitle: { fontSize: 17, fontWeight: '800', color: colors.fabulousDeep, textAlign: 'center' },
  bioBody: {
    fontSize: 14,
    color: colors.warmGray,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDimmed: { opacity: 0.45 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  label: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.fabulousDeep,
    backgroundColor: '#fafafa',
  },
  primaryBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 22 },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryGrad: { paddingVertical: 15, alignItems: 'center' },
  primaryTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkTxt: { fontSize: 15, fontWeight: '700', color: colors.darkTeal },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
  },
  legalLink: { fontSize: 14, color: colors.darkTeal, fontWeight: '600' },
  legalSep: { color: '#9ca3af' },
});
