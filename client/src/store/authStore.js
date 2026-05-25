import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "../api/authApi.js";
import { ApiError } from "../api/client.js";
import { useBookingStore } from "./bookingStore.js";

function afterAuthSession(session) {
  syncSessionToBooking(session);
  if (session?.accessToken) {
    useBookingStore.getState().syncFromApi(session.accessToken);
  }
}

/** Lab admin — must exist in DB with Admin role (see server seed script). */
export const ADMIN_DEMO = {
  email: "admin@smarttravel.app",
  password: "admin12345",
};

function mapRolesToSessionRole(roles) {
  const list = Array.isArray(roles) ? roles : [];
  if (list.some((r) => String(r).toLowerCase() === "admin")) return "admin";
  return "user";
}

/** Avoid "eljesa eljesa" when first and last name are the same (common for single-name sign-ups). */
export function formatDisplayName(firstName, lastName, email) {
  const first = String(firstName ?? "").trim();
  const last = String(lastName ?? "").trim();
  if (!first && !last) {
    const fromEmail = email?.split("@")[0]?.trim();
    return fromEmail || "User";
  }
  if (!last || last === "." || first.localeCompare(last, undefined, { sensitivity: "accent" }) === 0) {
    return first;
  }
  return `${first} ${last}`;
}

function profileToSession(profile, tokens) {
  const firstName = profile.firstName ?? profile.FirstName ?? "";
  const lastName = profile.lastName ?? profile.LastName ?? "";
  const email = profile.email ?? profile.Email ?? "";
  const name = formatDisplayName(firstName, lastName, email);
  return {
    userId: profile.id ?? profile.Id,
    email: profile.email ?? profile.Email,
    name,
    role: mapRolesToSessionRole(profile.roles ?? profile.Roles),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAtUtc: tokens.expiresAtUtc,
  };
}

function syncSessionToBooking(session) {
  useBookingStore.getState().setAuthFromSession(session);
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      session: null,

      /** @returns {Promise<{ ok: true, role: string } | { ok: false, message: string }>} */
      login: async (email, password, options = {}) => {
        try {
          const tokens = await authApi.login({ email, password });
          const profile = await authApi.getMe(tokens.accessToken);
          const session = profileToSession(profile, tokens);
          if (options.name?.trim() && !session.name) {
            session.name = options.name.trim();
          }
          set({ session });
          afterAuthSession(session);
          return { ok: true, role: session.role };
        } catch (err) {
          const message =
            err instanceof ApiError ? err.message : "Unable to sign in. Check that the API is running.";
          return { ok: false, message };
        }
      },

      /** @returns {Promise<{ ok: true, role: string } | { ok: false, message: string }>} */
      register: async ({ fullName, email, password }) => {
        const parts = fullName.trim().split(/\s+/);
        const name = parts[0] ?? "User";
        const surname = parts.length > 1 ? parts.slice(1).join(" ") : ".";

        try {
          const tokens = await authApi.register({
            name,
            surname,
            email: email.trim(),
            password,
          });
          const profile = await authApi.getMe(tokens.accessToken);
          const session = profileToSession(profile, tokens);
          set({ session });
          afterAuthSession(session);
          return { ok: true, role: session.role };
        } catch (err) {
          const message =
            err instanceof ApiError ? err.message : "Registration failed. Check that the API is running.";
          return { ok: false, message };
        }
      },

      logout: () => {
        set({ session: null });
        syncSessionToBooking(null);
      },

      getAccessToken: () => get().session?.accessToken ?? null,

      isAdmin: () => get().session?.role === "admin",

      /** Re-fetch profile when a stored session exists (e.g. after page load). */
      hydrateProfile: async () => {
        const { session } = get();
        if (!session?.accessToken) return;
        try {
          const profile = await authApi.getMe(session.accessToken);
          const next = profileToSession(profile, {
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            expiresAtUtc: session.expiresAtUtc,
          });
          set({ session: next });
          afterAuthSession(next);
        } catch {
          set({ session: null });
          afterAuthSession(null);
        }
      },
    }),
    {
      name: "sta-auth-v2",
      version: 2,
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state, error) => {
        if (error) return;
        afterAuthSession(state?.session ?? null);
        useAuthStore.getState().hydrateProfile();
      },
    },
  ),
);
