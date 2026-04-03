import { Platform } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { buildEstouVivoWidgetTree } from './EstouVivoAndroidWidget';

if (Platform.OS === 'android') {
  registerWidgetTaskHandler(async ({ widgetAction, renderWidget }) => {
    if (widgetAction === 'WIDGET_DELETED') return;
    const tree = await buildEstouVivoWidgetTree();
    renderWidget(tree);
  });
}
