/**
 * Garante que EXPO_PUBLIC_* do .env chegam ao runtime via `expo-constants` (extra).
 * @see https://docs.expo.dev/guides/environment-variables/
 */
const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    ios: {
      ...(appJson.expo.ios || {}),
      bundleIdentifier: 'com.estouvivo.mobile',
      entitlements: {
        'com.apple.security.application-groups': ['group.com.estouvivo.mobile'],
      },
    },
    android: {
      ...(appJson.expo.android || {}),
      package: 'com.estouvivo.mobile',
    },
    plugins: [
      ...((appJson.expo && appJson.expo.plugins) || []),
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
      serverUrl: process.env.EXPO_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
      clientToken: process.env.EXPO_PUBLIC_CLIENT_TOKEN ?? '',
    },
  },
};
