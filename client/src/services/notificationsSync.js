import * as notificationsApi from "../api/notificationsApi.js";

function mapNotification(row) {
  const id = row.id ?? row.Id;
  const created = row.createdAt ?? row.CreatedAt;
  return {
    id: `n-${id}`,
    serverId: id,
    type: (row.type ?? row.Type ?? "system").toLowerCase(),
    title: row.title ?? row.Title ?? "Notification",
    message: row.message ?? row.Message ?? "",
    read: Boolean(row.isRead ?? row.IsRead),
    createdAt: created ? new Date(created).getTime() : Date.now(),
    link: null,
  };
}

/** @param {string} accessToken @param {number} userId */
export async function fetchUserNotifications(accessToken, userId) {
  const rows = await notificationsApi.listMyNotifications(accessToken, userId);
  const list = Array.isArray(rows) ? rows : [];
  return list.map(mapNotification).sort((a, b) => b.createdAt - a.createdAt);
}

/** @param {string} accessToken */
export async function fetchAdminNotifications(accessToken) {
  const rows = await notificationsApi.listAllNotifications(accessToken);
  const list = Array.isArray(rows) ? rows : [];
  return list.map(mapNotification).sort((a, b) => b.createdAt - a.createdAt);
}

/** @param {string} accessToken @param {number} serverId */
export async function markReadOnApi(accessToken, serverId) {
  if (!serverId) return;
  await notificationsApi.markNotificationRead(accessToken, serverId);
}
