import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cloudiveColors } from './theme';

type Props = {
  /** `intro` = abertura; `loading` = compacto sobre o spinner. */
  variant?: 'intro' | 'loading';
};

const PRESETS = {
  intro: {
    dot: 36,
    clusterW: 88,
    clusterH: 72,
    marginRight: 18,
    dotA: { left: 0, top: 24 },
    dotB: { left: 32, top: 8 },
    dotC: { left: 32, top: 40 },
    cloudiveSize: 34,
    productSize: 15,
    productMargin: 6,
  },
  loading: {
    dot: 22,
    clusterW: 54,
    clusterH: 44,
    marginRight: 14,
    dotA: { left: 0, top: 14 },
    dotB: { left: 20, top: 5 },
    dotC: { left: 20, top: 25 },
    cloudiveSize: 22,
    productSize: 13,
    productMargin: 4,
  },
} as const;

/**
 * Marca Cloudive + Estou Vivo (mesma geometria do SVG `assets/splash-estou-vivo-static.svg`).
 */
export function CloudiveMark({ variant = 'intro' }: Props) {
  const p = PRESETS[variant];

  return (
    <View style={styles.markRow}>
      <View style={[styles.cluster, { width: p.clusterW, height: p.clusterH, marginRight: p.marginRight }]}>
        <View
          style={[
            styles.dot,
            {
              width: p.dot,
              height: p.dot,
              borderRadius: p.dot / 2,
              left: p.dotA.left,
              top: p.dotA.top,
              backgroundColor: cloudiveColors.mint,
            },
          ]}
        />
        <View
          style={[
            styles.dot,
            {
              width: p.dot,
              height: p.dot,
              borderRadius: p.dot / 2,
              left: p.dotB.left,
              top: p.dotB.top,
              backgroundColor: cloudiveColors.mintMid,
            },
          ]}
        />
        <View
          style={[
            styles.dot,
            {
              width: p.dot,
              height: p.dot,
              borderRadius: p.dot / 2,
              left: p.dotC.left,
              top: p.dotC.top,
              backgroundColor: cloudiveColors.mist,
            },
          ]}
        />
      </View>
      <View style={styles.titles}>
        <Text style={[styles.cloudive, { fontSize: p.cloudiveSize }]}>Cloudive</Text>
        <Text
          style={[
            styles.product,
            { fontSize: p.productSize, marginTop: p.productMargin },
          ]}
        >
          Estou Vivo
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  markRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cluster: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
  },
  titles: {
    justifyContent: 'center',
  },
  cloudive: {
    fontWeight: '600',
    color: cloudiveColors.text,
    letterSpacing: 0.8,
  },
  product: {
    fontWeight: '600',
    color: cloudiveColors.textMuted,
    letterSpacing: 0.25,
  },
});
