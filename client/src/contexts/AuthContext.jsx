import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  logout: () => {},
});

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => (typeof window === 'undefined' ? null : getStoredUser()));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    setUser(getStoredUser());

    const handleStorage = (event) => {
      if (event.key === 'user' || event.key === 'token') {
        setUser(getStoredUser());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, setUser, logout }), [user, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
