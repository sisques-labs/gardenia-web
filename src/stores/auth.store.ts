import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  currentUser: { id: string; email: string } | null;
  setAccessToken: (token: string | null) => void;
  setCurrentUser: (user: { id: string; email: string } | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  currentUser: null,
  setAccessToken: (token) => set({ accessToken: token }),
  setCurrentUser: (user) => set({ currentUser: user }),
  clearAuth: () => set({ accessToken: null, currentUser: null }),
}));
