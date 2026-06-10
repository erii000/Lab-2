import * as notificationsApi from "../api/notificationsApi.js";
import { bookingLinkFromNotification, supportLinkFromNotification } from "../utils/notificationLinks.js";
import { parseApiDate } from "../utils/parseApiDate.js";

function resolveLink(row) {
  const type = (row.type ?? row.Type ?? "system").toLowerCase();
  const message = row.message ?? row.Message ?? "";
  const bookingId = row.bookingId ?? row.BookingId ?? null;

  return (
    bookingLinkFromNotification({ type, bookingId, bookingServerId: bookingId, message }) ??
    supportLinkFromNotification({ type }) ??
    null
  );
}

function mapNotification(row) {
  const id = row.id ?? row.Id;
  const created = row.createdAt ?? row.CreatedAt;
  const type = (row.type ?? row.Type ?? "system").toLowerCase();
  const message = row.message ?? row.Message ?? "";
  const bookingId = row.bookingId ?? row.BookingId ?? null;

  return {
    id: `n-${id}`,
    serverId: id,
    type,
    title: row.title ?? row.Title ?? "Notification",
    message,
    read: Boolean(row.isRead ?? row.IsRead),
    createdAt: parseApiDate(created) ?? Date.now(),
    link: resolveLink(row),
    bookingServerId: bookingId,
  };
}

/** @param {string} accessToken @param {number} userId */
export async function fetchUserNotifications(accessToken, userId) {
  const rows = await notificationsApi.listMyNotifications(accessToken, userId);
  const list = Array.isArray(rows) ? rows : [];
  return list.map(mapNotification).sort((a, b) => b.createdAt - a.createdAt);
}

/** @param {string} accessToken @param {number} serverId */
export async function markReadOnApi(accessToken, serverId) {
  if (!serverId) return;
  await notificationsApi.markNotificationRead(accessToken, serverId);
}
