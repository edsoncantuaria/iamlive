import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloudiveMark } from './CloudiveMark';
import { CLOUDIVE_BG } from './theme';

/**
 * Splash de abertura alinhada à identidade Cloudive (SVG de referência: `assets/splash-estou-vivo-static.svg`).
 */
export function CloudiveIntroSplash() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      accessibilityRole="image"
      accessibilityLabel="Cloudive, Estou Vivo"
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(78, 205, 196, 0.14)', 'transparent']}
        locations={[0, 0.45]}
        style={styles.glowTop}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />
      <View style={styles.center}>
        <CloudiveMark variant="intro" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CLOUDIVE_BG,
  },
  glowTop: {
    ...StyleSheet.absoluteFillObject,
    height: '42%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
