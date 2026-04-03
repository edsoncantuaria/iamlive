import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import type { AppConfig, EmergencyContact } from '../lib/appState';
import { DEFAULT_REMINDER_IDS, type ReminderOffsetId } from '../lib/reminderOffsets';
import { aliveStatus, deadlineOf, isExpired } from '../lib/appState';
import {
  installNotificationHandlerIfSupported,
  requestNotificationPermissionsSafe,
  scheduleReminders,
} from '../lib/notifications';
import { syncHomeWidgetsFromConfig } from '../lib/syncHomeWidgets';
import * as storage from '../lib/storage';
import { CLIENT_TOKEN } from '../config';
import { getSocket } from '../socket';

installNotificationHandlerIfSupported();

/** Aviso enviado ao cadastrar — a pessoa fica ciente do papel de contato de confiança. */
async function sendWelcomeNoticeToContact(c: EmergencyContact): Promise<void> {
  if (!CLIENT_TOKEN) return;
  const sock = getSocket();
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
  addContact: (c: EmergencyContact) => Promise<void>;
  updateContact: (i: number, c: EmergencyContact) => Promise<void>;
  removeContact: (i: number) => Promise<void>;
  refresh: () => Promise<void>;
};

const AliveContext = createContext<Ctx | null>(null);

export function AliveProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<AppConfig>({
    intervalDays: 3,
    emergencyMessage: '',
    lastCheckIn: null,
  });
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [reminderIds, setReminderIdsState] = useState<ReminderOffsetId[]>([...DEFAULT_REMINDER_IDS]);

  const refresh = useCallback(async () => {
    const [c, ct, rid] = await Promise.all([
      storage.loadConfig(),
      storage.loadContacts(),
      storage.loadReminderIds(),
    ]);
    setConfig(c);
    setContacts(ct);
    setReminderIdsState(rid);
    const dl = deadlineOf(c);
    if (dl && c.lastCheckIn) {
      await scheduleReminders(dl);
    }
    await syncHomeWidgetsFromConfig(c);
  }, []);

  const setReminderIds = useCallback(async (ids: ReminderOffsetId[]) => {
    await storage.saveReminderIds(ids);
    setReminderIdsState(ids);
    const c = await storage.loadConfig();
    const dl = deadlineOf(c);
    if (dl && c.lastCheckIn) {
      await scheduleReminders(dl);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await requestNotificationPermissionsSafe();
      await refresh();
      setReady(true);
    })();
  }, [refresh]);

  useEffect(() => {
    if (!ready) return;
    const dl = deadlineOf(config);
    if (!dl || !isExpired(config) || contacts.length === 0) return;

    let cancelled = false;

    (async () => {
      const sent = await storage.getEmergencySentDeadline();
      if (sent === dl.getTime()) return;

      try {
        const sock = getSocket();
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
        await storage.setEmergencySentDeadline(dl.getTime());
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        Alert.alert(
          'Não foi possível avisar os contatos',
          'Não foi possível enviar pelo WhatsApp agora. Verifique a internet e a tela Estou Vivo no WhatsApp.\n\n' +
            msg,
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, config, contacts]);

  const checkIn = useCallback(async () => {
    const now = new Date();
    await storage.saveLastCheckIn(now);
    await storage.clearEmergencySent();
    const c = await storage.loadConfig();
    setConfig(c);
    const dl = deadlineOf(c);
    if (dl) await scheduleReminders(dl);
    await syncHomeWidgetsFromConfig(c);
  }, []);

  const setIntervalDays = useCallback(
    async (n: number) => {
      const next = { ...config, intervalDays: n };
      await storage.saveIntervalDays(n);
      setConfig(next);
      const dl = deadlineOf(next);
      if (dl && next.lastCheckIn) await scheduleReminders(dl);
      await syncHomeWidgetsFromConfig(next);
    },
    [config],
  );

  const setMessage = useCallback(async (s: string) => {
    await storage.saveMessage(s);
    setConfig((c) => ({ ...c, emergencyMessage: s }));
  }, []);

  const addContact = useCallback(
    async (c: EmergencyContact) => {
      if (contacts.length >= 2) return;
      const next = [...contacts, c];
      await storage.saveContacts(next);
      setContacts(next);
      void sendWelcomeNoticeToContact(c).catch((e) => {
        const msg = e instanceof Error ? e.message : String(e);
        Alert.alert(
          'Contato salvo',
            'Não foi possível enviar o aviso pelo WhatsApp agora. A pessoa continua cadastrada e será avisada se o prazo de emergência expirar. Confira a tela Estou Vivo no WhatsApp.\n\n' +
            msg,
        );
      });
    },
    [contacts],
  );

  const updateContact = useCallback(
    async (i: number, c: EmergencyContact) => {
      if (i < 0 || i >= contacts.length) return;
      const next = contacts.slice();
      next[i] = c;
      await storage.saveContacts(next);
      setContacts(next);
    },
    [contacts],
  );

  const removeContact = useCallback(
    async (i: number) => {
      if (i < 0 || i >= contacts.length) return;
      const next = contacts.filter((_, j) => j !== i);
      await storage.saveContacts(next);
      setContacts(next);
    },
    [contacts],
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
