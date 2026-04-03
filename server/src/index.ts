import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server, type Socket } from 'socket.io';
import { createWaSession, type WhatsAppStatusPayload } from './wa-session.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authRoot = process.env.AUTH_DIR ?? path.join(__dirname, '..', 'data', 'auth');

const PORT = Number(process.env.PORT ?? 3000);
const CLIENT_TOKEN = process.env.CLIENT_TOKEN;

if (!CLIENT_TOKEN) {
  console.error('Defina CLIENT_TOKEN no .env');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*' },
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

io.use((socket, next) => {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token || token !== CLIENT_TOKEN) {
    next(new Error('unauthorized'));
    return;
  }
  socket.data.userId = (socket.handshake.auth?.userId as string) ?? 'default';
  next();
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
