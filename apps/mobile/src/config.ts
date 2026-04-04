import Constants from 'expo-constants';

type Extra = {
  serverUrl?: string;
};

const extra = Constants.expoConfig?.extra as Extra | undefined;

export const SERVER_URL =
  extra?.serverUrl ??
  process.env.EXPO_PUBLIC_SERVER_URL ??
  'http://localhost:3000';
