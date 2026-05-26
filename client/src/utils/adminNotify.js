import { createNotification } from "../api/notificationsApi.js";
import { useAdminNotificationsStore } from "../store/adminNotificationsStore.js";

function readAdminSession() {
  try {
    const raw = localStorage.getItem("sta-auth-v2");
    const parsed = JSON.parse(raw ?? "{}");
    return parsed?.state?.session ?? null;
  } catch {
    return null;
  }
}

/** Push an admin notification locally and persist to the database when possible. */
export function adminNotify({ type, title, message, link, entityId }) {
  useAdminNotificationsStore.getState().push({
    type: type ?? "system",
    title,
    message,
    link,
    entityId,
  });

  const session = readAdminSession();
  if (!session?.accessToken || !session?.userId) return;

  createNotification(session.accessToken, {
    userId: session.userId,
    title,
    message,
    type: type ?? "system",
    isRead: false,
  }).catch(() => null);
}
