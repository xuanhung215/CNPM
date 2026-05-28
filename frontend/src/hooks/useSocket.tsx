import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotification } from '../context/NotificationContext';

// Adjust backend URL as needed
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { refreshNotifications } = useNotification();

  useEffect(() => {
    const socketInstance = io(SOCKET_URL);

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
    });

    socketInstance.on('new-notification', () => {
      refreshNotifications();
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [refreshNotifications]);

  return socket;
};
