import Constants from 'expo-constants';

/** API em produção (Cloudflare). `EXPO_PUBLIC_SERVER_URL` no .env continua a poder sobrepor para desenvolvimento local. */
export const DEFAULT_SERVER_URL = 'https://api-ial.cloudive.com.br';

type Extra = {
  serverUrl?: string;
};

const extra = Constants.expoConfig?.extra as Extra | undefined;

export const SERVER_URL =
  process.env.EXPO_PUBLIC_SERVER_URL ??
  extra?.serverUrl ??
  DEFAULT_SERVER_URL;
