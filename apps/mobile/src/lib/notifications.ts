import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { REMINDER_OPTIONS, type ReminderOffsetId } from './reminderOffsets';
import { loadReminderIds } from './storage';

/** No Expo Go para Android (SDK 53+), notificações locais/remotas foram limitadas — evita erro em runtime. */
export const notificationsUnavailableInExpoGoAndroid =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient && Platform.OS === 'android';

const REMINDER_CHANNEL = 'check-in-reminders';

async function ensureAndroidReminderChannel(): Promise<void> {
  if (notificationsUnavailableInExpoGoAndroid || Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
      name: 'Lembretes de check-in',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  } catch (e) {
    console.warn('Canal de notificações Android:', e);
  }
}

let handlerInstalled = false;

export function installNotificationHandlerIfSupported(): void {
  if (handlerInstalled || notificationsUnavailableInExpoGoAndroid) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerInstalled = true;
  } catch {
    // ignora se Expo Go / plataforma não suportar
  }
}

export async function requestNotificationPermissionsSafe(): Promise<void> {
  if (notificationsUnavailableInExpoGoAndroid) return;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notificações não autorizadas');
    }
  } catch (e) {
    console.warn('Permissão de notificações:', e);
  }
}

function reminderCopy(id: ReminderOffsetId): { title: string; body: string } {
  switch (id) {
    case '24h':
      return {
        title: 'Estou Vivo! — falta 1 dia',
        body: 'Falta 1 dia para o limite do seu check-in. Abra o app e confirme que está bem.',
      };
    case '12h':
      return {
        title: 'Estou Vivo! — 12 horas',
        body: 'Faltam 12 horas para o prazo. Reserve um momento para o check-in.',
      };
    case '10h':
      return {
        title: 'Estou Vivo! — 10 horas',
        body: 'Faltam 10 horas. Um toque no app evita o alerta para os contatos.',
      };
    case '6h':
      return {
        title: 'Estou Vivo! — 6 horas',
        body: 'Faltam 6 horas. Confirme que está tudo bem.',
      };
    case '1h':
      return {
        title: 'Estou Vivo! — 1 hora',
        body: 'Falta 1 hora! Toque no app para confirmar.',
      };
    case '10m':
      return {
        title: 'Estou Vivo! — últimos minutos',
        body: 'Faltam 10 minutos. Abra o app e faça o check-in agora.',
      };
    case 'at_deadline':
      return {
        title: 'Prazo do check-in — Estou Vivo!',
        body: 'É agora: confirme no app ou em seguida os contatos podem ser avisados.',
      };
  }
}

/**
 * Agenda notificações locais conforme preferências salvas, antes do limite `dl`.
 */
export async function scheduleReminders(dl: Date): Promise<void> {
  if (notificationsUnavailableInExpoGoAndroid) {
    return;
  }
  try {
    await ensureAndroidReminderChannel();
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = Date.now();
    const enabled = new Set(await loadReminderIds());

    for (const opt of REMINDER_OPTIONS) {
      if (!enabled.has(opt.id)) continue;
      const when =
        opt.beforeMs === 0 ? new Date(dl.getTime()) : new Date(dl.getTime() - opt.beforeMs);
      if (when.getTime() <= now) continue;
      const { title, body } = reminderCopy(opt.id);
      await Notifications.scheduleNotificationAsync({
        identifier: `reminder-${opt.id}`,
        content: {
          title,
          body,
          ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL } : {}),
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
      });
    }
  } catch (e) {
    console.warn('Agendar lembretes:', e);
  }
}
