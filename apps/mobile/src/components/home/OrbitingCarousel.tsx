import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme';

const DOT_COLORS = [
  colors.primaryGreen,
  colors.fabulousLavender,
  colors.safeGreen,
  colors.darkTeal,
] as const;

type Props = {
  radius: number;
  paused?: boolean;
};

export function OrbitingCarousel({ radius, paused = false }: Props) {
  const spin = useSharedValue(0);

  useEffect(() => {
    if (paused) return;
    spin.value = withRepeat(
      withTiming(360, { duration: 22000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [paused, spin]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${spin.value}deg` }],
  }));

  const size = radius * 2 + 56;
  const cx = size / 2;
  const dot = 9;

  return (
    <View style={[styles.hub, { width: size, height: size }]} pointerEvents="none">
      <Animated.View style={[styles.ring, { width: size, height: size }, ringStyle]}>
        {DOT_COLORS.map((bg, i) => {
          const deg = (360 / DOT_COLORS.length) * i;
          return (
            <View
              key={i}
              style={[
                styles.face,
                {
                  left: cx - dot,
                  top: cx - dot,
                  width: dot * 2,
                  height: dot * 2,
                  transform: [{ rotateZ: `${deg}deg` }, { translateY: -radius }],
                },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: bg }]} />
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  hub: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'relative',
  },
  face: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    opacity: 0.85,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.65)',
  },
});
