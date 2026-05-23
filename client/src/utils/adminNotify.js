import { useAdminNotificationsStore } from "../store/adminNotificationsStore.js";

/** Push an admin notification from stores, pages, or handlers. */
export function adminNotify({ type, title, message, link, entityId }) {
  useAdminNotificationsStore.getState().push({
    type: type ?? "system",
    title,
    message,
    link,
    entityId,
  });
}
