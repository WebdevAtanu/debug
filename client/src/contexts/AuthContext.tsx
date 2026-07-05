import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../services/authService';
import { authService } from '../services/authService';
import { socketService } from '../services/socketService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData.data?.user || userData.data);
        socketService.connect();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        socketService.connect();
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await authService.signup({ username, email, password });
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        socketService.connect();
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      socketService.disconnect();
    }
  };

  const googleLogin = () => {
    authService.googleLogin();
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    googleLogin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
