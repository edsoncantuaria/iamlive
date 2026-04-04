import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { Server, type Socket } from 'socket.io';
import { createAuthRouter } from './auth/router.js';
import { createSyncRouter } from './sync/router.js';
import { verifyAccessToken } from './auth/tokens.js';
import { createDb } from './db.js';
import {
  configureTrustProxy,
  corsMiddleware,
  getCorsOrigin,
  securityHeaders,
} from './httpConfig.js';
import { privacyPageHtml, termsPageHtml } from './legal-html.js';
import { createWaSession, type WhatsAppStatusPayload } from './wa-session.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authRoot = process.env.AUTH_DIR ?? path.join(__dirname, '..', 'data', 'auth');

const PORT = Number(process.env.PORT ?? 3000);
const isProduction = process.env.NODE_ENV === 'production';
/** Em produção o token estático só vale se optar explicitamente (evita bypass acidental do JWT). */
const CLIENT_TOKEN =
  process.env.CLIENT_TOKEN?.trim() &&
  (!isProduction || process.env.ALLOW_CLIENT_TOKEN_IN_PRODUCTION === '1')
    ? process.env.CLIENT_TOKEN.trim()
    : undefined;
const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN ?? `http://localhost:${PORT}`;

const jwtSecretRaw = process.env.JWT_SECRET;
if (typeof jwtSecretRaw !== 'string' || jwtSecretRaw.length === 0) {
  console.error('Defina JWT_SECRET no .env (obrigatório para contas e Socket.IO).');
  process.exit(1);
}
const jwtSecret: string = jwtSecretRaw;

async function main() {
  const db = await createDb();

  const app = express();
  configureTrustProxy(app);
  app.use(securityHeaders());
  app.use(corsMiddleware());
  app.use(express.json({ limit: '512kb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/auth', createAuthRouter(db, jwtSecret, PUBLIC_ORIGIN));
  app.use('/sync', createSyncRouter(db, jwtSecret));

  app.get('/legal/privacy', (_req, res) => {
    res.type('html').send(privacyPageHtml(PUBLIC_ORIGIN));
  });

  app.get('/legal/terms', (_req, res) => {
    res.type('html').send(termsPageHtml(PUBLIC_ORIGIN));
  });

  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: { origin: getCorsOrigin() },
  });

  const sessions = new Map<string, ReturnType<typeof createWaSession>>();
  const startedUsers = new Set<string>();

  function getOrCreateSession(userId: string) {
    let session = sessions.get(userId);
    if (!session) {
      session = createWaSession(
        userId,
        authRoot,
        (event, payload) => {
          io.to(room(userId)).emit(event, payload);
        },
        {
          onHalt: () => {
            startedUsers.delete(userId);
          },
        },
      );
      sessions.set(userId, session);
    }
    return session;
  }

  function room(userId: string) {
    return `user:${userId}`;
  }

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error('unauthorized'));
      return;
    }
    if (CLIENT_TOKEN && token === CLIENT_TOKEN) {
      socket.data.userId = (socket.handshake.auth?.userId as string) ?? 'default';
      next();
      return;
    }
    try {
      const claims = await verifyAccessToken(token, jwtSecret);
      socket.data.userId = claims.sub;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  function emitWhatsAppSnapshot(socket: Socket, userId: string) {
    const session = getOrCreateSession(userId);
    const snap = session.getClientSnapshot();
    socket.emit('whatsapp-status', snap.whatsappStatus);
    if (snap.qr) socket.emit('whatsapp-qr', snap.qr);
  }

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    void socket.join(room(userId));

    emitWhatsAppSnapshot(socket, userId);

    const session = getOrCreateSession(userId);
    if (!startedUsers.has(userId)) {
      startedUsers.add(userId);
      void session.start().catch((err) => {
        console.error('Baileys start error', err);
        startedUsers.delete(userId);
        socket.emit('whatsapp-status', {
          status: 'disconnected',
          shouldReconnect: false,
        } satisfies WhatsAppStatusPayload);
      });
    }

    socket.on('whatsapp-sync', () => {
      emitWhatsAppSnapshot(socket, userId);
    });

    socket.on(
      'send-emergency',
      async (payload: { phones: string[]; message: string }, ack?: (err: Error | null) => void) => {
        try {
          await session.sendTextToContacts(payload.phones, payload.message);
          ack?.(null);
        } catch (e) {
          const err = e instanceof Error ? e : new Error(String(e));
          ack?.(err);
        }
      },
    );

    socket.on('whatsapp-request-pairing', async (payload: { phone?: string }) => {
      try {
        const phone = typeof payload?.phone === 'string' ? payload.phone : '';
        const code = await session.requestPairingForPhone(phone);
        socket.emit('whatsapp-pairing-code', code);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        socket.emit('whatsapp-pairing-error', msg);
      }
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`iamlive-server em http://0.0.0.0:${PORT}`);
  });

  const shutdown = async () => {
    try {
      await db.close();
    } catch {
      /* noop */
    }
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
