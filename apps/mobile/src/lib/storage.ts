import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppConfig, EmergencyContact } from './appState';
import { DEFAULT_INTERVAL_DAYS, DEFAULT_MESSAGE } from './appState';
import { DEFAULT_REMINDER_IDS, normalizeReminderIds, type ReminderOffsetId } from './reminderOffsets';

const KEY_CONTACTS = 'emergency_contacts';
const KEY_LAST = 'last_check_in';
const KEY_INTERVAL = 'interval_days';
const KEY_MSG = 'emergency_message';
const KEY_REMINDER_IDS = 'reminder_notification_ids';

export async function loadConfig(): Promise<AppConfig> {
  const [lastMs, intervalStr, msg] = await Promise.all([
    AsyncStorage.getItem(KEY_LAST),
    AsyncStorage.getItem(KEY_INTERVAL),
    AsyncStorage.getItem(KEY_MSG),
  ]);
  const intervalDays = intervalStr ? parseInt(intervalStr, 10) : DEFAULT_INTERVAL_DAYS;
  return {
    intervalDays: Number.isFinite(intervalDays) ? intervalDays : DEFAULT_INTERVAL_DAYS,
    emergencyMessage: msg ?? DEFAULT_MESSAGE,
    lastCheckIn: lastMs ? new Date(parseInt(lastMs, 10)) : null,
  };
}

export async function saveLastCheckIn(d: Date): Promise<void> {
  await AsyncStorage.setItem(KEY_LAST, String(d.getTime()));
}

export async function saveIntervalDays(n: number): Promise<void> {
  await AsyncStorage.setItem(KEY_INTERVAL, String(n));
}

export async function saveMessage(s: string): Promise<void> {
  await AsyncStorage.setItem(KEY_MSG, s);
}

export async function loadReminderIds(): Promise<ReminderOffsetId[]> {
  const raw = await AsyncStorage.getItem(KEY_REMINDER_IDS);
  if (raw === null) return [...DEFAULT_REMINDER_IDS];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [...DEFAULT_REMINDER_IDS];
    return normalizeReminderIds(arr);
  } catch {
    return [...DEFAULT_REMINDER_IDS];
  }
}

export async function saveReminderIds(ids: ReminderOffsetId[]): Promise<void> {
  await AsyncStorage.setItem(KEY_REMINDER_IDS, JSON.stringify(ids));
}

export async function loadContacts(): Promise<EmergencyContact[]> {
  const raw = await AsyncStorage.getItem(KEY_CONTACTS);
  if (!raw) return [];
  const arr = JSON.parse(raw) as EmergencyContact[];
  return Array.isArray(arr) ? arr : [];
}

export async function saveContacts(c: EmergencyContact[]): Promise<void> {
  await AsyncStorage.setItem(KEY_CONTACTS, JSON.stringify(c));
}


const KEY_EMERGENCY = 'emergency_sent_for_deadline_ms';

export async function getEmergencySentDeadline(): Promise<number | null> {
  const v = await AsyncStorage.getItem(KEY_EMERGENCY);
  if (v == null) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export async function setEmergencySentDeadline(deadlineMs: number): Promise<void> {
  await AsyncStorage.setItem(KEY_EMERGENCY, String(deadlineMs));
}

export async function clearEmergencySent(): Promise<void> {
  await AsyncStorage.removeItem(KEY_EMERGENCY);
}
