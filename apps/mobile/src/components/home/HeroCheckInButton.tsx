import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { FabulousCenterMark } from './FabulousCenterMark';
import { OrbitingCarousel } from './OrbitingCarousel';
import { PaperStackLayers } from './PaperStackLayers';

type Props = {
  size: number;
  gradient: readonly [string, string];
  /** Título principal no botão. */
  title: string;
  /** Subtítulo curto (sem emoji). */
  subtitle?: string;
  /** Marca central geométrica (cicla 0–4). */
  centerVariant: number;
  onPress: () => void;
  paperActive: boolean;
  /** Check-in já registrado e prazo longe — mostra ✓ e não aceita novo toque. */
  mode?: 'action' | 'validated';
};

export function HeroCheckInButton({
  size,
  gradient,
  title,
  subtitle,
  centerVariant,
  onPress,
  paperActive,
  mode = 'action',
}: Props) {
  const pulse = useSharedValue(1);
  const press = useSharedValue(1);
  const validated = mode === 'validated';

  useEffect(() => {
    if (validated) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(withTiming(1.042, { duration: 1700 }), withTiming(1, { duration: 1700 })),
      -1,
      true,
    );
  }, [pulse, validated]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value * press.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [1, 1.042], [0.35, 0.55]),
    transform: [{ scale: interpolate(pulse.value, [1, 1.042], [1, 1.08]) }],
  }));

  const ringR = size / 2 + 30;
  const stageSize = ringR * 2 + 8;
  const glowPad = 28;

  return (
    <View style={[styles.stage, { width: stageSize, height: stageSize }]}>
      <View style={styles.carouselSlot}>
        <OrbitingCarousel radius={ringR} />
      </View>
      <View style={styles.paperSlot}>
        <PaperStackLayers size={size + 10} active={validated ? false : paperActive} />
      </View>

      <View style={styles.centerOverlay}>
        <View style={[styles.heroCluster, { width: size + glowPad, height: size + glowPad }]}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glow,
              glowStyle,
              {
                width: size + glowPad,
                height: size + glowPad,
                borderRadius: (size + glowPad) / 2,
              },
            ]}
          />
          <Pressable
            onPress={validated ? undefined : onPress}
            disabled={validated}
            accessibilityState={{ disabled: validated }}
            accessibilityHint={
              validated ? 'Check-in já registrado. Novo lembrete quando faltar menos tempo.' : undefined
            }
            onPressIn={() => {
              if (validated) return;
              press.value = withSpring(0.96, { damping: 15, stiffness: 400 });
            }}
            onPressOut={() => {
              press.value = withSpring(1, { damping: 12, stiffness: 320 });
            }}
            style={styles.pressArea}
          >
            <Animated.View style={wrapStyle}>
              <LinearGradient
                colors={[...gradient]}
                style={[styles.btn, { width: size, height: size, borderRadius: size / 2 }]}
              >
                {validated ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={Math.max(36, size * 0.26)}
                    color="rgba(255,255,255,0.92)"
                    style={styles.checkIcon}
                  />
                ) : (
                  <FabulousCenterMark size={size} variant={centerVariant} />
                )}
                <Text style={[styles.btnTxt, { fontSize: Math.max(13, size * 0.09) }]}>{title}</Text>
                {subtitle ? (
                  <Text style={[styles.btnSub, { fontSize: Math.max(11, size * 0.065) }]}>{subtitle}</Text>
                ) : null}
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselSlot: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  paperSlot: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  heroCluster: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(78,205,196,0.35)',
    zIndex: 0,
  },
  pressArea: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  btnTxt: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 4,
    textAlign: 'center',
  },
  btnSub: {
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  checkIcon: {
    marginBottom: 2,
  },
});
