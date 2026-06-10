import { apiRequest } from "./client.js";

/** @param {string} accessToken */
export function listMyNotifications(accessToken, userId) {
  return apiRequest(`/api/v1/notifications/user/${userId}`, { token: accessToken });
}

/** @param {string} accessToken */
export function listAllNotifications(accessToken) {
  return apiRequest("/api/v1/notifications", { token: accessToken });
}

/** Admin ops feed (persisted broadcast alerts). @param {string} accessToken */
export function listOpsNotifications(accessToken) {
  return apiRequest("/api/v1/notifications/ops", { token: accessToken });
}

/** @param {string} accessToken */
export function markNotificationRead(accessToken, notificationId) {
  return apiRequest(`/api/v1/notifications/${notificationId}/read`, {
    method: "PATCH",
    token: accessToken,
  });
}

/** @param {string} accessToken */
export function createNotification(accessToken, payload) {
  return apiRequest("/api/v1/notifications", {
    method: "POST",
    token: accessToken,
    json: payload,
  });
}
