import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, tokenStorage } from '../lib/api';
import type { AuthResult, User } from '../types';

interface AuthContextValue {
  user: User | null;
  /** `true` mientras se comprueba si el token guardado sigue siendo válido. */
  loading: boolean;
  signIn: (result: AuthResult) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(tokenStorage.get()));

  useEffect(() => {
    if (!tokenStorage.get()) return;

    const controller = new AbortController();
    api
      .me(controller.signal)
      .then(setUser)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        // Token caducado o inválido: se limpia sin molestar al usuario.
        tokenStorage.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const signIn = useCallback((result: AuthResult) => {
    tokenStorage.set(result.token);
    setUser(result.user);
    setLoading(false);
  }, []);

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signOut }), [user, loading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
