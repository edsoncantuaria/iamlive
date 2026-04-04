import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { installNotificationHandlerIfSupported } from './src/lib/notifications';
import RootNavigator from './src/navigation/RootNavigator';

installNotificationHandlerIfSupported();

export default function App() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="dark" />
    </>
  );
}
