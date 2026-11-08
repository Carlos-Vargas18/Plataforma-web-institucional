import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse } from '../types';
import { getUserData, removeUserData, setUserData as saveUserData } from '../services/api';

interface AuthContextType {
  user: AuthResponse | null;
  login: (userData: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);

  useEffect(() => {
    const savedUser = getUserData();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const login = (userData: AuthResponse) => {
    saveUserData(userData);
    setUser(userData);
  };

  const logout = () => {
    removeUserData();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
