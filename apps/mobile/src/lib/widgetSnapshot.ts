import type { AppConfig } from './appState';
import { aliveStatus, deadlineOf, timeRemaining } from './appState';

export type WidgetAccent = 'safe' | 'warning' | 'critical' | 'expired' | 'empty';

export type WidgetSnapshotV1 = {
  title: string;
  subtitle: string;
  line1: string;
  accent: WidgetAccent;
  /** Ex.: "Check-in a cada 3 dias" */
  intervalLine: string;
  /** Ex.: "Limite: 05/04 14:30" */
  deadlineLine: string;
  /** Rótulo curto para widget mini / faixa do painel */
  statusShort: string;
};

const GROUP_KEY = 'widget_snapshot';

export { GROUP_KEY as WIDGET_SNAPSHOT_KEY };

function deadlineLineFrom(dl: Date): string {
  try {
    const d = dl.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const t = dl.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `Limite: ${d} ${t}`;
  } catch {
    return 'Limite: —';
  }
}

function statusShortFrom(st: ReturnType<typeof aliveStatus>): string {
  switch (st) {
    case 'neverChecked':
      return 'Sem check-in';
    case 'safe':
      return 'No prazo';
    case 'warning':
      return 'Atenção';
    case 'critical':
      return 'Urgente';
    case 'expired':
      return 'Expirado';
    default:
      return '—';
  }
}

export function buildWidgetSnapshot(config: AppConfig): WidgetSnapshotV1 {
  const dl = deadlineOf(config);
  if (!dl || !config.lastCheckIn) {
    return {
      title: 'Estou Vivo!',
      subtitle: 'Faça o check-in no app',
      line1: '—',
      accent: 'empty',
      intervalLine: `Intervalo: ${config.intervalDays} dia(s)`,
      deadlineLine: 'Abra o app para começar',
      statusShort: 'Sem check-in',
    };
  }

  const tr = timeRemaining(config);
  const ms = tr?.ms ?? 0;
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const line1 =
    ms <= 0
      ? 'Prazo expirado'
      : `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;

  const st = aliveStatus(config);
  let accent: WidgetAccent = 'safe';
  if (st === 'warning') accent = 'warning';
  if (st === 'critical') accent = 'critical';
  if (st === 'expired') accent = 'expired';

  const subtitle =
    st === 'expired'
      ? 'Confirme no app'
      : st === 'critical'
        ? 'Falta pouco — abra o app'
        : st === 'warning'
          ? 'Lembrete: check-in'
          : 'Próximo limite';

  return {
    title: 'Estou Vivo!',
    subtitle,
    line1,
    accent,
    intervalLine: `Check-in a cada ${config.intervalDays} dia(s)`,
    deadlineLine: deadlineLineFrom(dl),
    statusShort: statusShortFrom(st),
  };
}
