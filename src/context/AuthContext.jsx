import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('restaurant_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('restaurant_user');
    return stored ? JSON.parse(stored) : null;
  });

  async function login(username, password) {
    const { data } = await api.post('/api/auth/login', { username, password });
    localStorage.setItem('restaurant_token', data.token);
    localStorage.setItem('restaurant_user', JSON.stringify({ username: data.username, role: data.role }));
    setToken(data.token);
    setUser({ username: data.username, role: data.role });
    return data;
  }

  function logout() {
    localStorage.removeItem('restaurant_token');
    localStorage.removeItem('restaurant_user');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, isAuthenticated: Boolean(token), login, logout }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
