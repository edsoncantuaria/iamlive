/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'widget',
  name: 'EstouVivoWidget',
  displayName: 'Estou Vivo!',
  icon: '../assets/icon.png',
  frameworks: ['SwiftUI', 'WidgetKit'],
  entitlements: {
    'com.apple.security.application-groups': ['group.com.estouvivo.mobile'],
  },
};
