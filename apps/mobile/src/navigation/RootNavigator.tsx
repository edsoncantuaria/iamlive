import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AliveProvider, useAlive } from '../context/AliveContext';
import type { AppStackParamList, AuthStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import ContactsScreen from '../screens/ContactsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WhatsAppScreen from '../screens/WhatsAppScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import * as storage from '../lib/storage';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import LegalWebScreen from '../screens/auth/LegalWebScreen';
import { CloudiveIntroSplash, CloudiveLoadingScreen } from '../components/cloudive';

/** Duração mínima da splash Cloudive em JS após esconder a splash nativa (alinha com experiência de abertura). */
const CLOUDIVE_INTRO_MS = 1500;

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <AuthStack.Screen name="Legal" component={LegalWebScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator({ userId }: { userId: string }) {
  const { ready: aliveReady } = useAlive();
  const [boot, setBoot] = useState<'loading' | 'ready'>('loading');
  const [initialRoute, setInitialRoute] = useState<'Home' | 'Onboarding'>('Home');

  useEffect(() => {
    setBoot('loading');
  }, [userId]);

  useEffect(() => {
    if (!aliveReady) return;
    let cancelled = false;
    (async () => {
      const done = await storage.loadOnboardingCompleted(userId);
      if (!cancelled) {
        setInitialRoute(done ? 'Home' : 'Onboarding');
        setBoot('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [aliveReady, userId]);

  if (!aliveReady || boot === 'loading') {
    return <CloudiveLoadingScreen message="Carregando…" />;
  }

  return (
    <AppStack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AppStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AppStack.Screen name="Home" component={HomeScreen} />
      <AppStack.Screen name="Contacts" component={ContactsScreen} />
      <AppStack.Screen name="Settings" component={SettingsScreen} />
      <AppStack.Screen name="WhatsApp" component={WhatsAppScreen} />
    </AppStack.Navigator>
  );
}

function CloudiveIntroGate({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await SplashScreen.hideAsync().catch(() => {});
      await new Promise<void>((r) => setTimeout(r, CLOUDIVE_INTRO_MS));
      if (!cancelled) setDone(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!done) {
    return <CloudiveIntroSplash />;
  }
  return <>{children}</>;
}

function Gate() {
  const { session, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <CloudiveLoadingScreen message="Carregando…" />;
  }

  if (!session) {
    return <AuthNavigator />;
  }

  return (
    <AliveProvider userId={session.user.id} sessionToken={session.accessToken}>
      <AppNavigator userId={session.user.id} />
    </AliveProvider>
  );
}

export default function RootNavigator() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <CloudiveIntroGate>
            <Gate />
          </CloudiveIntroGate>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
