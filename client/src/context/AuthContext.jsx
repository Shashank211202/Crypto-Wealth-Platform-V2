/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, createContext } from 'react';
import { authService, authEvents } from '../services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial check
    const initAuth = async () => {
        const currentUser = await authService.checkAuth();
        setUser(currentUser);
        setLoading(false);
    }
    initAuth();

    // Subscribe to events
    const unsubscribeLogin = authEvents.on('login', (u) => setUser(u));
    const unsubscribeLogout = authEvents.on('logout', () => setUser(null));

    return () => {
      unsubscribeLogin();
      unsubscribeLogout();
    };
  }, []);

  const login = async (email, password) => {
    return authService.login(email, password);
  };

  const register = async (data) => {
    return authService.register(data);
  };

  const logout = async () => {
    return authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
