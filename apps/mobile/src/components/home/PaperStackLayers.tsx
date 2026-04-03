import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = { size: number; active: boolean };

function PaperLayer({ size, index, active }: Props & { index: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      t.value = 0;
      return;
    }
    const stagger = index * 240;
    t.value = withDelay(
      stagger,
      withRepeat(
        withTiming(1, {
          duration: 3000 + index * 400,
          easing: Easing.bezier(0.36, 0.07, 0.25, 1),
        }),
        -1,
        true,
      ),
    );
  }, [active, index, t]);

  const baseScale = 1 - index * 0.045;

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(t.value, [0, 1], [8 + index * 3, -4 - index * 2]) },
      { rotateZ: `${interpolate(t.value, [0, 1], [-2 - index, 1])}deg` },
      { scale: baseScale },
    ],
    opacity: 0.5 - index * 0.12,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.paper,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          zIndex: -index - 1,
        },
      ]}
    />
  );
}

export function PaperStackLayers({ size, active }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]} pointerEvents="none">
      <PaperLayer size={size} index={2} active={active} />
      <PaperLayer size={size} index={1} active={active} />
      <PaperLayer size={size} index={0} active={active} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
    shadowColor: '#211842',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 3,
  },
});
