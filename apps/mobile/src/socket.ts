import { io, type Socket } from 'socket.io-client';
import { CLIENT_TOKEN, SERVER_URL } from './config';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!CLIENT_TOKEN) {
    throw new Error('Defina EXPO_PUBLIC_CLIENT_TOKEN');
  }
  if (!socket) {
    socket = io(SERVER_URL, {
      auth: { token: CLIENT_TOKEN, userId: 'default' },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 12,
      reconnectionDelay: 800,
      timeout: 20000,
      forceNew: false,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
