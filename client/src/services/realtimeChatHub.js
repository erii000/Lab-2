import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "../api/config.js";

export const CHAT_MESSAGE_EVENT = "chatMessage";

/**
 * @param {string} accessToken
 * @param {(msg: { role?: string, text?: string }) => void} onMessage
 */
export function connectChatHub(accessToken, onMessage) {
  const base = API_BASE_URL || "";
  const hubUrl = `${base}/hubs/chat?access_token=${encodeURIComponent(accessToken)}`;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { withCredentials: true })
    .withAutomaticReconnect([0, 2000, 5000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  connection.on(CHAT_MESSAGE_EVENT, (payload) => onMessage(payload ?? {}));

  let started = false;

  return {
    async start() {
      if (started) return;
      await connection.start();
      started = true;
    },
    async stop() {
      if (!started) return;
      try {
        await connection.stop();
      } catch {
        /* ignore */
      }
      started = false;
    },
  };
}
