import { create } from "zustand";
import { persist } from "zustand/middleware";
import { listOpsNotifications, markNotificationRead } from "../api/notificationsApi.js";
import { parseApiDate } from "../utils/parseApiDate.js";
import { toAdminNotificationView } from "../utils/notificationMessages.js";

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

function resolveServerId(item) {
  if (item?.serverId != null) return Number(item.serverId);
  const match = String(item?.id ?? "").match(/^ops-(\d+)$/);
  return match ? Number(match[1]) : null;
}

function dedupeByContent(items) {
  const byKey = new Map();
  for (const item of items) {
    const key = `${item.title}|${item.message}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, item);
      continue;
    }
    const newer = item.createdAt > existing.createdAt ? item : existing;
    const older = newer === item ? existing : item;
    byKey.set(key, {
      ...newer,
      read: Boolean(newer.read || older.read),
    });
  }
  return [...byKey.values()].sort((a, b) => b.createdAt - a.createdAt).slice(0, MAX_ITEMS);
}

function mergeOpsRows(rows, liveItems) {
  const fromApi = rows.map((row) => {
    const serverId = row.id ?? row.Id;
    const view = toAdminNotificationView({
      title: row.title ?? row.Title,
      message: row.message ?? row.Message,
      type: row.type ?? row.Type,
      bookingId: row.bookingId ?? row.BookingId,
    });
    const createdMs = parseApiDate(row.createdAt ?? row.CreatedAt) ?? Date.now();
    return {
      id: `ops-${serverId}`,
      serverId,
      type: view.type,
      title: view.title,
      message: view.message,
      link: view.link,
      entityId: view.entityId,
      createdAt: createdMs,
      read: Boolean(row.isRead ?? row.IsRead),
    };
  });

  const sessionLive = liveItems.filter((item) => String(item.id).startsWith("rt-"));
  return dedupeByContent([...sessionLive, ...fromApi]);
}

async function persistReadOnServer(serverId) {
  const token = readAccessToken();
  if (!token || !serverId) return;
  try {
    await markNotificationRead(token, serverId);
  } catch {
    /* keep optimistic local read state */
  }
}

async function resolveOpsServerId(item, items) {
  const direct = resolveServerId(item);
  if (direct) return direct;

  const sibling = items.find(
    (n) =>
      n.serverId &&
      n.title === item?.title &&
      n.message === item?.message,
  );
  if (sibling) return resolveServerId(sibling);

  const token = readAccessToken();
  if (!token || !item) return null;
  try {
    const rows = await listOpsNotifications(token);
    const list = Array.isArray(rows) ? rows : [];
    const match = list.find(
      (row) =>
        (row.title ?? row.Title) === item.title &&
        (row.message ?? row.Message) === item.message,
    );
    return match ? Number(match.id ?? match.Id) : null;
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
        if (!token) {
          set({ loadedFromApi: true });
          return;
        }
        try {
          const rows = await listOpsNotifications(token);
          const list = Array.isArray(rows) ? rows : [];
          const liveItems = get().items.filter((item) => String(item.id).startsWith("rt-"));
          set({
            items: mergeOpsRows(list, liveItems),
            loadedFromApi: true,
          });
        } catch {
          set({ loadedFromApi: true });
        }
      },

      push: ({ id, type, title, message, link, entityId, chatUserId, createdAt, serverId }) => {
        const item = {
          id: id ?? `ntf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          serverId: serverId ?? null,
          type: type ?? "system",
          title,
          message,
          link: link ?? null,
          entityId: entityId ?? null,
          chatUserId: chatUserId ?? null,
          createdAt: createdAt ?? Date.now(),
          read: false,
        };
        set((s) => ({
          items: dedupeByContent([item, ...s.items]),
        }));
        return item;
      },

      markRead: async (id) => {
        const items = get().items;
        const item = items.find((n) => n.id === id);
        set((s) => ({
          items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
        const serverId = await resolveOpsServerId(item, items);
        if (serverId) {
          await persistReadOnServer(serverId);
          set((s) => ({
            items: s.items.map((n) =>
              n.id === id || (n.title === item?.title && n.message === item?.message)
                ? { ...n, read: true, serverId: n.serverId ?? serverId }
                : n,
            ),
          }));
        }
      },

      markAllRead: async () => {
        const unread = get().items.filter((n) => !n.read);
        set((s) => ({
          items: s.items.map((n) => ({ ...n, read: true })),
        }));
        const serverIds = new Set();
        for (const item of unread) {
          const sid = await resolveOpsServerId(item, get().items);
          if (sid) serverIds.add(sid);
        }
        await Promise.all([...serverIds].map((sid) => persistReadOnServer(sid)));
      },

      remove: (id) =>
        set((s) => ({
          items: s.items.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ items: [] }),

      unreadCount: () => get().items.filter((n) => !n.read).length,
    }),
    {
      name: "sta-admin-notifications-v4",
      version: 2,
      partialize: (s) => ({ items: s.items }),
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        if (version < 2) return { ...persisted, loadedFromApi: false };
        return persisted;
      },
    },
  ),
);
