import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUser } from '../utils/mockData';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Check existing session with backend on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const me = await authApi.getMe();
        setUser(me);
        const existingToken = localStorage.getItem('token');
        const tokenToSet = existingToken && existingToken !== 'cookie-session' ? existingToken : 'cookie-session';
        setToken(tokenToSet);
        localStorage.setItem('user', JSON.stringify(me));
        localStorage.setItem('token', tokenToSet);
      } catch (err) {
        // If not authenticated or backend unavailable, clean up
        if (err.response && err.response.status === 401) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Auto-logout inactivity timer (15 minutes inactivity)
  useEffect(() => {
    if (!token) return;

    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, 15 * 60 * 1000);
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      // data is { id, email, mobile, name, profilePhotoUrl, token }
      setUser(data);
      const authToken = data.token || 'cookie-session';
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', authToken);
      return { success: true };
    } catch (err) {
      if (!err.response) {
        // Local demo fallback if backend is not reachable
        const demoUser = { ...initialUser, email };
        setUser(demoUser);
        setToken('demo-jwt-token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('token', 'demo-jwt-token');
        return { success: true, isDemo: true };
      }
      return {
        success: false,
        message: err.response?.data?.detail || err.response?.data?.message || 'Email or password is incorrect',
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      await authApi.signup(userData);
      return { success: true };
    } catch (err) {
      if (!err.response) {
        return { success: true, isDemo: true };
      }
      return {
        success: false,
        message: err.response?.data?.detail || err.response?.data?.message || 'Sign up failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore logout errors
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateProfile = async (updatedFields) => {
    try {
      const updated = await authApi.updateProfile(updatedFields);
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      const updated = { ...user, ...updatedFields };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      return { success: true };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
