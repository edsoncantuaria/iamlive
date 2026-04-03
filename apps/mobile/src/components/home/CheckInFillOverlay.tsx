import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { MotivationalQuote } from '../../data/motivationalQuotes';

const EXPAND_MS = 520;
const FADE_OUT_MS = 400;
const TEXT_IN_MS = 220;

type Props = {
  trigger: number;
  colors: readonly [string, string];
  quote: MotivationalQuote | null;
  onFilled: () => void;
};

export function CheckInFillOverlay({ trigger, colors, quote, onFilled }: Props) {
  const { width, height } = useWindowDimensions();
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tapToContinue, setTapToContinue] = useState(false);

  const scale = useSharedValue(0);
  const veil = useSharedValue(0);
  const wash = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const notifyFilled = useCallback(() => {
    onFilled();
  }, [onFilled]);

  const diam = useMemo(() => {
    const m = Math.hypot(width / 2, height / 2) * 1.38;
    return m * 2;
  }, [width, height]);

  const runDismiss = useCallback(() => {
    wash.value = withTiming(0, { duration: FADE_OUT_MS, easing: Easing.in(Easing.quad) });
    veil.value = withTiming(0, { duration: FADE_OUT_MS, easing: Easing.in(Easing.quad) });
    textOpacity.value = withTiming(0, { duration: FADE_OUT_MS, easing: Easing.in(Easing.quad) });
    setTapToContinue(false);
    setTimeout(() => {
      notifyFilled();
    }, FADE_OUT_MS);
  }, [notifyFilled, textOpacity, veil, wash]);

  useEffect(() => {
    if (trigger <= 0) return;

    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    setTapToContinue(false);

    cancelAnimation(scale);
    cancelAnimation(veil);
    cancelAnimation(wash);
    cancelAnimation(textOpacity);

    scale.value = 0.015;
    veil.value = 1;
    wash.value = 0;
    textOpacity.value = 0;

    wash.value = withTiming(0.42, { duration: 180, easing: Easing.out(Easing.quad) });

    const afterExpand = () => {
      textOpacity.value = withTiming(1, { duration: TEXT_IN_MS, easing: Easing.out(Easing.quad) });
      hintTimerRef.current = setTimeout(() => {
        hintTimerRef.current = null;
        runOnJS(setTapToContinue)(true);
      }, TEXT_IN_MS + 80);
    };

    scale.value = withTiming(1, { duration: EXPAND_MS, easing: Easing.out(Easing.cubic) }, (finished) => {
      'worklet';
      if (finished === false) return;
      runOnJS(afterExpand)();
    });

    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [trigger, scale, veil, wash, textOpacity]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: veil.value,
  }));

  const washStyle = useAnimatedStyle(() => ({
    opacity: wash.value * veil.value,
  }));

  const quoteWrapStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value * veil.value,
  }));

  if (trigger <= 0) return null;

  const q = quote?.quote ?? '';
  const author = quote?.author?.trim() ?? '';

  const layers = (
    <>
      <Animated.View
        style={[StyleSheet.absoluteFill, washStyle, { backgroundColor: colors[0] }]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.ring,
          ringStyle,
          { width: diam, height: diam, borderRadius: diam / 2 },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[...colors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View style={[styles.quoteLayer, quoteWrapStyle]} pointerEvents="box-none">
        <ScrollView
          style={[styles.scroll, { maxHeight: height * 0.62 }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={runDismiss} style={styles.quotePressable}>
            <Text style={styles.quoteText}>{q}</Text>
            {author.length > 0 ? <Text style={styles.authorText}>— {author}</Text> : null}
          </Pressable>
        </ScrollView>
        {tapToContinue ? (
          <Text style={styles.continueHint} pointerEvents="none">
            Toque para continuar
          </Text>
        ) : null}
      </Animated.View>
    </>
  );

  if (tapToContinue) {
    return (
      <Pressable style={styles.host} onPress={runDismiss}>
        {layers}
      </Pressable>
    );
  }

  return <View pointerEvents="none" style={styles.host}>{layers}</View>;
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    elevation: 200,
  },
  ring: {
    overflow: 'hidden',
  },
  quoteLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    zIndex: 10,
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 8,
  },
  quotePressable: {
    width: '100%',
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    textAlign: 'center',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  authorText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.92)',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  continueHint: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 0.2,
  },
});
