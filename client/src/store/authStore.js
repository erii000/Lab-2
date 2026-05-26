import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "../api/authApi.js";
import { ApiError } from "../api/client.js";
import { useBookingStore } from "./bookingStore.js";
import { formatDisplayName } from "../utils/displayName.js";

export { formatDisplayName };

async function afterAuthSession(session) {
  syncSessionToBooking(session);
  if (!session?.accessToken) return;
  const { pushLocalSavedDestinations, fetchSavedDestinationSlugs } = await import(
    "../services/wishlistSync.js"
  );
  const bookingStore = useBookingStore.getState();
  try {
    await pushLocalSavedDestinations(session.accessToken, bookingStore.savedDestinations);
    const slugs = await fetchSavedDestinationSlugs(session.accessToken);
    if (slugs.length) {
      useBookingStore.setState({ savedDestinations: slugs });
    }
  } catch {
    /* offline */
  }
  await bookingStore.syncFromApi(session.accessToken);
  if (session.role === "admin") {
    const { useAdminBookingsStore } = await import("./adminBookingsStore.js");
    const { useAdminTripsStore } = await import("./adminTripsStore.js");
    const { useAdminUsersStore } = await import("./adminUsersStore.js");
    const { useAdminNotificationsStore } = await import("./adminNotificationsStore.js");
    const token = session.accessToken;
    await Promise.all([
      useAdminBookingsStore.getState().hydrateFromApi(token),
      useAdminTripsStore.getState().hydrateFromApi(token),
      useAdminUsersStore.getState().hydrateFromApi(token),
      useAdminNotificationsStore.getState().hydrateFromApi(token),
    ]);
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

/** Normalize API token payload (camelCase or PascalCase). */
export function normalizeAuthTokens(raw) {
  if (!raw || typeof raw !== "object") return null;
  const accessToken = raw.accessToken ?? raw.AccessToken;
  const refreshToken = raw.refreshToken ?? raw.RefreshToken;
  const expiresAtUtc = raw.expiresAtUtc ?? raw.ExpiresAtUtc;
  if (!accessToken) return null;
  return { accessToken, refreshToken, expiresAtUtc };
}

function isAccessTokenExpired(session, skewMs = 60_000) {
  if (!session?.expiresAtUtc) return false;
  const exp = new Date(session.expiresAtUtc).getTime();
  if (Number.isNaN(exp)) return false;
  return exp - Date.now() < skewMs;
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      session: null,

      /** @returns {Promise<{ ok: true, role: string } | { ok: false, message: string }>} */
      login: async (email, password, options = {}) => {
        try {
          const tokens = normalizeAuthTokens(await authApi.login({ email, password }));
          if (!tokens) return { ok: false, message: "Invalid sign-in response from server." };
          const profile = await authApi.getMe(tokens.accessToken);
          const session = profileToSession(profile, tokens);
          if (options.name?.trim() && !session.name) {
            session.name = options.name.trim();
          }
          set({ session });
          await afterAuthSession(session);
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
        const surname = parts.length > 1 ? parts.slice(1).join(" ") : "";

        try {
          const tokens = normalizeAuthTokens(
            await authApi.register({
              name,
              surname,
              email: email.trim(),
              password,
            }),
          );
          if (!tokens) return { ok: false, message: "Invalid registration response from server." };
          const profile = await authApi.getMe(tokens.accessToken);
          const session = profileToSession(profile, tokens);
          set({ session });
          await afterAuthSession(session);
          return { ok: true, role: session.role };
        } catch (err) {
          const message =
            err instanceof ApiError ? err.message : "Registration failed. Check that the API is running.";
          return { ok: false, message };
        }
      },

      logout: async () => {
        const { session } = get();
        if (session?.accessToken) {
          try {
            await authApi.logout(session.accessToken, session.refreshToken);
          } catch {
            /* clear local session even if API is down */
          }
        }
        set({ session: null });
        syncSessionToBooking(null);
      },

      getAccessToken: () => get().session?.accessToken ?? null,

      /** Refresh JWT when expired; returns a valid access token or null. */
      ensureAccessToken: async () => {
        const { session } = get();
        if (!session?.accessToken) return null;
        if (!isAccessTokenExpired(session)) return session.accessToken;

        if (!session.refreshToken) {
          set({ session: null });
          await afterAuthSession(null);
          return null;
        }

        try {
          const tokens = normalizeAuthTokens(await authApi.refresh(session.refreshToken));
          if (!tokens?.accessToken) throw new Error("Refresh failed");
          const profile = await authApi.getMe(tokens.accessToken);
          const next = profileToSession(profile, {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken ?? session.refreshToken,
            expiresAtUtc: tokens.expiresAtUtc,
          });
          set({ session: next });
          await afterAuthSession(next);
          return next.accessToken;
        } catch {
          set({ session: null });
          await afterAuthSession(null);
          return null;
        }
      },

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
          await afterAuthSession(next);
        } catch {
          set({ session: null });
          await afterAuthSession(null);
        }
      },
    }),
    {
      name: "sta-auth-v2",
      version: 2,
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state, error) => {
        if (error) return;
        void afterAuthSession(state?.session ?? null);
        useAuthStore.getState().hydrateProfile();
      },
    },
  ),
);
