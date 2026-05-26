import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchAdminNotifications } from "../services/notificationsSync.js";

const MAX_ITEMS = 50;

function readAccessToken() {
  try {
    const raw = localStorage.getItem("sta-auth-v2");
    const parsed = JSON.parse(raw ?? "{}");
    return parsed?.state?.session?.accessToken ?? null;
  } catch {
    return null;
  }
}

export const useAdminNotificationsStore = create(
  persist(
    (set, get) => ({
      items: [],
      loadedFromApi: false,

      hydrateFromApi: async (accessToken) => {
        const token = accessToken ?? readAccessToken();
        if (!token) return;
        try {
          const items = await fetchAdminNotifications(token);
          set({ items: items.slice(0, MAX_ITEMS), loadedFromApi: true });
        } catch {
          set({ loadedFromApi: true });
        }
      },

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
    { name: "sta-admin-notifications-v2", partialize: (s) => ({ items: s.items }) },
  ),
);
