export const DEFAULT_INTERVAL_DAYS = 3;
export const DEFAULT_MESSAGE =
  'Oi, não consegui confirmar que estou bem no app "Estou Vivo!". ' +
  'Pode verificar se está tudo certo comigo?';

export type AliveStatus =
  | 'neverChecked'
  | 'safe'
  | 'warning'
  | 'critical'
  | 'expired';

export type EmergencyContact = { name: string; phone: string };

export type AppConfig = {
  intervalDays: number;
  emergencyMessage: string;
  lastCheckIn: Date | null;
};

export function deadlineOf(c: AppConfig): Date | null {
  if (!c.lastCheckIn) return null;
  const d = new Date(c.lastCheckIn);
  d.setDate(d.getDate() + c.intervalDays);
  return d;
}

export function timeRemaining(c: AppConfig): Duration | null {
  const dl = deadlineOf(c);
  if (!dl) return null;
  const ms = dl.getTime() - Date.now();
  return ms <= 0 ? { ms: 0 } : { ms };
}

export type Duration = { ms: number };

export function isExpired(c: AppConfig): boolean {
  const tr = timeRemaining(c);
  return tr !== null && tr.ms === 0;
}

export function progressPercent(c: AppConfig): number {
  if (!c.lastCheckIn) return 0;
  const dl = deadlineOf(c);
  if (!dl) return 0;
  const total = dl.getTime() - c.lastCheckIn.getTime();
  if (total <= 0) return 1;
  const elapsed = Date.now() - c.lastCheckIn.getTime();
  return Math.min(1, Math.max(0, elapsed / total));
}

export function aliveStatus(c: AppConfig): AliveStatus {
  if (!c.lastCheckIn) return 'neverChecked';
  if (isExpired(c)) return 'expired';
  const tr = timeRemaining(c);
  if (!tr) return 'neverChecked';
  const h = tr.ms / 3600000;
  if (h <= 6) return 'critical';
  if (h <= 24) return 'warning';
  return 'safe';
}
