import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

/**
 * Returns a singleton Socket.IO instance configured for reliable
 * connectivity behind reverse proxies, SSL termination, and iframes.
 */
export function getAppSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io({
      path: '/socket.io/',
      // Start with HTTP polling for guaranteed compatibility behind proxies/iframes,
      // and allow automatic upgrade to WebSockets when supported.
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log(
        '[LiveSync] Real-time socket connected:',
        socketInstance?.id,
        'Transport:',
        socketInstance?.io?.engine?.transport?.name
      );
    });

    socketInstance.on('connect_error', (err) => {
      // Non-fatal error; Socket.io will automatically retry via polling
      console.warn('[LiveSync] Socket connection notice (polling fallback active):', err.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[LiveSync] Socket disconnected:', reason);
    });
  }

  if (socketInstance.disconnected) {
    socketInstance.connect();
  }

  return socketInstance;
}
