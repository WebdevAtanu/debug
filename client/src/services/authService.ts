import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  provider?: string[];
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/user/login', credentials);
    return response.data;
  },

  signup: async (credentials: SignupCredentials) => {
    const response = await api.post('/user/signup', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/user/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/user/me');
    return response.data;
  },

  checkAuth: async () => {
    const response = await api.post('/user/check-auth');
    return response.data;
  },

  googleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/auth/google`;
  },

  updateBio: async (bio: string) => {
    const response = await api.patch('/user/me/bio', { bio });
    return response.data;
  },
};
