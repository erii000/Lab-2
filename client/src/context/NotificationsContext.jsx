import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore.js";
import {
  fetchUserNotifications,
  markReadOnApi,
} from "../services/notificationsSync.js";
import { connectNotificationsHub } from "../services/realtimeNotificationsHub.js";
import { emitTravelUpdate } from "../services/travelUpdateBus.js";
import { useToast } from "./ToastContext.jsx";

const NotificationsContext = createContext(null);

function mapRealtimePayload(payload) {
  const sent = payload.sentAtUtc ? new Date(payload.sentAtUtc).getTime() : Date.now();
  return {
    id: `rt-${sent}-${Math.random().toString(36).slice(2, 8)}`,
    serverId: null,
    type: (payload.type ?? "system").toLowerCase(),
    title: payload.title ?? "Live update",
    message: payload.message ?? "",
    read: false,
    createdAt: sent,
    link: null,
    live: true,
  };
}

export function NotificationsProvider({ children }) {
  const session = useAuthStore((s) => s.session);
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const hubRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!session?.accessToken || !session?.userId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const list = await fetchUserNotifications(session.accessToken, session.userId);
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, session?.userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;

    async function connectHub() {
      if (hubRef.current) {
        await hubRef.current.stop();
        hubRef.current = null;
        setConnected(false);
      }

      if (!session?.accessToken || !session?.userId) return;

      const token = await useAuthStore.getState().ensureAccessToken();
      if (!token || cancelled) return;

      const hub = connectNotificationsHub(token, (payload) => {
        emitTravelUpdate(payload);

        const targetUserId = payload.userId ?? payload.UserId;
        const isBroadcast = targetUserId == null;
        const isForMe =
          targetUserId != null && Number(targetUserId) === Number(session.userId);
        const isAdmin = useAuthStore.getState().session?.role === "admin";

        if (!isBroadcast && !isForMe) return;

        const item = mapRealtimePayload(payload);
        setItems((prev) => [item, ...prev]);

        if (!isAdmin || isForMe || isBroadcast) {
          showToast({
            message: item.message || item.title,
            severity: item.type === "alert" ? "warning" : "info",
          });
        }
      });

      hubRef.current = hub;
      try {
        await hub.start();
        if (!cancelled) setConnected(true);
      } catch {
        if (!cancelled) setConnected(false);
      }
    }

    connectHub();

    return () => {
      cancelled = true;
      hubRef.current?.stop();
      hubRef.current = null;
      setConnected(false);
    };
  }, [session?.accessToken, session?.userId, showToast]);

  const markRead = useCallback(
    async (id) => {
      const item = items.find((n) => n.id === id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      if (session?.accessToken && item?.serverId) {
        try {
          await markReadOnApi(session.accessToken, item.serverId);
        } catch {
          /* keep local read state */
        }
      }
    },
    [items, session?.accessToken],
  );

  const markAllRead = useCallback(async () => {
    const unread = items.filter((n) => !n.read && n.serverId);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    if (!session?.accessToken) return;
    await Promise.all(
      unread.map((n) => markReadOnApi(session.accessToken, n.serverId).catch(() => null)),
    );
  }, [items, session?.accessToken]);

  const value = useMemo(
    () => ({
      items,
      loading,
      connected,
      unreadCount: items.filter((n) => !n.read).length,
      refresh,
      markRead,
      markAllRead,
    }),
    [items, loading, connected, refresh, markRead, markAllRead],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}
