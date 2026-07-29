import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('devduel_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('devduel_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/users/me');
          if (res.success) {
            setUser(res.data);
            localStorage.setItem('devduel_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session restoration failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('devduel_token', res.data.token);
      localStorage.setItem('devduel_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('devduel_token', res.data.token);
      localStorage.setItem('devduel_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const loginWithOAuthToken = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('devduel_token', newToken);
    if (newUser) {
      localStorage.setItem('devduel_user', JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('devduel_token');
    localStorage.removeItem('devduel_user');
  };

  const updateUserProfile = (updatedData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('devduel_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        loginWithOAuthToken,
        updateUserProfile,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
