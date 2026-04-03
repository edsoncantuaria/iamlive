import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../theme';

type Props = {
  progress: number;
  fillColor?: string;
};

export function AnimatedProgressTrack({ progress, fillColor }: Props) {
  const [trackW, setTrackW] = useState(0);
  const px = useSharedValue(0);

  useEffect(() => {
    if (trackW <= 0) return;
    const target = Math.min(1, Math.max(0, progress)) * trackW;
    px.value = withSpring(target, { damping: 18, stiffness: 120 });
  }, [progress, trackW, px]);

  const barStyle = useAnimatedStyle(() => ({
    width: px.value,
  }));

  const fill = fillColor ?? colors.safeGreen;

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackW(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.track} onLayout={onLayout}>
      <Animated.View style={[styles.fill, barStyle, { backgroundColor: fill }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(78,205,196,0.2)',
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 8,
  },
});
