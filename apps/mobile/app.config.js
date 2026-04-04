/**
 * Garante que EXPO_PUBLIC_* do .env chegam ao runtime via `expo-constants` (extra).
 * @see https://docs.expo.dev/guides/environment-variables/
 */
const appJson = require('./app.json');

/** Builds EAS `production`: só HTTPS. `preview` / dev: defina EXPO_PUBLIC_ANDROID_CLEARTEXT=1 para API HTTP local. */
const allowAndroidCleartext = process.env.EXPO_PUBLIC_ANDROID_CLEARTEXT === '1';

/** `aps-environment` no iOS: produção só no perfil EAS `production`. */
const notificationIosMode =
  process.env.EAS_BUILD_PROFILE === 'production' ? 'production' : 'development';

module.exports = {
  expo: {
    ...appJson.expo,
    ios: {
      ...(appJson.expo.ios || {}),
      ...(process.env.EXPO_APPLE_TEAM_ID
        ? { appleTeamId: process.env.EXPO_APPLE_TEAM_ID }
        : {}),
      bundleIdentifier: 'com.estouvivo.mobile',
      entitlements: {
        'com.apple.security.application-groups': ['group.com.estouvivo.mobile'],
      },
      infoPlist: {
        ...((appJson.expo.ios && appJson.expo.ios.infoPlist) || {}),
        NSFaceIDUsageDescription:
          'O Estou Vivo usa Face ID para desbloquear a sua sessão de forma segura.',
        NSUserNotificationsUsageDescription:
          'Enviamos lembretes locais antes do prazo do seu check-in, para você confirmar que está bem.',
      },
    },
    android: {
      ...(appJson.expo.android || {}),
      package: 'com.estouvivo.mobile',
      usesCleartextTraffic: allowAndroidCleartext,
      /** Alarmes em horário exato (lembretes por data). Sem isto o Android pode atrasar notificações. */
      permissions: [
        ...((appJson.expo.android && appJson.expo.android.permissions) || []),
        'android.permission.SCHEDULE_EXACT_ALARM',
      ],
    },
    plugins: [
      ...((appJson.expo && appJson.expo.plugins) || []),
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#052a2c',
          /** Deve coincidir com o canal em `src/lib/notifications.ts` (FCM/local). */
          defaultChannel: 'check-in-reminders',
          mode: notificationIosMode,
        },
      ],
      '@bacons/apple-targets',
      'expo-secure-store',
      [
        'react-native-android-widget',
        {
          widgets: [
            {
              name: 'EstouVivo',
              label: 'Estou Vivo!',
              description: 'Contagem até o próximo check-in',
              minWidth: '260dp',
              minHeight: '110dp',
              targetCellWidth: 4,
              targetCellHeight: 2,
              previewImage: './assets/icon.png',
              updatePeriodMillis: 1800000,
            },
          ],
        },
      ],
    ],
    extra: {
      /** Fallback embutido; em dev use EXPO_PUBLIC_SERVER_URL no .env para apontar ao servidor local. */
      serverUrl: process.env.EXPO_PUBLIC_SERVER_URL ?? 'https://api-ial.cloudive.com.br',
      /** Ligado ao projeto Expo (EAS não consegue escrever em app.config.js automaticamente). */
      eas: {
        projectId: 'c5e8c7ee-5d10-4614-881e-575b1e7e3046',
      },
    },
  },
};
