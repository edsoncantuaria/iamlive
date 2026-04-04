import { SERVER_URL } from '../config';
import type { EmergencyContact } from './appState';
import type { ReminderOffsetId } from './reminderOffsets';
import * as storage from './storage';

export type UserSyncPayloadV1 = {
  v: 1;
  intervalDays: number;
  emergencyMessage: string;
  lastCheckInMs: number | null;
  reminderIds: ReminderOffsetId[];
  contacts: EmergencyContact[];
  emergencySentDeadlineMs: number | null;
  onboardingDone: boolean;
};

type ServerSyncResponse = UserSyncPayloadV1 & { updatedAt: number };

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

function sanitizeContactsForSync(raw: EmergencyContact[]): EmergencyContact[] {
  return raw
    .map((c) => ({
      name: typeof c.name === 'string' ? c.name.trim().slice(0, 120) : '',
      phone: typeof c.phone === 'string' ? c.phone.trim().slice(0, 32) : '',
    }))
    .filter((c) => c.phone.length > 0)
    .slice(0, 2);
}

export async function buildLocalSyncPayload(userId: string): Promise<UserSyncPayloadV1> {
  const [c, contacts, reminderIds, emerg, onboard] = await Promise.all([
    storage.loadConfig(userId),
    storage.loadContacts(userId),
    storage.loadReminderIds(userId),
    storage.getEmergencySentDeadline(userId),
    storage.loadOnboardingCompleted(userId),
  ]);
  return {
    v: 1,
    intervalDays: c.intervalDays,
    emergencyMessage: c.emergencyMessage,
    lastCheckInMs: c.lastCheckIn ? c.lastCheckIn.getTime() : null,
    reminderIds,
    contacts: sanitizeContactsForSync(contacts),
    emergencySentDeadlineMs: emerg,
    onboardingDone: onboard,
  };
}

export async function applyRemoteSyncPayload(userId: string, p: UserSyncPayloadV1): Promise<void> {
  await storage.saveIntervalDays(userId, p.intervalDays);
  await storage.saveMessage(userId, p.emergencyMessage);
  if (p.lastCheckInMs != null) {
    await storage.saveLastCheckIn(userId, new Date(p.lastCheckInMs));
  } else {
    await storage.clearLastCheckIn(userId);
  }
  await storage.saveReminderIds(userId, p.reminderIds);
  await storage.saveContacts(userId, p.contacts);
  if (p.emergencySentDeadlineMs != null) {
    await storage.setEmergencySentDeadline(userId, p.emergencySentDeadlineMs);
  } else {
    await storage.clearEmergencySent(userId);
  }
  if (p.onboardingDone) {
    await storage.saveOnboardingCompleted(userId);
  } else {
    await storage.clearOnboardingCompleted(userId);
  }
}

/**
 * Descarrega estado mais recente do servidor se updatedAt > último marcador local;
 * em seguida envia o snapshot local (convergência entre dispositivos).
 */
export async function runCloudSync(userId: string, accessToken: string): Promise<void> {
  const marker = await storage.getLastRemoteSyncAt(userId);
  const headers = authHeaders(accessToken);

  try {
    const gr = await fetch(`${SERVER_URL}/sync/state`, { headers });
    if (gr.ok) {
      const data = (await gr.json()) as ServerSyncResponse;
      const { updatedAt, ...rest } = data;
      if (typeof updatedAt === 'number' && updatedAt > marker && rest.v === 1) {
        await applyRemoteSyncPayload(userId, rest as UserSyncPayloadV1);
        await storage.setLastRemoteSyncAt(userId, updatedAt);
      }
    } else if (__DEV__ && gr.status !== 404) {
      const t = await gr.text().catch(() => '');
      console.warn('[cloudSync] GET /sync/state', gr.status, t);
    }
  } catch {
    /* offline ou erro — continua para tentar enviar */
  }

  try {
    const payload = await buildLocalSyncPayload(userId);
    const pr = await fetch(`${SERVER_URL}/sync/state`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    if (pr.ok) {
      const j = (await pr.json()) as { updatedAt?: number };
      if (typeof j.updatedAt === 'number') {
        await storage.setLastRemoteSyncAt(userId, j.updatedAt);
      }
    } else if (__DEV__) {
      const t = await pr.text().catch(() => '');
      console.warn('[cloudSync] PUT /sync/state', pr.status, t);
    }
  } catch {
    /* offline */
  }
}

/** Só envia (útil após edições; não bloqueia UI). */
export async function pushCloudState(userId: string, accessToken: string): Promise<void> {
  try {
    const payload = await buildLocalSyncPayload(userId);
    const pr = await fetch(`${SERVER_URL}/sync/state`, {
      method: 'PUT',
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    });
    if (pr.ok) {
      const j = (await pr.json()) as { updatedAt?: number };
      if (typeof j.updatedAt === 'number') {
        await storage.setLastRemoteSyncAt(userId, j.updatedAt);
      }
    } else if (__DEV__) {
      const t = await pr.text().catch(() => '');
      console.warn('[cloudSync] pushCloudState PUT', pr.status, t);
    }
  } catch {
    /* offline */
  }
}
