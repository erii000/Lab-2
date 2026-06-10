import { useEffect, useMemo, useRef, useState } from "react";
import { connectNotificationsHub } from "../services/realtimeNotificationsHub.js";
import { emitTravelUpdate } from "../services/travelUpdateBus.js";
import { useAdminNotificationsStore } from "../store/adminNotificationsStore.js";
import { useAuthStore } from "../store/authStore.js";
import { toAdminNotificationView } from "../utils/notificationMessages.js";
import { AdminNotificationsContext } from "./adminNotificationsContext.js";
import { useToast } from "./ToastContext.jsx";

function pushAdminAlert(payload, showToast) {
  const view = toAdminNotificationView(payload);
  const createdAt = Date.now();
  const id = `rt-${createdAt}-${Math.random().toString(36).slice(2, 8)}`;

  useAdminNotificationsStore.getState().push({
    id,
    type: view.type,
    title: view.title,
    message: view.message,
    link: view.link,
    entityId: view.entityId,
    chatUserId: view.chatUserId ?? null,
    createdAt,
  });

  showToast({
    message: view.message || view.title,
    severity: view.type === "alert" ? "warning" : "info",
  });
}

function isAdminBroadcast(payload) {
  const audience = payload.audience ?? payload.Audience;
  if (audience === "admin") return true;
  const targetUserId = payload.userId ?? payload.UserId;
  return targetUserId == null || targetUserId === 0;
}

/**
 * Admin dashboard real-time notifications via SignalR WebSocket (/hubs/notifications).
 * No polling — alerts arrive when the server broadcasts travelUpdate events.
 */
export function AdminNotificationsProvider({ children }) {
  const session = useAuthStore((s) => s.session);
  const { showToast } = useToast();
  const hubRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const isAdmin = session?.role === "admin";

  useEffect(() => {
    if (!isAdmin || !session?.accessToken) {
      setConnected(false);
      return undefined;
    }

    let cancelled = false;

    async function connectHub() {
      const token = await useAuthStore.getState().ensureAccessToken();
      if (!token || cancelled) return;

      const hub = connectNotificationsHub(
        token,
        (payload) => {
          emitTravelUpdate(payload);
          if (!isAdminBroadcast(payload)) return;
          pushAdminAlert(payload, showToast);
        },
        {
          onConnected: () => {
            if (!cancelled) setConnected(true);
          },
          onDisconnected: () => {
            if (!cancelled) setConnected(false);
          },
        },
      );

      hubRef.current = hub;
      try {
        await hub.start();
        if (!cancelled) setConnected(true);
      } catch (err) {
        console.warn("[SignalR] admin notifications hub failed:", err?.message ?? err);
        if (!cancelled) setConnected(false);
      }
    }

    void connectHub();
    void useAdminNotificationsStore.getState().hydrateFromApi();

    return () => {
      cancelled = true;
      hubRef.current?.stop();
      hubRef.current = null;
      setConnected(false);
    };
  }, [isAdmin, session?.accessToken, showToast]);

  const value = useMemo(() => ({ connected }), [connected]);

  return (
    <AdminNotificationsContext.Provider value={value}>{children}</AdminNotificationsContext.Provider>
  );
}
