import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppConfig, EmergencyContact } from './appState';
import { DEFAULT_INTERVAL_DAYS, DEFAULT_MESSAGE } from './appState';
import { DEFAULT_REMINDER_IDS, normalizeReminderIds, type ReminderOffsetId } from './reminderOffsets';

/** Última conta com sessão — widgets Android leem disto para saber que chave usar. */
export const ACTIVE_USER_ID_KEY = '@estouvivo_active_user_id';

const NS = '@estouvivo:u:';

function key(userId: string, name: string): string {
  return `${NS}${userId}:${name}`;
}

/** Chave do snapshot do widget por utilizador (Android). */
export function widgetSnapshotKeyForUser(userId: string): string {
  return key(userId, 'widget_snapshot');
}

/** @deprecated use widgetSnapshotKeyForUser — legado para referência */
export const WIDGET_SNAPSHOT_KEY = 'widget_snapshot';

const LEGACY_LAST = 'last_check_in';
const LEGACY_INTERVAL = 'interval_days';
const LEGACY_MSG = 'emergency_message';
const LEGACY_REMINDER_IDS = 'reminder_notification_ids';
const LEGACY_CONTACTS = 'emergency_contacts';
const LEGACY_EMERGENCY = 'emergency_sent_for_deadline_ms';
const LEGACY_ONBOARDING = 'onboarding_v1_done';

const MIGRATED_FLAG = '__legacy_v1_migrated';
const LAST_REMOTE_SYNC_AT = 'last_remote_sync_at';

export async function setActiveUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_USER_ID_KEY, userId);
}

export async function clearActiveUserId(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_USER_ID_KEY);
}

export async function getActiveUserId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_USER_ID_KEY);
}

/**
 * Copia dados antigos (sem prefixo de conta) para este utilizador e remove os legados.
 * Corre uma vez por conta neste aparelho.
 */
export async function migrateLegacyToUser(userId: string): Promise<void> {
  const done = await AsyncStorage.getItem(key(userId, MIGRATED_FLAG));
  if (done === '1') return;

  const alreadyHasData = await AsyncStorage.getItem(key(userId, LEGACY_LAST));
  if (alreadyHasData !== null) {
    await AsyncStorage.setItem(key(userId, MIGRATED_FLAG), '1');
    return;
  }

  const legacyLast = await AsyncStorage.getItem(LEGACY_LAST);
  if (legacyLast === null) {
    await AsyncStorage.setItem(key(userId, MIGRATED_FLAG), '1');
    return;
  }

  const copyPairs: [string, string][] = [
    [LEGACY_LAST, LEGACY_LAST],
    [LEGACY_INTERVAL, LEGACY_INTERVAL],
    [LEGACY_MSG, LEGACY_MSG],
    [LEGACY_REMINDER_IDS, LEGACY_REMINDER_IDS],
    [LEGACY_CONTACTS, LEGACY_CONTACTS],
    [LEGACY_EMERGENCY, LEGACY_EMERGENCY],
    [LEGACY_ONBOARDING, LEGACY_ONBOARDING],
  ];

  for (const [legacy, name] of copyPairs) {
    const v = await AsyncStorage.getItem(legacy);
    if (v !== null) await AsyncStorage.setItem(key(userId, name), v);
    await AsyncStorage.removeItem(legacy);
  }

  const legacyWidget = await AsyncStorage.getItem(WIDGET_SNAPSHOT_KEY);
  if (legacyWidget !== null) {
    await AsyncStorage.setItem(widgetSnapshotKeyForUser(userId), legacyWidget);
    await AsyncStorage.removeItem(WIDGET_SNAPSHOT_KEY);
  }

  await AsyncStorage.setItem(key(userId, MIGRATED_FLAG), '1');
}

export async function loadConfig(userId: string): Promise<AppConfig> {
  const [lastMs, intervalStr, msg] = await Promise.all([
    AsyncStorage.getItem(key(userId, LEGACY_LAST)),
    AsyncStorage.getItem(key(userId, LEGACY_INTERVAL)),
    AsyncStorage.getItem(key(userId, LEGACY_MSG)),
  ]);
  const intervalDays = intervalStr ? parseInt(intervalStr, 10) : DEFAULT_INTERVAL_DAYS;
  return {
    intervalDays: Number.isFinite(intervalDays) ? intervalDays : DEFAULT_INTERVAL_DAYS,
    emergencyMessage: msg ?? DEFAULT_MESSAGE,
    lastCheckIn: lastMs ? new Date(parseInt(lastMs, 10)) : null,
  };
}

export async function saveLastCheckIn(userId: string, d: Date): Promise<void> {
  await AsyncStorage.setItem(key(userId, LEGACY_LAST), String(d.getTime()));
}

export async function clearLastCheckIn(userId: string): Promise<void> {
  await AsyncStorage.removeItem(key(userId, LEGACY_LAST));
}

export async function saveIntervalDays(userId: string, n: number): Promise<void> {
  await AsyncStorage.setItem(key(userId, LEGACY_INTERVAL), String(n));
}

export async function saveMessage(userId: string, s: string): Promise<void> {
  await AsyncStorage.setItem(key(userId, LEGACY_MSG), s);
}

export async function loadReminderIds(userId: string): Promise<ReminderOffsetId[]> {
  const raw = await AsyncStorage.getItem(key(userId, LEGACY_REMINDER_IDS));
  if (raw === null) return [...DEFAULT_REMINDER_IDS];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [...DEFAULT_REMINDER_IDS];
    return normalizeReminderIds(arr);
  } catch {
    return [...DEFAULT_REMINDER_IDS];
  }
}

export async function saveReminderIds(userId: string, ids: ReminderOffsetId[]): Promise<void> {
  await AsyncStorage.setItem(key(userId, LEGACY_REMINDER_IDS), JSON.stringify(ids));
}

export async function loadContacts(userId: string): Promise<EmergencyContact[]> {
  const raw = await AsyncStorage.getItem(key(userId, LEGACY_CONTACTS));
  if (!raw) return [];
  const arr = JSON.parse(raw) as EmergencyContact[];
  return Array.isArray(arr) ? arr : [];
}

export async function saveContacts(userId: string, c: EmergencyContact[]): Promise<void> {
  await AsyncStorage.setItem(key(userId, LEGACY_CONTACTS), JSON.stringify(c));
}

export async function getEmergencySentDeadline(userId: string): Promise<number | null> {
  const v = await AsyncStorage.getItem(key(userId, LEGACY_EMERGENCY));
  if (v == null) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export async function setEmergencySentDeadline(userId: string, deadlineMs: number): Promise<void> {
  await AsyncStorage.setItem(key(userId, LEGACY_EMERGENCY), String(deadlineMs));
}

export async function clearEmergencySent(userId: string): Promise<void> {
  await AsyncStorage.removeItem(key(userId, LEGACY_EMERGENCY));
}

export async function loadOnboardingCompleted(userId: string): Promise<boolean> {
  const v = await AsyncStorage.getItem(key(userId, LEGACY_ONBOARDING));
  return v === '1';
}

export async function saveOnboardingCompleted(userId: string): Promise<void> {
  await AsyncStorage.setItem(key(userId, LEGACY_ONBOARDING), '1');
}

export async function clearOnboardingCompleted(userId: string): Promise<void> {
  await AsyncStorage.removeItem(key(userId, LEGACY_ONBOARDING));
}

export async function getLastRemoteSyncAt(userId: string): Promise<number> {
  const v = await AsyncStorage.getItem(key(userId, LAST_REMOTE_SYNC_AT));
  if (v == null) return 0;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

export async function setLastRemoteSyncAt(userId: string, at: number): Promise<void> {
  await AsyncStorage.setItem(key(userId, LAST_REMOTE_SYNC_AT), String(at));
}
