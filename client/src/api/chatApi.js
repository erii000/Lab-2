import { apiRequest } from "./client.js";

/** @param {string} accessToken */
export function listMyChatMessages(accessToken) {
  return apiRequest("/api/v1/chat/mine", { token: accessToken });
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
