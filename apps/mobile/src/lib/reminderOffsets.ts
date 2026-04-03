/**
 * Lembretes locais antes do prazo do check-in (deadline).
 * `beforeMs` = quanto tempo antes do limite dispara a notificação; `at_deadline` = no instante do limite.
 */
export const REMINDER_OPTIONS = [
  { id: '24h', beforeMs: 24 * 3600000, label: '24 horas antes', shortLabel: '24 h' },
  { id: '12h', beforeMs: 12 * 3600000, label: '12 horas antes', shortLabel: '12 h' },
  { id: '10h', beforeMs: 10 * 3600000, label: '10 horas antes', shortLabel: '10 h' },
  { id: '6h', beforeMs: 6 * 3600000, label: '6 horas antes', shortLabel: '6 h' },
  { id: '1h', beforeMs: 1 * 3600000, label: '1 hora antes', shortLabel: '1 h' },
  { id: '10m', beforeMs: 10 * 60000, label: '10 minutos antes', shortLabel: '10 min' },
  { id: 'at_deadline', beforeMs: 0, label: 'No prazo exato', shortLabel: 'No limite' },
] as const;

export type ReminderOffsetId = (typeof REMINDER_OPTIONS)[number]['id'];

export const DEFAULT_REMINDER_IDS: readonly ReminderOffsetId[] = REMINDER_OPTIONS.map((o) => o.id);

export function isReminderOffsetId(s: string): s is ReminderOffsetId {
  return REMINDER_OPTIONS.some((o) => o.id === s);
}

/** Filtra IDs válidos e ordena. Array vazio = utilizador desativou todos os lembretes. */
export function normalizeReminderIds(raw: unknown): ReminderOffsetId[] {
  if (!Array.isArray(raw)) return [];
  const set = new Set<ReminderOffsetId>();
  for (const x of raw) {
    if (typeof x === 'string' && isReminderOffsetId(x)) set.add(x);
  }
  return [...set].sort((a, b) => {
    const ia = REMINDER_OPTIONS.findIndex((o) => o.id === a);
    const ib = REMINDER_OPTIONS.findIndex((o) => o.id === b);
    return ia - ib;
  });
}
