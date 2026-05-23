import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminUsers as seedUsers } from "../data/adminData.js";
import { enrichUser } from "../utils/adminUsers.js";
import { adminNotify } from "../utils/adminNotify.js";

export const useAdminUsersStore = create(
  persist(
    (set, get) => ({
      users: seedUsers.map(enrichUser),

      updateUser: (id, patch) => {
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? enrichUser({ ...u, ...patch }) : u)),
        }));
      },

      inviteUser: ({ email, role, status }) => {
        const name = email.split("@")[0].replace(/[._]/g, " ");
        const cap = name.charAt(0).toUpperCase() + name.slice(1);
        const user = enrichUser({
          id: `u-${Date.now().toString(36)}`,
          name: cap,
          email,
          role: role ?? "Traveler",
          travelerStatus: status ?? "new",
          trips: 0,
          bookings: 0,
          totalSpent: 0,
          lastActive: "Invited",
          favoriteDestination: "—",
          averageBudget: 0,
          preferences: [],
          savedTrips: [],
          bookingHistory: [],
          accountStatus: "active",
        });
        set((s) => ({ users: [user, ...s.users] }));
        adminNotify({
          type: "user",
          title: "Traveler invited",
          message: `${cap} · ${email}`,
          link: "/admin/users",
          entityId: user.id,
        });
        return user;
      },

      setTravelerStatus: (id, travelerStatus) => get().updateUser(id, { travelerStatus }),

      deactivateUser: (id) => {
        const user = get().users.find((u) => u.id === id);
        get().updateUser(id, { accountStatus: "deactivated", travelerStatus: "inactive" });
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

      suspendUser: (id) => {
        const user = get().users.find((u) => u.id === id);
        get().updateUser(id, { accountStatus: "suspended" });
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

      bulkDeactivate: (ids) => {
        ids.forEach((id) => get().updateUser(id, { accountStatus: "deactivated", travelerStatus: "inactive" }));
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
    { name: "sta-admin-users-v1", partialize: (s) => ({ users: s.users }) },
  ),
);
