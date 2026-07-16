import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id:         string;
  nama:       string;
  email:      string;
  role:       string;
  no_telepon?: string;
  kampus?:     string;
  prodi?:      string;
  angkatan?:   string;
}

interface AuthState {
  token:   string | null;
  user:    User | null;
  setAuth: (token: string, user: User) => void;
  setUser: (user: Partial<User>) => void;
  logout:  () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token:   null,
      user:    null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'geokost-auth',
    }
  )
);
