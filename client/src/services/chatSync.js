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
  return {
    role: senderId === 0 ? "ai" : "user",
    text,
  };
}

/** @param {string} accessToken */
export async function loadChatHistory(accessToken) {
  const rows = await chatApi.listMyChatMessages(accessToken);
  const list = Array.isArray(rows) ? rows.map(mapRow) : [];
  if (list.length === 0) {
    return [{ role: "ai", text: "Ask me anything about your trip — hotels, weather, or experiences." }];
  }
  return list;
}

/**
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
