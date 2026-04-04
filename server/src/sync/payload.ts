import { normalizeReminderIds } from './reminderIds.js';
import type { ReminderOffsetId } from './reminderIds.js';

export type UserSyncPayloadV1 = {
  v: 1;
  intervalDays: number;
  emergencyMessage: string;
  lastCheckInMs: number | null;
  reminderIds: ReminderOffsetId[];
  contacts: { name: string; phone: string }[];
  emergencySentDeadlineMs: number | null;
  onboardingDone: boolean;
};

export function parseSyncPayload(body: unknown): UserSyncPayloadV1 | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  if (o.v !== 1) return null;

  const intervalDays = typeof o.intervalDays === 'number' ? o.intervalDays : NaN;
  if (!Number.isFinite(intervalDays) || intervalDays < 1 || intervalDays > 365) return null;

  const emergencyMessage =
    typeof o.emergencyMessage === 'string' ? o.emergencyMessage.slice(0, 8000) : '';

  let lastCheckInMs: number | null = null;
  if (o.lastCheckInMs === null || o.lastCheckInMs === undefined) {
    lastCheckInMs = null;
  } else if (typeof o.lastCheckInMs === 'number' && Number.isFinite(o.lastCheckInMs)) {
    lastCheckInMs = o.lastCheckInMs;
  } else {
    return null;
  }

  const reminderIds = normalizeReminderIds(o.reminderIds);

  const contactsRaw = o.contacts;
  const contacts: { name: string; phone: string }[] = [];
  if (!Array.isArray(contactsRaw) || contactsRaw.length > 2) return null;
  for (const c of contactsRaw) {
    if (!c || typeof c !== 'object') return null;
    const r = c as Record<string, unknown>;
    const name = typeof r.name === 'string' ? r.name.slice(0, 120) : '';
    const phone = typeof r.phone === 'string' ? r.phone.slice(0, 32) : '';
    const phoneTrim = phone.trim();
    if (!phoneTrim) continue;
    contacts.push({ name: name.trim(), phone: phoneTrim });
  }

  let emergencySentDeadlineMs: number | null = null;
  if (o.emergencySentDeadlineMs === null || o.emergencySentDeadlineMs === undefined) {
    emergencySentDeadlineMs = null;
  } else if (
    typeof o.emergencySentDeadlineMs === 'number' &&
    Number.isFinite(o.emergencySentDeadlineMs)
  ) {
    emergencySentDeadlineMs = o.emergencySentDeadlineMs;
  } else {
    return null;
  }

  const onboardingDone = o.onboardingDone === true;

  return {
    v: 1,
    intervalDays,
    emergencyMessage,
    lastCheckInMs,
    reminderIds,
    contacts,
    emergencySentDeadlineMs,
    onboardingDone,
  };
}
