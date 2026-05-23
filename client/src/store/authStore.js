import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Demo admin credentials for lab / local use */
export const ADMIN_DEMO = {
  email: "admin@smarttravel.app",
  password: "admin12345",
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      session: null,

      login: (email, password) => {
        const normalized = email.trim().toLowerCase();
        if (normalized === ADMIN_DEMO.email && password === ADMIN_DEMO.password) {
          set({
            session: {
              email: normalized,
              name: "Admin",
              role: "admin",
            },
          });
          return { ok: true, role: "admin" };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(normalized) && password.length >= 8) {
          set({
            session: {
              email: normalized,
              name: normalized.split("@")[0],
              role: "user",
            },
          });
          return { ok: true, role: "user" };
        }
        return { ok: false, message: "Invalid email or password." };
      },

      logout: () => set({ session: null }),

      isAdmin: () => get().session?.role === "admin",
    }),
    {
      name: "sta-auth-v1",
      partialize: (state) => ({ session: state.session }),
    },
  ),
);
