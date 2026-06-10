import { apiRequest } from "./client.js";

/** @param {string} accessToken */
export function listMyChatMessages(accessToken) {
  return apiRequest("/api/v1/chat/mine", { token: accessToken });
}

/** @param {string} accessToken */
export function listChatThreads(accessToken) {
  return apiRequest("/api/v1/chat/threads", { token: accessToken });
}

/** @param {string} accessToken @param {number} userId */
export function listUserChatMessages(accessToken, userId) {
  return apiRequest(`/api/v1/chat/user/${userId}`, { token: accessToken });
}

/**
 * @param {string} accessToken
 * @param {{ message: string, aiReply?: string }} payload
 */
export function sendChatMessage(accessToken, payload) {
  return apiRequest("/api/v1/chat", {
    method: "POST",
    token: accessToken,
    json: payload,
  });
}

/** @param {string} accessToken @param {number} userId @param {string} message */
export function replyToUserChat(accessToken, userId, message) {
  return apiRequest(`/api/v1/chat/user/${userId}/reply`, {
    method: "POST",
    token: accessToken,
    json: { message },
  });
}
