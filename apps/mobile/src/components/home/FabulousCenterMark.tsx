import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../theme';

type Props = {
  size: number;
  /** 0–4: estilos visuais distintos a cada confirmação. */
  variant: number;
};

export function FabulousCenterMark({ size, variant }: Props) {
  const v = ((variant % 5) + 5) % 5;
  const stroke = 'rgba(255,255,255,0.95)';
  const fillSoft = 'rgba(255,255,255,0.22)';

  return (
    <View style={[styles.wrap, { width: size * 0.44, height: size * 0.44 }]}>
      <Svg width={size * 0.44} height={size * 0.44} viewBox="0 0 88 88">
        {v === 0 && (
          <>
            <Circle cx="44" cy="44" r="28" stroke={stroke} strokeWidth="3" fill="none" opacity={0.95} />
            <Circle cx="44" cy="44" r="14" fill={fillSoft} />
          </>
        )}
        {v === 1 && (
          <>
            <Path
              d="M44 18 L62 38 L44 70 L26 38 Z"
              stroke={stroke}
              strokeWidth="2.5"
              fill={fillSoft}
              strokeLinejoin="round"
            />
            <Circle cx="44" cy="40" r="6" fill="rgba(255,255,255,0.35)" />
          </>
        )}
        {v === 2 && (
          <>
            <Path
              d="M22 44 Q44 22 66 44 Q44 66 22 44"
              stroke={stroke}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx="44" cy="44" r="8" fill={fillSoft} />
          </>
        )}
        {v === 3 && (
          <>
            <Circle cx="32" cy="44" r="10" fill={fillSoft} stroke={stroke} strokeWidth="2" />
            <Circle cx="56" cy="44" r="10" fill={fillSoft} stroke={stroke} strokeWidth="2" />
            <Path d="M38 44 H50" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {v === 4 && (
          <>
            <Path
              d="M44 20 L68 44 L44 68 L20 44 Z"
              stroke={stroke}
              strokeWidth="2.5"
              fill={fillSoft}
              strokeLinejoin="round"
            />
            <Circle cx="44" cy="44" r="22" stroke={colors.softWhite} strokeWidth="1" fill="none" opacity={0.4} />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
