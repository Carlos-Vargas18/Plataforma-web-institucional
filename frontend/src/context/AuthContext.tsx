import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState, Role } from '../types';
import { api } from '../services/api';
import { getStoredToken, setStoredToken } from '../services/api/httpClient';

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const logout = useCallback(() => {
    setStoredToken(null);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      const verifiedUser = await api.getMe();
      setState({
        user: { ...verifiedUser, token },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('educonnect:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('educonnect:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = (userData: User) => {
    const rolNormalizado = (userData.rol?.toUpperCase() || 'ESTUDIANTE') as Role;
    const normalizedUser: User = {
      ...userData,
      rol: rolNormalizado,
    };
    if (normalizedUser.token) {
      setStoredToken(normalizedUser.token);
    }
    setState({
      user: normalizedUser,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export function getHomeRouteForRole(rol?: Role): string {
  switch (rol) {
    case 'ADMIN':
    case 'ADMINISTRATIVO':
      return '/admin';
    case 'RECTOR':
      return '/rector';
    case 'COORDINADOR':
      return '/coordinador';
    case 'DOCENTE':
    case 'DIRECTOR_GRUPO':
      return '/docente';
    case 'TUTOR':
      return '/tutor';
    case 'ESTUDIANTE':
    default:
      return '/estudiante';
  }
}
