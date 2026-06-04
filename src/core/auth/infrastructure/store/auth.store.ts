import { create } from 'zustand';
import type { AccountUser } from '@/core/auth/domain/models/account-user.model';

interface AuthState {
  accessToken: string | null;
  currentUser: AccountUser | null;
  isBootComplete: boolean;
  setAccessToken: (token: string | null) => void;
  setCurrentUser: (user: AccountUser | null) => void;
  clearAuth: () => void;
  setBootComplete: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  currentUser: null,
  isBootComplete: false,
  setAccessToken: (token) => set({ accessToken: token }),
  setCurrentUser: (user) => set({ currentUser: user }),
  clearAuth: () => set({ accessToken: null, currentUser: null }),
  setBootComplete: () => set({ isBootComplete: true }),
}));

export const isAuthenticated = () => useAuthStore.getState().accessToken !== null;
