import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiClient } from '../services/apiClient';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, profileData?: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initialized.current) return;
    initialized.current = true;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await apiClient.getCurrentUser();
          if (response.data) {
            setUser(response.data);
          } else {
            apiClient.logout();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        apiClient.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.login(email, password);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setUser(response.data.user);
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, profileData?: any) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.register(email, password, name, profileData);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setUser(response.data.user);
      }
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const response = await apiClient.getCurrentUser();
    if (response.data) {
      setUser(response.data);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // More helpful error message
    console.error('useAuth called outside of AuthProvider. Check your component tree.');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
