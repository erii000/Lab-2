import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore.js";
import {
  fetchUserNotifications,
  markReadOnApi,
} from "../services/notificationsSync.js";
import { connectNotificationsHub } from "../services/realtimeNotificationsHub.js";
import { emitTravelUpdate } from "../services/travelUpdateBus.js";
import { toUserNotificationView } from "../utils/notificationMessages.js";
import { parseApiDate } from "../utils/parseApiDate.js";
import { NotificationsContext } from "./notificationsContext.js";
import { useToast } from "./ToastContext.jsx";

function mapRealtimePayload(payload) {
  const sent = payload.sentAtUtc ?? payload.SentAtUtc;
  const createdAt = parseApiDate(sent) ?? Date.now();
  const view = toUserNotificationView(payload);
  return {
    id: `rt-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
    serverId: null,
    type: view.type,
    title: view.title,
    message: view.message,
    read: false,
    createdAt,
    link: view.link ?? null,
    bookingServerId: view.bookingId ?? null,
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
  const isTraveler = session?.role !== "admin";

  const refresh = useCallback(async () => {
    if (!isTraveler || !session?.accessToken || !session?.userId) {
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
  }, [isTraveler, session?.accessToken, session?.userId]);

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

      if (!isTraveler || !session?.accessToken || !session?.userId) return;

      const token = await useAuthStore.getState().ensureAccessToken();
      if (!token || cancelled) return;

      const hub = connectNotificationsHub(token, (payload) => {
        emitTravelUpdate(payload);

        const audience = payload.audience ?? payload.Audience;
        const targetUserId = payload.userId ?? payload.UserId;
        const isBroadcast =
          audience === "admin" || targetUserId == null || targetUserId === 0;

        // Admin broadcasts are handled by AdminNotificationsProvider (SignalR on /admin).
        if (isBroadcast) return;

        const isForMe =
          targetUserId != null && Number(targetUserId) === Number(session.userId);
        if (!isForMe) return;

        const item = mapRealtimePayload(payload);
        setItems((prev) => {
          const key = `${item.title}|${item.message}`;
          if (prev.some((n) => `${n.title}|${n.message}` === key)) return prev;
          return [item, ...prev];
        });
        showToast({
          message: item.message || item.title,
          severity: item.type === "alert" ? "warning" : "success",
        });
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
  }, [isTraveler, session?.accessToken, session?.userId, showToast]);

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
