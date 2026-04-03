import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type Props = {
  text: string;
  color: string;
  statusKey: string;
};

export function AnimatedStatusLabel({ text, color, statusKey }: Props) {
  return (
    <Animated.View
      key={statusKey}
      entering={FadeIn.duration(380)}
      exiting={FadeOut.duration(220)}
      style={styles.wrap}
    >
      <Text style={[styles.txt, { color }]}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 28,
    minHeight: 28,
    justifyContent: 'center',
  },
  txt: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
