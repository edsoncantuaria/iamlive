import 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { installNotificationHandlerIfSupported } from './src/lib/notifications';
import RootNavigator from './src/navigation/RootNavigator';

installNotificationHandlerIfSupported();

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="dark" />
    </>
  );
}
