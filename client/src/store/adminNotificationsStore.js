import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_ITEMS = 50;

const seedNotifications = [
  {
    id: "seed-welcome",
    type: "system",
    title: "Admin workspace active",
    message: "Bookings, trips, and users sync across the dashboard in real time.",
    link: "/admin",
    createdAt: Date.now() - 2 * 3_600_000,
    read: true,
  },
  {
    id: "seed-pending",
    type: "booking",
    title: "Pending bookings need review",
    message: "Check recent reservations and approve or update status.",
    link: "/admin/bookings",
    createdAt: Date.now() - 45 * 60_000,
    read: false,
  },
];

export const useAdminNotificationsStore = create(
  persist(
    (set, get) => ({
      items: seedNotifications,

      push: ({ type, title, message, link, entityId }) => {
        const item = {
          id: `ntf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          type: type ?? "system",
          title,
          message,
          link: link ?? null,
          entityId: entityId ?? null,
          createdAt: Date.now(),
          read: false,
        };
        set((s) => ({
          items: [item, ...s.items].slice(0, MAX_ITEMS),
        }));
        return item;
      },

      markRead: (id) =>
        set((s) => ({
          items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllRead: () =>
        set((s) => ({
          items: s.items.map((n) => ({ ...n, read: true })),
        })),

      remove: (id) =>
        set((s) => ({
          items: s.items.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ items: [] }),

      unreadCount: () => get().items.filter((n) => !n.read).length,
    }),
    { name: "sta-admin-notifications-v1", partialize: (s) => ({ items: s.items }) },
  ),
);
