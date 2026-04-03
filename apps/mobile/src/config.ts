import Constants from 'expo-constants';

type Extra = { serverUrl?: string; clientToken?: string };

const extra = Constants.expoConfig?.extra as Extra | undefined;

export const SERVER_URL =
  extra?.serverUrl ??
  process.env.EXPO_PUBLIC_SERVER_URL ??
  'http://localhost:3000';

export const CLIENT_TOKEN =
  extra?.clientToken ?? process.env.EXPO_PUBLIC_CLIENT_TOKEN ?? '';
