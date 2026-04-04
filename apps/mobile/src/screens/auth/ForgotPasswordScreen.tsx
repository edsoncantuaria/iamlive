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
import { authForgotPassword } from '../../lib/api';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, gradients } from '../../theme';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = useCallback(async () => {
    try {
      setBusy(true);
      const r = await authForgotPassword(email.trim());
      Alert.alert(
        'Pedido enviado',
        r.message ??
          'Se existir uma conta com este e-mail, receberá instruções para redefinir a senha.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar o pedido. Tente de novo.');
    } finally {
      setBusy(false);
    }
  }, [email, navigation]);

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

          <Text style={styles.title}>Recuperar senha</Text>
          <Text style={styles.sub}>
            Indique o e-mail da sua conta. Se existir e tiver senha (não só Google), enviaremos um
            link para redefinir.
          </Text>

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
            <Pressable
              style={[styles.primaryBtn, busy && styles.disabled]}
              disabled={busy}
              onPress={() => void submit()}
            >
              <LinearGradient colors={[...gradients.safe]} style={styles.primaryGrad}>
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryTxt}>Enviar instruções</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          <Pressable style={styles.linkBtn} onPress={() => navigation.navigate('ResetPassword', {})}>
            <Text style={styles.linkTxt}>Já tenho o código — redefinir no app</Text>
          </Pressable>
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
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkTxt: { fontSize: 14, fontWeight: '700', color: colors.darkTeal },
});
