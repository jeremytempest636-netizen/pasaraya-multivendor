import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, SessionUser } from "@/types";

interface AuthState {
  token: string | null;
  user: SessionUser | null;
  setSession: (res: AuthResponse) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (res) =>
        set({ token: res.token, user: { name: res.name, email: res.email, role: res.role } }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "pasaraya-auth" },
  ),
);
