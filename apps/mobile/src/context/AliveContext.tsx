import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, AppState } from 'react-native';
import type { AppConfig, EmergencyContact } from '../lib/appState';
import { DEFAULT_REMINDER_IDS, type ReminderOffsetId } from '../lib/reminderOffsets';
import { aliveStatus, deadlineOf, isExpired } from '../lib/appState';
import { pushCloudState, runCloudSync } from '../lib/cloudSync';
import { requestNotificationPermissionsSafe, scheduleReminders } from '../lib/notifications';
import { syncHomeWidgetsFromConfig } from '../lib/syncHomeWidgets';
import * as storage from '../lib/storage';
import { emergencySendUserMessage, welcomeSendUserMessage } from '../lib/userFacingErrors';
import { ensureSocket } from '../socket';

/** Aviso enviado ao cadastrar — a pessoa fica ciente do papel de contato de confiança. */
async function sendWelcomeNoticeToContact(
  sessionToken: string,
  c: EmergencyContact,
): Promise<void> {
  const sock = ensureSocket(sessionToken);
  const first = c.name.trim().split(/\s+/)[0] ?? '';
  const greeting = first ? `Oi, ${first}!` : 'Oi!';
  const message =
    `${greeting} Eu te cadastrei como contato de confiança no app Estou Vivo! ` +
    `Se um dia eu não confirmar que estou bem dentro do prazo combinado, você receberá uma mensagem automática por aqui. ` +
    `Obrigado por estar aí.`;

  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('Tempo esgotado')), 60000);
    sock.emit(
      'send-emergency',
      { phones: [c.phone], message },
      (err: Error | null) => {
        clearTimeout(t);
        if (err) reject(err);
        else resolve();
      },
    );
  });
}

type Ctx = {
  ready: boolean;
  config: AppConfig;
  contacts: EmergencyContact[];
  reminderIds: ReminderOffsetId[];
  checkIn: () => Promise<void>;
  setIntervalDays: (n: number) => Promise<void>;
  setMessage: (s: string) => Promise<void>;
  setReminderIds: (ids: ReminderOffsetId[]) => Promise<void>;
  addContact: (c: EmergencyContact, sendWelcomeWhatsApp: boolean) => Promise<void>;
  updateContact: (i: number, c: EmergencyContact) => Promise<void>;
  removeContact: (i: number) => Promise<void>;
  refresh: () => Promise<void>;
  /** Agenda envio do estado local para a nuvem (debounce). */
  queueCloudSync: () => void;
};

const AliveContext = createContext<Ctx | null>(null);

export function AliveProvider({
  userId,
  sessionToken,
  children,
}: {
  userId: string;
  sessionToken: string;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<AppConfig>({
    intervalDays: 3,
    emergencyMessage: '',
    lastCheckIn: null,
  });
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [reminderIds, setReminderIdsState] = useState<ReminderOffsetId[]>([...DEFAULT_REMINDER_IDS]);

  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const scheduleCloudPush = useCallback(() => {
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(() => {
      pushTimerRef.current = null;
      void pushCloudState(userId, sessionToken);
    }, 1100);
  }, [userId, sessionToken]);

  const queueCloudSync = useCallback(() => {
    scheduleCloudPush();
  }, [scheduleCloudPush]);

  const refresh = useCallback(async () => {
    await storage.migrateLegacyToUser(userId);
    await runCloudSync(userId, sessionToken);
    const [c, ct, rid] = await Promise.all([
      storage.loadConfig(userId),
      storage.loadContacts(userId),
      storage.loadReminderIds(userId),
    ]);
    setConfig(c);
    setContacts(ct);
    setReminderIdsState(rid);
    const dl = deadlineOf(c);
    if (dl && c.lastCheckIn) {
      await scheduleReminders(dl, userId);
    }
    await syncHomeWidgetsFromConfig(c, userId);
  }, [userId, sessionToken]);

  const setReminderIds = useCallback(
    async (ids: ReminderOffsetId[]) => {
      await storage.saveReminderIds(userId, ids);
      setReminderIdsState(ids);
      const c = await storage.loadConfig(userId);
      const dl = deadlineOf(c);
      if (dl && c.lastCheckIn) {
        await scheduleReminders(dl, userId);
      }
      scheduleCloudPush();
    },
    [userId, scheduleCloudPush],
  );

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    (async () => {
      await requestNotificationPermissionsSafe();
      await refresh();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!ready || !sessionToken) return;
    const dl = deadlineOf(config);
    if (!dl || !isExpired(config) || contacts.length === 0) return;

    let cancelled = false;

    (async () => {
      const sent = await storage.getEmergencySentDeadline(userId);
      if (sent === dl.getTime()) return;

      try {
        const sock = ensureSocket(sessionToken);
        await new Promise<void>((resolve, reject) => {
          const t = setTimeout(() => reject(new Error('timeout')), 60000);
          sock.emit(
            'send-emergency',
            {
              phones: contacts.map((c) => c.phone),
              message: config.emergencyMessage,
            },
            (err: Error | null) => {
              clearTimeout(t);
              if (err) reject(err);
              else resolve();
            },
          );
        });
        if (cancelled) return;
        await storage.setEmergencySentDeadline(userId, dl.getTime());
        scheduleCloudPush();
      } catch (e) {
        if (cancelled) return;
        Alert.alert('Não foi possível avisar os contatos', emergencySendUserMessage(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, sessionToken, userId, config, contacts, scheduleCloudPush]);

  const checkIn = useCallback(async () => {
    const now = new Date();
    await storage.saveLastCheckIn(userId, now);
    await storage.clearEmergencySent(userId);
    const c = await storage.loadConfig(userId);
    setConfig(c);
    const dl = deadlineOf(c);
    if (dl) await scheduleReminders(dl, userId);
    await syncHomeWidgetsFromConfig(c, userId);
    scheduleCloudPush();
  }, [userId, scheduleCloudPush]);

  const setIntervalDays = useCallback(
    async (n: number) => {
      const next = { ...config, intervalDays: n };
      await storage.saveIntervalDays(userId, n);
      setConfig(next);
      const dl = deadlineOf(next);
      if (dl && next.lastCheckIn) await scheduleReminders(dl, userId);
      await syncHomeWidgetsFromConfig(next, userId);
      scheduleCloudPush();
    },
    [config, userId, scheduleCloudPush],
  );

  const setMessage = useCallback(
    async (s: string) => {
      await storage.saveMessage(userId, s);
      setConfig((c) => ({ ...c, emergencyMessage: s }));
      scheduleCloudPush();
    },
    [userId, scheduleCloudPush],
  );

  const addContact = useCallback(
    async (c: EmergencyContact, sendWelcomeWhatsApp: boolean) => {
      if (contacts.length >= 2) return;
      const next = [...contacts, c];
      await storage.saveContacts(userId, next);
      setContacts(next);
      scheduleCloudPush();
      if (!sendWelcomeWhatsApp) return;
      void sendWelcomeNoticeToContact(sessionToken, c).catch((e) => {
        Alert.alert('Contato salvo', welcomeSendUserMessage(e));
      });
    },
    [contacts, sessionToken, userId, scheduleCloudPush],
  );

  const updateContact = useCallback(
    async (i: number, c: EmergencyContact) => {
      if (i < 0 || i >= contacts.length) return;
      const next = contacts.slice();
      next[i] = c;
      await storage.saveContacts(userId, next);
      setContacts(next);
      scheduleCloudPush();
    },
    [contacts, userId, scheduleCloudPush],
  );

  const removeContact = useCallback(
    async (i: number) => {
      if (i < 0 || i >= contacts.length) return;
      const next = contacts.filter((_, j) => j !== i);
      await storage.saveContacts(userId, next);
      setContacts(next);
      scheduleCloudPush();
    },
    [contacts, userId, scheduleCloudPush],
  );

  const value = useMemo(
    () => ({
      ready,
      config,
      contacts,
      reminderIds,
      checkIn,
      setIntervalDays,
      setMessage,
      setReminderIds,
      addContact,
      updateContact,
      removeContact,
      refresh,
      queueCloudSync,
    }),
    [
      ready,
      config,
      contacts,
      reminderIds,
      checkIn,
      setIntervalDays,
      setMessage,
      setReminderIds,
      addContact,
      updateContact,
      removeContact,
      refresh,
      queueCloudSync,
    ],
  );

  return <AliveContext.Provider value={value}>{children}</AliveContext.Provider>;
}

export function useAlive() {
  const v = useContext(AliveContext);
  if (!v) throw new Error('useAlive outside provider');
  return v;
}

export function useAliveStatus() {
  const { config } = useAlive();
  return aliveStatus(config);
}

export { isExpired };
