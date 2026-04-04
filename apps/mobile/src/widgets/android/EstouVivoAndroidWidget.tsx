import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ColorProp } from 'react-native-android-widget';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { WIDGET_SNAPSHOT_KEY, type WidgetSnapshotV1 } from '../../lib/widgetSnapshot';

const BG: Record<WidgetSnapshotV1['accent'], ColorProp> = {
  safe: '#E8F7F4',
  warning: '#FFF4E8',
  critical: '#FFE8EC',
  expired: '#FFE8EC',
  empty: '#E8F7F4',
};

const FG: Record<WidgetSnapshotV1['accent'], ColorProp> = {
  safe: '#0f766e',
  warning: '#C2410C',
  critical: '#B91C1C',
  expired: '#B91C1C',
  empty: '#0d9488',
};

const STRIP: Record<WidgetSnapshotV1['accent'], ColorProp> = {
  safe: '#14b8a6',
  warning: '#fb923c',
  critical: '#f87171',
  expired: '#ef4444',
  empty: '#5eead4',
};

function parse(raw: string | null): WidgetSnapshotV1 {
  if (!raw) {
    return {
      title: 'Estou Vivo!',
      subtitle: 'Abra o app',
      line1: '—',
      accent: 'empty',
      intervalLine: '',
      deadlineLine: '',
      statusShort: '—',
    };
  }
  try {
    const o = JSON.parse(raw) as Partial<WidgetSnapshotV1>;
    return {
      title: o.title ?? 'Estou Vivo!',
      subtitle: o.subtitle ?? 'Abra o app',
      line1: o.line1 ?? '—',
      accent: o.accent ?? 'empty',
      intervalLine: o.intervalLine ?? '',
      deadlineLine: o.deadlineLine ?? '',
      statusShort: o.statusShort ?? '—',
    };
  } catch {
    return {
      title: 'Estou Vivo!',
      subtitle: 'Abra o app',
      line1: '—',
      accent: 'empty',
      intervalLine: '',
      deadlineLine: '',
      statusShort: '—',
    };
  }
}

const fill: React.ComponentProps<typeof FlexWidget>['style'] = {
  width: 'match_parent',
  height: 'match_parent',
};

/**
 * Widget compacto (2×1): contagem + estado curto.
 */
export async function buildEstouVivoMiniTree() {
  const raw = await AsyncStorage.getItem(WIDGET_SNAPSHOT_KEY);
  const snap = parse(raw);
  const bg = BG[snap.accent];
  const fg = FG[snap.accent];
  const strip = STRIP[snap.accent];

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        ...fill,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 0,
        backgroundColor: bg,
        borderRadius: 16,
      }}
      accessibilityLabel="Estou Vivo — abrir app"
    >
      <FlexWidget
        style={{
          width: 5,
          height: 'match_parent',
          backgroundColor: strip,
        }}
      />
      <FlexWidget
        style={{
          flexDirection: 'column',
          flexGap: 4,
          paddingVertical: 10,
          paddingHorizontal: 12,
          justifyContent: 'center',
        }}
      >
        <TextWidget
          text={snap.line1}
          style={{ fontSize: 20, color: fg, fontWeight: 'bold' }}
        />
        <TextWidget
          text={snap.statusShort}
          style={{ fontSize: 11, color: '#64748b', fontWeight: '700' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

/**
 * Widget painel (4×2): mais contexto e leitura confortável.
 */
export async function buildEstouVivoPainelTree() {
  const raw = await AsyncStorage.getItem(WIDGET_SNAPSHOT_KEY);
  const snap = parse(raw);
  const bg = BG[snap.accent];
  const fg = FG[snap.accent];
  const strip = STRIP[snap.accent];

  const meta1 = snap.intervalLine || 'Abra o app para configurar';
  const meta2 = snap.deadlineLine || snap.subtitle;

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        ...fill,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 0,
        backgroundColor: bg,
        borderRadius: 20,
      }}
      accessibilityLabel="Estou Vivo — abrir app"
    >
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 8,
          paddingHorizontal: 14,
          backgroundColor: strip,
        }}
      >
        <TextWidget
          text={snap.title}
          style={{ fontSize: 12, color: '#f0fdfa', fontWeight: '800' }}
        />
        <TextWidget
          text={snap.statusShort}
          style={{ fontSize: 11, color: '#ecfdf5', fontWeight: '700' }}
        />
      </FlexWidget>
      <FlexWidget
        style={{
          flexDirection: 'column',
          flexGap: 6,
          padding: 14,
          justifyContent: 'center',
        }}
      >
        <TextWidget
          text={snap.line1}
          style={{ fontSize: 26, color: fg, fontWeight: 'bold' }}
        />
        <TextWidget
          text={snap.subtitle}
          style={{ fontSize: 13, color: '#475569', fontWeight: '600' }}
        />
        <TextWidget
          text={meta1}
          style={{ fontSize: 11, color: '#64748b', fontWeight: '600' }}
        />
        <TextWidget
          text={meta2}
          style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
