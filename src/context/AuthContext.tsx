import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { setApiToken } from '../api/apiClient';

interface AuthContextType {
  token: string | null;
  role: number | null;
  setAuth: (token: string | null, role: number | null) => void;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('token'));
  const [role, setRoleState] = useState<number | null>(() => {
    const storedRole = localStorage.getItem('role');
    return storedRole ? parseInt(storedRole, 10) : null;
  });

  // Update API client token whenever token changes
  useEffect(() => {
    setApiToken(token);
  }, [token]);

  const setAuth = (newToken: string | null, newRole: number | null) => {
    setTokenState(newToken);
    setRoleState(newRole);

    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }

    if (newRole !== null) {
      localStorage.setItem('role', newRole.toString());
    } else {
      localStorage.removeItem('role');
    }
  };

  const logout = () => setAuth(null, null);

  return (
    <AuthContext.Provider value={{ token, role, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}; 