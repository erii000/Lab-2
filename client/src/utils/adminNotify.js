import { useAdminNotificationsStore } from "../store/adminNotificationsStore.js";

/** Push an admin-dashboard notification (ops bell only — not the traveler homepage feed). */
export function adminNotify({ type, title, message, link, entityId }) {
  useAdminNotificationsStore.getState().push({
    type: type ?? "system",
    title,
    message,
    link,
    entityId,
  });
}
