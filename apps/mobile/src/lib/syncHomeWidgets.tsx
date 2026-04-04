import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppConfig } from './appState';
import { buildWidgetSnapshot } from './widgetSnapshot';
import { widgetSnapshotKeyForUser } from './storage';

const APP_GROUP = 'group.com.estouvivo.mobile';

export async function syncHomeWidgetsFromConfig(
  config: AppConfig,
  userId: string,
): Promise<void> {
  const snap = buildWidgetSnapshot(config);
  const json = JSON.stringify(snap);
  const storageKey = widgetSnapshotKeyForUser(userId);
  await AsyncStorage.setItem(storageKey, json);

  if (Platform.OS === 'ios') {
    try {
      const { ExtensionStorage } = await import('@bacons/apple-targets');
      const ext = new ExtensionStorage(APP_GROUP);
      ext.set('widget_snapshot', json);
      ExtensionStorage.reloadWidget('EstouVivoWidget');
    } catch {
      // Expo Go / módulo nativo indisponível
    }
    return;
  }

  if (Platform.OS === 'android') {
    try {
      const { requestWidgetUpdate } = await import('react-native-android-widget');
      const { buildEstouVivoMiniTree, buildEstouVivoPainelTree } = await import(
        '../widgets/android/EstouVivoAndroidWidget'
      );
      await requestWidgetUpdate({
        widgetName: 'EstouVivo',
        renderWidget: () => buildEstouVivoPainelTree(),
      });
      await requestWidgetUpdate({
        widgetName: 'EstouVivoMini',
        renderWidget: () => buildEstouVivoMiniTree(),
      });
    } catch {
      // Dev client sem widget ou erro de bridge
    }
  }
}
