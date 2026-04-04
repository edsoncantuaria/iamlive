import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloudiveMark } from './CloudiveMark';
import { CLOUDIVE_BG, cloudiveColors } from './theme';

type Props = {
  message?: string;
};

/**
 * Carregamento (sessão, onboarding) com a mesma linha visual da splash Cloudive.
 */
export function CloudiveLoadingScreen({ message = 'Carregando…' }: Props) {
  const insets = useSafeAreaInsets();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(0.92, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      true,
    );
  }, [pulse]);

  const cardPulse = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.2 + 0.8,
  }));

  return (
    <View
      style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(78, 205, 196, 0.11)', 'transparent']}
        locations={[0, 0.5]}
        style={styles.glowTop}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      <View style={styles.body}>
        <CloudiveMark variant="loading" />

        <Animated.View style={[styles.card, cardPulse]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGrad}
          >
            <ActivityIndicator size="large" color={cloudiveColors.mint} />
            <Text style={styles.msg}>{message}</Text>
            <Text style={styles.hint}>Só um instante</Text>
          </LinearGradient>
        </Animated.View>
      </View>

      <View style={[styles.footerWrap, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Text style={styles.footer}>Cloudive</Text>
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
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '38%',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 36,
  },
  card: {
    alignSelf: 'stretch',
    maxWidth: 320,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(78, 205, 196, 0.35)',
  },
  cardGrad: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 14,
  },
  msg: {
    fontSize: 16,
    color: cloudiveColors.text,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    color: cloudiveColors.textFaint,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  footerWrap: {
    alignItems: 'center',
  },
  footer: {
    fontSize: 11,
    fontWeight: '700',
    color: cloudiveColors.textFaint,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
