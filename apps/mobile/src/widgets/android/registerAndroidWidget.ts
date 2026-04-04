import { Platform } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import {
  buildEstouVivoMiniTree,
  buildEstouVivoPainelTree,
} from './EstouVivoAndroidWidget';

if (Platform.OS === 'android') {
  registerWidgetTaskHandler(async ({ widgetAction, widgetInfo, renderWidget }) => {
    if (widgetAction === 'WIDGET_DELETED') return;
    const tree =
      widgetInfo.widgetName === 'EstouVivoMini'
        ? await buildEstouVivoMiniTree()
        : await buildEstouVivoPainelTree();
    renderWidget(tree);
  });
}
