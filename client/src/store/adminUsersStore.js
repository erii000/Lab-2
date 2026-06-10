import { create } from "zustand";
import { persist } from "zustand/middleware";
import { register } from "../api/authApi.js";
import * as usersApi from "../api/usersApi.js";
import { fetchAdminUsers } from "../services/adminDataSync.js";
import { saveUserPreferences } from "../services/travelPreferencesSync.js";
import { enrichUser } from "../utils/adminUsers.js";
import { adminNotify } from "../utils/adminNotify.js";

function parseNumericUserId(id) {
  const n = Number(String(id).replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function readAccessToken() {
  try {
    const raw = localStorage.getItem("sta-auth-v2");
    const parsed = JSON.parse(raw ?? "{}");
    return parsed?.state?.session?.accessToken ?? null;
  } catch {
    return null;
  }
}

export const useAdminUsersStore = create(
  persist(
    (set, get) => ({
      users: [],
      loadedFromApi: false,

      hydrateFromApi: async (accessToken) => {
        const token = accessToken ?? readAccessToken();
        if (!token) return;
        try {
          const users = await fetchAdminUsers(token);
          const sorted = [...users].sort((a, b) => (b.lastActiveAtMs ?? 0) - (a.lastActiveAtMs ?? 0));
          set({ users: sorted, loadedFromApi: true });
        } catch {
          set({ users: [], loadedFromApi: true });
        }
      },

      updateUser: async (id, patch) => {
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? enrichUser({ ...u, ...patch }) : u)),
        }));
        const token = readAccessToken();
        const numericId = parseNumericUserId(id);
        if (!token || !numericId) return;

        try {
          if (patch.accountStatus === "deactivated" || patch.travelerStatus === "inactive") {
            await usersApi.patchUser(token, numericId, { isActive: false });
          } else if (patch.accountStatus === "active") {
            await usersApi.patchUser(token, numericId, { isActive: true });
          }
          if (patch.name) {
            const parts = String(patch.name).trim().split(/\s+/);
            await usersApi.patchUser(token, numericId, {
              firstName: parts[0] ?? "",
              lastName: parts.slice(1).join(" ") || parts[0] || "",
            });
          }
          if (patch.preferences) {
            await saveUserPreferences(token, numericId, patch.preferences, { asAdmin: true });
          }
        } catch {
          /* local state kept */
        }
      },

      inviteUser: async ({ email, role, status }) => {
        const name = email.split("@")[0].replace(/[._]/g, " ");
        const cap = name.charAt(0).toUpperCase() + name.slice(1);
        const tempPassword = `Invite${Date.now().toString(36)}!9Z`;
        try {
          await register({
            name: cap,
            surname: "Traveler",
            email: email.trim(),
            password: tempPassword,
          });
        } catch {
          /* may already exist — refresh list */
        }
        const token = readAccessToken();
        if (token) {
          await get().hydrateFromApi(token);
        }
        adminNotify({
          type: "user",
          title: "Traveler invited",
          message: `${cap} · ${email} (${role ?? "Traveler"})`,
          link: "/admin/users",
        });
        return { email, role: role ?? "Traveler", status: status ?? "new" };
      },

      setTravelerStatus: (id, travelerStatus) => get().updateUser(id, { travelerStatus }),

      deactivateUser: async (id) => {
        const user = get().users.find((u) => u.id === id);
        await get().updateUser(id, { accountStatus: "deactivated", travelerStatus: "inactive" });
        if (user) {
          adminNotify({
            type: "user",
            title: "Account deactivated",
            message: user.name,
            link: "/admin/users",
            entityId: id,
          });
        }
      },

      suspendUser: async (id) => {
        const user = get().users.find((u) => u.id === id);
        await get().updateUser(id, { accountStatus: "suspended", travelerStatus: "inactive" });
        if (user) {
          adminNotify({
            type: "user",
            title: "Account suspended",
            message: user.name,
            link: "/admin/users",
            entityId: id,
          });
        }
      },

      deleteUser: (id) => {
        const user = get().users.find((u) => u.id === id);
        set((s) => ({ users: s.users.filter((u) => u.id !== id) }));
        if (user) {
          adminNotify({
            type: "user",
            title: "User deleted",
            message: user.name,
            link: "/admin/users",
            entityId: id,
          });
        }
      },

      bulkSetStatus: (ids, travelerStatus) => {
        ids.forEach((id) => get().setTravelerStatus(id, travelerStatus));
        if (ids.length) {
          adminNotify({
            type: "user",
            title: "Bulk status update",
            message: `${ids.length} traveler${ids.length > 1 ? "s" : ""} → ${travelerStatus}`,
            link: "/admin/users",
          });
        }
      },

      bulkDeactivate: async (ids) => {
        await Promise.all(
          ids.map((id) =>
            get().updateUser(id, { accountStatus: "deactivated", travelerStatus: "inactive" }),
          ),
        );
        if (ids.length) {
          adminNotify({
            type: "user",
            title: "Bulk deactivation",
            message: `${ids.length} account${ids.length > 1 ? "s" : ""} deactivated`,
            link: "/admin/users",
          });
        }
      },

      bulkDelete: (ids) => {
        set((s) => ({ users: s.users.filter((u) => !ids.includes(u.id)) }));
        if (ids.length) {
          adminNotify({
            type: "user",
            title: "Bulk user removal",
            message: `${ids.length} user${ids.length > 1 ? "s" : ""} deleted`,
            link: "/admin/users",
          });
        }
      },
    }),
    {
      name: "sta-admin-users-v1",
      version: 2,
      partialize: (s) => ({ users: s.users }),
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        if (version < 2) return { ...persisted, users: [], loadedFromApi: false };
        return persisted;
      },
    },
  ),
);
