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
  empty: '#F3E8FF',
};

const FG: Record<WidgetSnapshotV1['accent'], ColorProp> = {
  safe: '#2C7A7B',
  warning: '#C2410C',
  critical: '#B91C1C',
  expired: '#B91C1C',
  empty: '#4A4458',
};

function parse(raw: string | null): WidgetSnapshotV1 {
  if (!raw) {
    return {
      title: 'Estou Vivo!',
      subtitle: 'Abra o app',
      line1: '—',
      accent: 'empty',
    };
  }
  try {
    return JSON.parse(raw) as WidgetSnapshotV1;
  } catch {
    return {
      title: 'Estou Vivo!',
      subtitle: 'Abra o app',
      line1: '—',
      accent: 'empty',
    };
  }
}

/**
 * Árvore do widget Android (home screen). Atualizada pelo app via `syncHomeWidgetsFromConfig`.
 */
export async function buildEstouVivoWidgetTree() {
  const raw = await AsyncStorage.getItem(WIDGET_SNAPSHOT_KEY);
  const snap = parse(raw);
  const bg = BG[snap.accent];
  const fg = FG[snap.accent];

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: bg,
        borderRadius: 20,
        flexGap: 6,
      }}
      accessibilityLabel="Estou Vivo — abrir app"
    >
      <TextWidget
        text={snap.title}
        style={{ fontSize: 11, color: '#6B7280', fontWeight: '700' }}
      />
      <TextWidget
        text={snap.line1}
        style={{ fontSize: 22, color: fg, fontWeight: 'bold' }}
      />
      <TextWidget
        text={snap.subtitle}
        style={{ fontSize: 12, color: '#6B7280', fontWeight: '600' }}
      />
    </FlexWidget>
  );
}
