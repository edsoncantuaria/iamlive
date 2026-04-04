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
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authResetPassword } from '../../lib/api';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, gradients } from '../../theme';

type Nav = NativeStackNavigationProp<AuthStackParamList>;
type R = RouteProp<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const [token, setToken] = useState(params?.token ?? '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = useCallback(async () => {
    if (password.length < 8) {
      Alert.alert('Senha', 'Use pelo menos 8 caracteres.');
      return;
    }
    if (token.trim().length < 16) {
      Alert.alert('Token', 'Cole o token completo que veio no link do e-mail.');
      return;
    }
    try {
      setBusy(true);
      await authResetPassword(token, password);
      Alert.alert('Senha atualizada', 'Já pode entrar com a nova senha.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível redefinir.');
    } finally {
      setBusy(false);
    }
  }, [token, password, navigation]);

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

          <Text style={styles.title}>Nova senha</Text>
          <Text style={styles.sub}>
            Cole o token do e-mail (ou do link, a parte depois de token=) e defina a nova senha.
            Também pode usar a página web aberta pelo link no telemóvel.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Token</Text>
            <TextInput
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="token longo do e-mail"
              placeholderTextColor="#9ca3af"
              style={[styles.input, styles.inputToken]}
              multiline
            />
            <Text style={[styles.label, { marginTop: 14 }]}>Nova senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              placeholder="mín. 8 caracteres"
              placeholderTextColor="#9ca3af"
              style={styles.input}
            />
            <Pressable
              style={[styles.primaryBtn, busy && styles.disabled]}
              disabled={busy}
              onPress={() => void submit()}
            >
              <LinearGradient colors={[...gradients.safe]} style={styles.primaryGrad}>
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryTxt}>Guardar</Text>
                )}
              </LinearGradient>
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
  sub: { fontSize: 14, color: colors.warmGray, lineHeight: 21, marginBottom: 22 },
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
  inputToken: { minHeight: 88, textAlignVertical: 'top', fontSize: 13 },
  primaryBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 22 },
  disabled: { opacity: 0.55 },
  primaryGrad: { paddingVertical: 15, alignItems: 'center' },
  primaryTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
