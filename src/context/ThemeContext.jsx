import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'theme';

const getSystemDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

const readStoredTheme = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch {
    return 'system';
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(readStoredTheme);

  const apply = useCallback((t) => {
    const isDark = t === 'dark' || (t === 'system' && getSystemDark());
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    apply(theme);
    if (theme !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme, apply]);

  const setTheme = useCallback((t) => {
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* storage unavailable: ignore */
    }
    setThemeState(t);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
