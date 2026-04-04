import * as LocalAuthentication from 'expo-local-authentication';

/** Aparelho com biometria configurada (Face ID, Touch ID, impressão digital, etc.). */
export async function isBiometricLoginAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;
  return LocalAuthentication.isEnrolledAsync();
}

export const BIOMETRIC_UNLOCK_PROMPT = 'Desbloquear o Estou Vivo';
