import React, { createContext, useContext, useEffect, useState } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [queueDurationMinutes, setQueueDurationMinutes] = useState(30);
  const [matchData, setMatchData] = useState(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      const s = connectSocket();
      setSocket(s);

      if (s) {
        s.on('connect', () => setIsConnected(true));
        s.on('disconnect', () => setIsConnected(false));

        s.on('queue:waiting', (data) => {
          setIsSearchingMatch(true);
          if (data?.durationMinutes) {
            setQueueDurationMinutes(data.durationMinutes);
          }
        });

        s.on('queue:matched', (data) => {
          setIsSearchingMatch(false);
          setMatchData(data);
        });

        s.on('queue:left', () => {
          setIsSearchingMatch(false);
        });

        s.on('queue:error', (err) => {
          setIsSearchingMatch(false);
          console.error('[Socket] Matchmaking queue error:', err);
        });

        return () => {
          s.off('connect');
          s.off('disconnect');
          s.off('queue:waiting');
          s.off('queue:matched');
          s.off('queue:left');
          s.off('queue:error');
        };
      }
    } else {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      setIsSearchingMatch(false);
      setMatchData(null);
    }
  }, [isAuthenticated, token]);

  const joinQueue = (durationMinutes = 30) => {
    const s = getSocket() || socket;
    if (s && isConnected) {
      setQueueDurationMinutes(durationMinutes);
      s.emit('queue:join', { durationMinutes });
      setIsSearchingMatch(true);
    }
  };

  const leaveQueue = () => {
    const s = getSocket() || socket;
    if (s) {
      s.emit('queue:leave');
      setIsSearchingMatch(false);
    }
  };

  const clearMatchData = () => {
    setMatchData(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        isSearchingMatch,
        queueDurationMinutes,
        matchData,
        joinQueue,
        leaveQueue,
        clearMatchData,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
