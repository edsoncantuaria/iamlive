import { io, type Socket } from 'socket.io-client';
import { SERVER_URL } from './config';

let socket: Socket | null = null;
let boundToken: string | null = null;

/**
 * Mantém uma única ligação Socket.IO por token JWT. Troca de utilizador → desliga e recria.
 */
export function ensureSocket(accessToken: string): Socket {
  if (socket && boundToken === accessToken) {
    return socket;
  }
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  boundToken = accessToken;
  socket = io(SERVER_URL, {
    auth: { token: accessToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 12,
    reconnectionDelay: 800,
    timeout: 20000,
    forceNew: false,
  });
  return socket;
}

export function getSocket(): Socket {
  if (!socket || !boundToken) {
    throw new Error('Ligação indisponível. Inicie sessão novamente.');
  }
  return socket;
}

export function disconnectSocket(): void {
  boundToken = null;
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}
