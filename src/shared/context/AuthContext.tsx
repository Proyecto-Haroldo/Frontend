import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { setApiToken } from '../../api/apiClient';

interface AuthContextType {
  token: string | null;
  role: number | null;
  userId: number | null;
  setAuth: (
    token: string | null,
    role: number | null,
    userId: number | null
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem('token')
  );

  const [role, setRoleState] = useState<number | null>(() => {
    const storedRole = localStorage.getItem('role');
    return storedRole ? parseInt(storedRole, 10) : null;
  });

  const [userId, setUserIdState] = useState<number | null>(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId, 10) : null;
  });

  const setAuth = useCallback(
    (newToken: string | null, newRole: number | null, newUserId: number | null) => {
      setTokenState(newToken);
      setRoleState(newRole);
      setUserIdState(newUserId);

      if (newToken) localStorage.setItem('token', newToken);
      else localStorage.removeItem('token');

      if (newRole !== null) localStorage.setItem('role', newRole.toString());
      else localStorage.removeItem('role');

      if (newUserId !== null) localStorage.setItem('userId', newUserId.toString());
      else localStorage.removeItem('userId');
    },
    []
  );

  const logout = useCallback(() => {
    setAuth(null, null, null);
  }, [setAuth]);

  // Sync token with API client
  useEffect(() => {
    setApiToken(token);
  }, [token]);

  // Auto logout when token expires
  useEffect(() => {
    if (!token) {
      setApiToken(null);
      return;
    }

    let timer: NodeJS.Timeout;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;

      if (!exp) return;

      const timeLeft = exp * 1000 - Date.now();

      if (timeLeft <= 0) {
        logout();
        return;
      }

      timer = setTimeout(() => {
        logout();
      }, timeLeft);
    } catch {
      logout();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ token, role, userId, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};