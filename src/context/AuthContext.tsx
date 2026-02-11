import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as api from '../lib/api';

type User = { uid: string; email: string; name: string; role: string };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api.getMe()
      .then((u) => {
        if (u.role !== 'admin') {
          api.clearToken();
          setUser(null);
        } else {
          setUser({
            uid: u.uid,
            email: u.email,
            name: u.name || u.email,
            role: u.role,
          });
        }
      })
      .catch(() => {
        api.clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const data = await api.login(username, password);
    api.setToken(data.token);
    setUser({
      uid: data.user.uid,
      email: data.user.email,
      name: data.user.name || data.user.email,
      role: data.user.role,
    });
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
