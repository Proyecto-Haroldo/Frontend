import {
  createContext, useContext, useState, useMemo,
  type ReactNode, useEffect, useCallback
} from 'react';
import { setApiToken } from '../../api/apiClient';
import { isTokenExpired } from '../utils/checkTokenExpiration';

interface AuthContextType {
  token: string | null;
  role: number | null;
  userId: number | null;
  userStatus: string | null;
  userSpecialities: any[] | null;
  setAuth: (
    token: string | null,
    role: number | null,
    userId: number | null,
    userStatus?: string | null,
    userSpecialities?: any[] | null
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

  const [userStatus, setUserStatus] = useState<string | null>(() =>
    localStorage.getItem('userStatus')
  );

  const [userSpecialities, setUserSpecialities] = useState<any[] | null>(() => {
    const storedSpecialities = localStorage.getItem('userSpecialities');
    return storedSpecialities ? JSON.parse(storedSpecialities) : null;
  });

  const setAuth = useCallback(
    (newToken: string | null, newRole: number | null, newUserId: number | null, newUserStatus?: string | null, userSpecialities?: any[] | null) => {
      setTokenState(newToken);
      setRoleState(newRole);
      setUserIdState(newUserId);
      setUserStatus(newUserStatus || null);

      if (userSpecialities !== undefined) {
        setUserSpecialities(userSpecialities);
        if (userSpecialities) {
          localStorage.setItem('userSpecialities', JSON.stringify(userSpecialities));
        } else {
          localStorage.removeItem('userSpecialities');
        }
      }

      if (newToken) localStorage.setItem('token', newToken);
      else localStorage.removeItem('token');

      if (newRole !== null) localStorage.setItem('role', newRole.toString());
      else localStorage.removeItem('role');

      if (newUserId !== null) localStorage.setItem('userId', newUserId.toString());
      else localStorage.removeItem('userId');

      if (newUserStatus) localStorage.setItem('userStatus', newUserStatus);
      else localStorage.removeItem('userStatus');
    },
    []
  );

  const logout = useCallback(() => {
    setAuth(null, null, null, null, null);

    localStorage.removeItem('questionnaireData');
    localStorage.removeItem('aiRecommendation');

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

    const check = () => {
      if (isTokenExpired(token)) {
        console.warn("Token expired → logout");
        logout();
      }
    };

    check();

    const interval = setInterval(check, 10000);

    return () => clearInterval(interval);
  }, [token, logout]);

  const contextValue = useMemo(() => ({
    token, role, userId, userStatus, userSpecialities, setAuth, logout
  }), [token, role, userId, userStatus, userSpecialities, setAuth, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
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