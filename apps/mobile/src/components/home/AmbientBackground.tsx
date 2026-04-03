import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { AliveStatus } from '../../lib/appState';

const palette: Record<AliveStatus, [string, string, string, string]> = {
  neverChecked: [
    'rgba(184,169,217,0.18)',
    'rgba(78,205,196,0.15)',
    'rgba(255,216,201,0.2)',
    'rgba(85,98,112,0.08)',
  ],
  safe: [
    'rgba(6,214,160,0.2)',
    'rgba(184,169,217,0.14)',
    'rgba(78,205,196,0.16)',
    'rgba(44,122,123,0.1)',
  ],
  warning: [
    'rgba(244,162,97,0.22)',
    'rgba(255,200,180,0.18)',
    'rgba(78,205,196,0.08)',
    'rgba(231,111,81,0.1)',
  ],
  critical: [
    'rgba(230,57,70,0.2)',
    'rgba(244,162,97,0.16)',
    'rgba(184,169,217,0.14)',
    'rgba(230,57,70,0.1)',
  ],
  expired: [
    'rgba(157,2,8,0.18)',
    'rgba(230,57,70,0.18)',
    'rgba(78,205,196,0.06)',
    'rgba(107,15,26,0.12)',
  ],
};

function Blob({
  color,
  size,
  left,
  top,
  duration,
  xAmp,
  yAmp,
}: {
  color: string;
  size: number;
  left: number;
  top: number;
  duration: number;
  xAmp: number;
  yAmp: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [duration, t]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [-xAmp, xAmp]) },
      { translateY: interpolate(t.value, [0, 1], [yAmp * 0.6, -yAmp]) },
      { scale: interpolate(t.value, [0, 0.5, 1], [1, 1.04, 1]) },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left,
          top,
          backgroundColor: color,
        },
      ]}
    />
  );
}

export function AmbientBackground({ status }: { status: AliveStatus }) {
  const { width, height } = useWindowDimensions();
  const [c1, c2, c3, c4] = palette[status];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(243,232,255,0.35)', 'rgba(232,247,244,0.4)']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Blob
        color={c1}
        size={width * 0.85}
        left={-width * 0.2}
        top={height * 0.08}
        duration={14000}
        xAmp={14}
        yAmp={18}
      />
      <Blob
        color={c2}
        size={width * 0.68}
        left={width * 0.4}
        top={height * 0.36}
        duration={17000}
        xAmp={11}
        yAmp={22}
      />
      <Blob
        color={c3}
        size={width * 0.55}
        left={width * 0.05}
        top={height * 0.62}
        duration={12000}
        xAmp={18}
        yAmp={12}
      />
      <Blob
        color={c4}
        size={width * 0.4}
        left={width * 0.55}
        top={height * 0.08}
        duration={19000}
        xAmp={9}
        yAmp={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
  },
});
