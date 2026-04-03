import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Text as SvgText, TSpan } from 'react-native-svg';
import { colors } from '../../theme';

const SIZES = {
  sm: { w: 178, h: 34, fs: 17, iconR: 3.5, iconCx: 8, padX: 18 },
  md: { w: 210, h: 40, fs: 20, iconR: 4, iconCx: 9, padX: 22 },
  lg: { w: 268, h: 52, fs: 26, iconR: 5, iconCx: 12, padX: 28 },
} as const;

type Props = {
  /** sm = cabeçalho; md = destaque; lg = splash / boas-vindas */
  size?: keyof typeof SIZES;
  /** Oculta o ícone de pulso à esquerda (ex.: espaço apertado) */
  hideIcon?: boolean;
};

/**
 * Marca “Estou Vivo!” — palavra “Vivo!” em gradiente teal e traço suave de destaque.
 */
export function EstouVivoLogo({ size = 'md', hideIcon = false }: Props) {
  const s = SIZES[size];
  const textX = hideIcon ? 0 : s.padX;
  const baseline = s.h * 0.62;
  const gradId = `vivoGrad-${size}`;
  const shineId = `shine-${size}`;

  return (
    <View style={styles.wrap} accessibilityRole="image" accessibilityLabel="Estou Vivo!">
      <Svg width={s.w} height={s.h} viewBox={`0 0 ${s.w} ${s.h}`}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#4ECDC4" />
            <Stop offset="0.55" stopColor="#38B2AC" />
            <Stop offset="1" stopColor="#2C7A7B" />
          </LinearGradient>
          <LinearGradient id={shineId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#5EEAD4" />
            <Stop offset="1" stopColor="#2C7A7B" />
          </LinearGradient>
        </Defs>

        {!hideIcon ? (
          <>
            <Circle cx={s.iconCx} cy={s.h / 2} r={s.iconR} fill={`url(#${shineId})`} opacity={0.95} />
            <Circle
              cx={s.iconCx}
              cy={s.h / 2}
              r={s.iconR + 5}
              fill="none"
              stroke="url(#shineId)"
              strokeWidth={1}
              opacity={0.35}
            />
          </>
        ) : null}

        <SvgText
          x={textX}
          y={baseline}
          fontSize={s.fs}
          fontWeight="700"
          letterSpacing={size === 'lg' ? -0.3 : -0.2}
        >
          <TSpan fill={colors.fabulousDeep}>Estou </TSpan>
          <TSpan fill={`url(#${gradId})`}>Vivo!</TSpan>
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
  },
});
