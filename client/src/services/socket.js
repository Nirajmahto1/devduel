import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem('devduel_token');
  if (!token) return null;

  if (socket && socket.connected) {
    return socket;
  }

  const socketUrl = window.location.origin;

  socket = io(socketUrl, {
    auth: {
      token: `Bearer ${token}`,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
