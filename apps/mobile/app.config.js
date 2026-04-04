/**
 * Garante que EXPO_PUBLIC_* do .env chegam ao runtime via `expo-constants` (extra).
 * @see https://docs.expo.dev/guides/environment-variables/
 */
const appJson = require('./app.json');

/** Builds EAS `production`: só HTTPS. `preview` / dev: defina EXPO_PUBLIC_ANDROID_CLEARTEXT=1 para API HTTP local. */
const allowAndroidCleartext = process.env.EXPO_PUBLIC_ANDROID_CLEARTEXT === '1';

module.exports = {
  expo: {
    ...appJson.expo,
    ios: {
      ...(appJson.expo.ios || {}),
      bundleIdentifier: 'com.estouvivo.mobile',
      entitlements: {
        'com.apple.security.application-groups': ['group.com.estouvivo.mobile'],
      },
      infoPlist: {
        ...((appJson.expo.ios && appJson.expo.ios.infoPlist) || {}),
        NSFaceIDUsageDescription:
          'O Estou Vivo usa Face ID para desbloquear a sua sessão de forma segura.',
      },
    },
    android: {
      ...(appJson.expo.android || {}),
      package: 'com.estouvivo.mobile',
      usesCleartextTraffic: allowAndroidCleartext,
    },
    plugins: [
      ...((appJson.expo && appJson.expo.plugins) || []),
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
    },
  },
};
