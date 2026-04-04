import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { BIOMETRIC_UNLOCK_PROMPT, isBiometricLoginAvailable } from './biometric';

const ACCESS_KEY = 'estouvivo_access_token';
const PREF_BIOMETRIC_TOKEN = 'estouvivo_pref_biometric_token';

async function shouldProtectTokenWithBiometric(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(PREF_BIOMETRIC_TOKEN);
  if (raw === '0') return false;
  if (raw === '1') return true;
  return await isBiometricLoginAvailable();
}

export async function getUseBiometricForToken(): Promise<boolean> {
  return shouldProtectTokenWithBiometric();
}

/** Preferência explícita: true = proteger, false = não proteger, null = automático (protege se houver biometria). */
export async function getStoredBiometricPreference(): Promise<boolean | null> {
  const raw = await AsyncStorage.getItem(PREF_BIOMETRIC_TOKEN);
  if (raw === '0') return false;
  if (raw === '1') return true;
  return null;
}

export async function setUseBiometricForToken(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(PREF_BIOMETRIC_TOKEN, enabled ? '1' : '0');
}

export async function setAccessToken(token: string): Promise<void> {
  const protect = await shouldProtectTokenWithBiometric();
  const canProtect = protect && (await isBiometricLoginAvailable());
  try {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
  } catch {
    /* noop */
  }
  if (canProtect) {
    await SecureStore.setItemAsync(ACCESS_KEY, token, {
      requireAuthentication: true,
      authenticationPrompt: BIOMETRIC_UNLOCK_PROMPT,
    });
  } else {
    await SecureStore.setItemAsync(ACCESS_KEY, token);
  }
}

/** Pode rejeitar se o token estiver protegido por biometria e o usuário cancelar o desafio. */
export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function clearAccessToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
  } catch {
    /* noop */
  }
}
