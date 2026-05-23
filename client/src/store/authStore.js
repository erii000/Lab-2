import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useBookingStore } from "./bookingStore.js";

/** Demo admin credentials for lab / local use */
export const ADMIN_DEMO = {
  email: "admin@smarttravel.app",
  password: "admin12345",
};

function syncSessionToBooking(session) {
  useBookingStore.getState().setAuthFromSession(session);
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      session: null,

      login: (email, password, options = {}) => {
        const normalized = email.trim().toLowerCase();
        if (normalized === ADMIN_DEMO.email && password === ADMIN_DEMO.password) {
          const session = {
            email: normalized,
            name: options.name?.trim() || "Admin",
            role: "admin",
          };
          set({ session });
          syncSessionToBooking(session);
          return { ok: true, role: "admin" };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(normalized) && password.length >= 8) {
          const session = {
            email: normalized,
            name: options.name?.trim() || normalized.split("@")[0],
            role: "user",
          };
          set({ session });
          syncSessionToBooking(session);
          return { ok: true, role: "user" };
        }
        return { ok: false, message: "Invalid email or password." };
      },

      /** Clears session; booking drafts remain, traveler reverts to guest profile */
      logout: () => {
        set({ session: null });
        syncSessionToBooking(null);
      },

      isAdmin: () => get().session?.role === "admin",
    }),
    {
      name: "sta-auth-v1",
      version: 1,
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state, error) => {
        if (error) return;
        syncSessionToBooking(state?.session ?? null);
      },
    },
  ),
);
