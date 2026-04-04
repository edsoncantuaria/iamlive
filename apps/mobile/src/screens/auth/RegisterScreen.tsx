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

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onRegister = useCallback(async () => {
    if (password.length < 8) {
      Alert.alert('Senha', 'Use pelo menos 8 caracteres.');
      return;
    }
    try {
      setBusy(true);
      await register(email.trim(), password);
    } catch (e) {
      Alert.alert('Criar conta', e instanceof Error ? e.message : 'Não foi possível registar');
    } finally {
      setBusy(false);
    }
  }, [email, password, register]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={[...gradients.screenDawn]} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable style={styles.back} onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color={colors.darkTeal} />
            <Text style={styles.backTxt}>Voltar</Text>
          </Pressable>

          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.sub}>Use o mesmo e-mail sempre que precisar recuperar o acesso.</Text>

          <View style={styles.card}>
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
            />
            <Text style={[styles.label, { marginTop: 14 }]}>Senha (mín. 8 caracteres)</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              style={styles.input}
            />

            <Pressable
              style={[styles.primaryBtn, busy && styles.disabled]}
              disabled={busy}
              onPress={() => void onRegister()}
            >
              <LinearGradient colors={[...gradients.safe]} style={styles.primaryGrad}>
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryTxt}>Registar</Text>
                )}
              </LinearGradient>
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
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  backTxt: { fontSize: 16, color: colors.darkTeal, fontWeight: '600' },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.fabulousDeep,
    marginBottom: 8,
  },
  sub: { fontSize: 15, color: colors.warmGray, lineHeight: 22, marginBottom: 22 },
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
  disabled: { opacity: 0.55 },
  primaryGrad: { paddingVertical: 15, alignItems: 'center' },
  primaryTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
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
