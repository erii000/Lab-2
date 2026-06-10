import * as chatApi from "../api/chatApi.js";

const REPLIES = [
  "For nightlife, I recommend stays near Le Marais or the Latin Quarter — Hotel 5★ option scores highest.",
  "June 4 has the best sunset window for a Seine cruise based on your dates.",
  "Switching to the Premium Air flight adds lounge access with only +€120 per person.",
];

export function pickAiReply(index) {
  return REPLIES[index % REPLIES.length];
}

function mapRow(row) {
  const senderId = row.senderUserId ?? row.SenderUserId ?? 0;
  const text = row.message ?? row.Message ?? "";
  if (senderId === 0) return { role: "support", text };
  return { role: "user", text };
}

function mapHubPayload(msg) {
  const role = msg.role ?? msg.Role ?? "support";
  const text = msg.text ?? msg.Text ?? msg.message ?? msg.Message ?? "";
  const userId = msg.userId ?? msg.UserId ?? null;
  if (!text) return null;
  if (role === "user") return { role: "user", text, userId };
  if (role === "assistant") return { role: "assistant", text, userId };
  return { role: "support", text, userId };
}

export { mapHubPayload };

const SUPPORT_GREETING = {
  role: "support",
  text: "Hi — ask a quick question here and our team will reply in real time while you browse.",
};

const AI_GREETING = {
  role: "assistant",
  text: "Ask me anything about your trip — hotels, weather, or experiences.",
};

/** @param {string} accessToken */
export async function loadChatHistory(accessToken) {
  const rows = await chatApi.listMyChatMessages(accessToken);
  const list = Array.isArray(rows) ? rows.map(mapRow) : [];
  if (list.length === 0) return [SUPPORT_GREETING];
  return list;
}

/** @param {string} accessToken */
export async function loadAiChatHistory(accessToken) {
  const rows = await chatApi.listMyChatMessages(accessToken);
  const list = Array.isArray(rows) ? rows.map(mapRow) : [];
  if (list.length === 0) return [AI_GREETING];
  return list;
}

/** @param {string} accessToken @param {number} userId */
export async function loadAdminChatThread(accessToken, userId) {
  const rows = await chatApi.listUserChatMessages(accessToken, userId);
  return Array.isArray(rows) ? rows.map(mapRow) : [];
}

/** @param {string} accessToken */
export async function loadAdminChatThreads(accessToken) {
  const rows = await chatApi.listChatThreads(accessToken);
  return Array.isArray(rows) ? rows : [];
}

/** Live support message — waits for human admin reply (no bot). */
export async function sendSupportMessage(accessToken, message) {
  await chatApi.sendChatMessage(accessToken, { message });
  return { userText: message };
}

/**
 * AI assistant turn (explore drawer).
 * @param {string} accessToken
 * @param {string} question
 * @param {number} replyIndex
 */
export async function sendChatTurn(accessToken, question, replyIndex) {
  const aiReply = pickAiReply(replyIndex);
  const result = await chatApi.sendChatMessage(accessToken, { message: question, aiReply });
  return {
    userText: question,
    aiText: result?.assistantMessage?.message ?? result?.assistantMessage?.Message ?? aiReply,
  };
}

/** @param {string} accessToken @param {number} userId @param {string} message */
export async function sendAdminReply(accessToken, userId, message) {
  await chatApi.replyToUserChat(accessToken, userId, message);
  return { text: message };
}
