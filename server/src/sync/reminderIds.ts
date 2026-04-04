const VALID = new Set([
  '24h',
  '12h',
  '10h',
  '6h',
  '1h',
  '10m',
  'at_deadline',
]);

export type ReminderOffsetId =
  | '24h'
  | '12h'
  | '10h'
  | '6h'
  | '1h'
  | '10m'
  | 'at_deadline';

export function normalizeReminderIds(raw: unknown): ReminderOffsetId[] {
  if (!Array.isArray(raw)) return [];
  const set = new Set<ReminderOffsetId>();
  for (const x of raw) {
    if (typeof x === 'string' && VALID.has(x)) set.add(x as ReminderOffsetId);
  }
  return [...set].sort((a, b) => {
    const order = [...VALID];
    return order.indexOf(a) - order.indexOf(b);
  });
}
