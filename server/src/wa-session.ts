import makeWASocket, {
  DisconnectReason,
  fetchLatestWaWebVersion,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import type { WASocket, WAVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'node:path';
import pino from 'pino';

/** Por padrão só `error`: o Baileys emite muitos `warn` (ex.: buffer de eventos) que não são falha. Use LOG_LEVEL=debug para diagnóstico. */
const logger = pino({
  level:
    process.env.LOG_LEVEL === 'debug'
      ? 'debug'
      : (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'silent' | undefined) || 'error',
});

export type WhatsAppStatusPayload =
  | { status: 'connected' }
  | {
      status: 'disconnected';
      shouldReconnect: boolean;
      /** Código numérico do WhatsApp/Baileys (ex.: `DisconnectReason.badSession`). */
      disconnectReason?: number;
      /** Mensagem curta para o app (pt-BR). */
      hint?: string;
    }
  | { status: 'connecting' };

/** 405: servidor rejeita cliente (muito comum com `client_revision` do Baileys desatualizada). */
const DISCONNECT_METHOD_NOT_ALLOWED = 405;

/** Reconectar só quando o problema pode ser transitório; evita loop em sessão inválida. */
function shouldAttemptWhatsAppReconnect(code: number | undefined): boolean {
  if (code === undefined) return true;
  const terminal = new Set<number>([
    DisconnectReason.loggedOut,
    DisconnectReason.badSession,
    DisconnectReason.forbidden,
    DisconnectReason.multideviceMismatch,
    DisconnectReason.connectionReplaced,
    DISCONNECT_METHOD_NOT_ALLOWED,
  ]);
  return !terminal.has(code);
}

function disconnectHintPt(code: number | undefined): string | undefined {
  switch (code) {
    case DisconnectReason.loggedOut:
      return 'Sessão encerrada ou credenciais inválidas. Apague a pasta de auth no servidor (ex.: data/auth/default) e conecte de novo com QR ou código.';
    case DisconnectReason.badSession:
      return 'Sessão incompatível ou corrompida. Apague a pasta auth do servidor e faça o pareamento de novo.';
    case DisconnectReason.forbidden:
      return 'Acesso negado pelo WhatsApp. Tente mais tarde ou verifique restrições na conta.';
    case DisconnectReason.multideviceMismatch:
      return 'Ative Aparelhos conectados (multidispositivo) no WhatsApp do celular.';
    case DisconnectReason.connectionReplaced:
      return 'Outra sessão substituiu esta. Encerre outros clientes ou apague a auth no servidor e pareie de novo.';
    case DISCONNECT_METHOD_NOT_ALLOWED:
      return 'WhatsApp recusou o cliente (erro 405). O servidor já tenta usar a revisão mais recente do web.whatsapp.com; se persistir, defina WA_WEB_VERSION no .env ou atualize o pacote @whiskeysockets/baileys.';
    default:
      return undefined;
  }
}

function parseWaWebVersionEnv(raw: string): WAVersion | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/[\s,]+/).map((p) => Number.parseInt(p, 10));
  if (parts.length === 1 && Number.isFinite(parts[0])) {
    return [2, 3000, parts[0]];
  }
  if (
    parts.length === 3 &&
    parts.every((n) => Number.isFinite(n))
  ) {
    return [parts[0], parts[1], parts[2]];
  }
  return null;
}

async function resolveWaWebVersion(): Promise<WAVersion> {
  const fromEnv = process.env.WA_WEB_VERSION
    ? parseWaWebVersionEnv(process.env.WA_WEB_VERSION)
    : null;
  if (fromEnv) {
    logger.info({ version: fromEnv, source: 'WA_WEB_VERSION' }, 'Versão WA Web');
    return fromEnv;
  }

  const { version, isLatest, error } = await fetchLatestWaWebVersion();
  if (!isLatest && error) {
    logger.error(
      { err: error, fallbackVersion: version },
      'Não foi possível obter client_revision em web.whatsapp.com/sw.js; usando versão embutida no Baileys. Defina WA_WEB_VERSION se a conexão falhar com 405.',
    );
  } else {
    logger.info({ version, source: 'sw.js' }, 'Versão WA Web');
  }
  return version;
}

function jidFromPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@s.whatsapp.net`;
}

export type WaSessionOptions = {
  /**
   * Quando o WhatsApp encerra sem reconexão automática (ex.: 401), o host pode liberar o “usuário já iniciado”
   * para que a próxima conexão Socket.IO chame `start()` de novo (útil após apagar a pasta auth).
   */
  onHalt?: () => void;
};

export function createWaSession(
  userId: string,
  authRoot: string,
  emit: (event: 'whatsapp-qr' | 'whatsapp-status', payload: string | WhatsAppStatusPayload) => void,
  options?: WaSessionOptions,
): {
  start: () => Promise<void>;
  sendTextToContacts: (phones: string[], text: string) => Promise<void>;
  getSocket: () => WASocket | null;
  requestPairingForPhone: (phone: string) => Promise<string>;
  getClientSnapshot: () => { whatsappStatus: WhatsAppStatusPayload; qr: string | null };
} {
  let sock: WASocket | null = null;
  const authDir = path.join(authRoot, userId);

  /** Último estado emitido — clientes que conectam depois recebem cópia via `getClientSnapshot` / `whatsapp-sync`. */
  let lastWhatsAppStatus: WhatsAppStatusPayload = { status: 'connecting' };
  let lastQr: string | null = null;

  function pushStatus(p: WhatsAppStatusPayload) {
    lastWhatsAppStatus = p;
    if (p.status === 'connected') lastQr = null;
    emit('whatsapp-status', p);
  }

  function pushQr(q: string) {
    lastQr = q;
    emit('whatsapp-qr', q);
  }

  function getClientSnapshot(): { whatsappStatus: WhatsAppStatusPayload; qr: string | null } {
    const qr = lastWhatsAppStatus.status === 'connected' ? null : lastQr;
    return { whatsappStatus: lastWhatsAppStatus, qr };
  }

  /** Dígitos pendentes para requestPairingCode (E.164 sem +, ex.: 5511987654321). */
  let pendingPairingDigits: string | null = null;
  let pairingInFlight = false;
  /** Já recebemos `connecting` ou `qr` — dá para pedir código mesmo que o usuário só aperte o botão depois. */
  let sawPairingWindow = false;
  let pairingResolve: ((code: string) => void) | null = null;
  let pairingReject: ((e: Error) => void) | null = null;
  let pairingTimer: ReturnType<typeof setTimeout> | null = null;

  function clearPairingWait(reason: Error) {
    if (pairingTimer) {
      clearTimeout(pairingTimer);
      pairingTimer = null;
    }
    pairingReject?.(reason);
    pairingResolve = null;
    pairingReject = null;
    pendingPairingDigits = null;
    pairingInFlight = false;
  }

  function resolvePairing(code: string) {
    if (pairingTimer) {
      clearTimeout(pairingTimer);
      pairingTimer = null;
    }
    pairingResolve?.(code);
    pairingResolve = null;
    pairingReject = null;
    pendingPairingDigits = null;
    pairingInFlight = false;
  }

  /**
   * O Baileys/WhatsApp esperam o pedido de código nesta janela (connecting ou quando já há QR).
   * Ver: https://baileys.wiki/docs/socket/connecting/ — "Pairing Code login"
   */
  async function runPairingWhenReady(): Promise<void> {
    if (!pendingPairingDigits || !sock || pairingInFlight) return;
    if (sock.authState.creds.registered) {
      clearPairingWait(new Error('WhatsApp já autenticado neste servidor.'));
      return;
    }
    pairingInFlight = true;
    const digits = pendingPairingDigits;
    try {
      await sock.waitForSocketOpen();
      const code = await sock.requestPairingCode(digits);
      resolvePairing(code);
    } catch (e) {
      pairingInFlight = false;
      const err = e instanceof Error ? e : new Error(String(e));
      logger.warn({ err }, 'requestPairingCode falhou');
      clearPairingWait(err);
    }
  }

  const start = async (): Promise<void> => {
    pushStatus({ status: 'connecting' });
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const waVersion = await resolveWaWebVersion();

    sock = makeWASocket({
      auth: state,
      logger,
      version: waVersion,
      printQRInTerminal: false,
      /** Evita sincronizar histórico completo — reduz buffer de eventos e os “Buffer timeout reached, auto-flushing”. */
      syncFullHistory: false,
      shouldSyncHistoryMessage: () => false,
      markOnlineOnConnect: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      const { qr, connection, lastDisconnect } = update;

      if (connection === 'connecting' || qr) {
        sawPairingWindow = true;
      }

      if (pendingPairingDigits && sock && (connection === 'connecting' || qr)) {
        void runPairingWhenReady();
      }

      if (qr) {
        pushQr(qr);
      }
      if (connection === 'open') {
        pushStatus({ status: 'connected' });
      }
      if (connection === 'close') {
        const err = lastDisconnect?.error as Boom | undefined;
        const code = err?.output?.statusCode;
        const shouldReconnect = shouldAttemptWhatsAppReconnect(code);
        logger.error(
          {
            disconnectReason: code,
            disconnectMessage: err?.message,
            disconnectData: err?.data,
            willReconnect: shouldReconnect,
          },
          'Conexão WhatsApp encerrada',
        );
        lastQr = null;
        pushStatus({
          status: 'disconnected',
          shouldReconnect,
          disconnectReason: code,
          hint: shouldReconnect ? undefined : disconnectHintPt(code),
        });
        sawPairingWindow = false;
        sock = null;
        if (pendingPairingDigits && pairingReject) {
          clearPairingWait(new Error('Conexão fechada antes de concluir o pareamento.'));
        }
        if (shouldReconnect) {
          void start();
        } else {
          options?.onHalt?.();
        }
      }
    });
  };

  const getSocket = () => sock;

  const sendTextToContacts = async (phones: string[], text: string): Promise<void> => {
    const s = sock;
    if (!s) {
      throw new Error('WhatsApp não conectado');
    }
    for (const phone of phones) {
      const jid = jidFromPhone(phone);
      await s.sendMessage(jid, { text });
    }
  };

  const requestPairingForPhone = async (phone: string): Promise<string> => {
    const deadline = Date.now() + 45000;
    let s = sock;
    while (!s && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 320));
      s = sock;
    }
    if (!s) {
      throw new Error('Sessão WhatsApp ainda não está pronta. Espera um instante ou abre esta tela de novo.');
    }
    if (s.authState.creds.registered) {
      throw new Error('WhatsApp já autenticado neste servidor.');
    }

    const digits = phone.replace(/\D/g, '');
    if (!digits.startsWith('55') || digits.length < 12 || digits.length > 13) {
      throw new Error(
        'Número inválido: use celular do Brasil com DDD (E.164), ex.: 5511987654321.',
      );
    }

    pendingPairingDigits = digits;

    return new Promise((resolve, reject) => {
      const wrapResolve = (code: string) => {
        resolve(code);
      };
      const wrapReject = (e: Error) => {
        reject(e);
      };

      pairingResolve = wrapResolve;
      pairingReject = wrapReject;

      pairingTimer = setTimeout(() => {
        clearPairingWait(
          new Error(
            'Tempo esgotado ao gerar código. Toque em “Reiniciar conexão”, abra esta tela de novo e peça o código logo em seguida (o WhatsApp só aceita na janela certa).',
          ),
        );
      }, 120_000);

      /** Usuário apertou depois de já termos `connecting`/QR — tenta na hora. */
      if (sawPairingWindow && sock) {
        void runPairingWhenReady();
      }
    });
  };

  return { start, sendTextToContacts, getSocket, requestPairingForPhone, getClientSnapshot };
}
