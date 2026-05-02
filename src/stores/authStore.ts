import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:      null,
      token:     null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('auth_token', data.token);
          set({ user: data.user, token: data.token });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password, password_confirmation) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, password, password_confirmation });
          localStorage.setItem('auth_token', data.token);
          set({ user: data.user, token: data.token });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        localStorage.removeItem('auth_token');
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch {
          set({ user: null, token: null });
          localStorage.removeItem('auth_token');
        }
      },

      isAdmin:         () => get().user?.role === 'admin',
      isAuthenticated: () => !!get().token && !!get().user,
    }),
    {
      name:    'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
