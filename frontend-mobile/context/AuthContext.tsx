import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@/lib/api/types';

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function decodeJwt(token: string): Partial<User> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(pad);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as Partial<User>;
  } catch {
    return null;
  }
}

type AuthContextValue = {
  ready: boolean;
  token: string | null;
  user: User | null;
  login: (newToken: string, userData: User) => void;
  logout: () => void;
  isAdmin: boolean;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [t, uRaw] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (cancelled) return;
        setToken(t);
        if (uRaw) {
          try {
            setUser(JSON.parse(uRaw) as User);
          } catch {
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
      else await AsyncStorage.removeItem(TOKEN_KEY);
    })();
  }, [token, ready]);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      else await AsyncStorage.removeItem(USER_KEY);
    })();
  }, [user, ready]);

  useEffect(() => {
    if (token && !user) {
      const payload = decodeJwt(token);
      if (payload?.id != null && payload?.role) {
        setUser({
          id: payload.id as number,
          username: (payload.username as string) || 'user',
          email: (payload.email as string) || '',
          role: payload.role as string,
        });
      }
    }
  }, [token, user]);

  const login = useCallback((newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      token,
      user,
      login,
      logout,
      isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    }),
    [ready, token, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus di dalam AuthProvider');
  }
  return ctx;
}
