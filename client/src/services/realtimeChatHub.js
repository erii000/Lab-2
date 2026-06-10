import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "../api/config.js";

export const CHAT_MESSAGE_EVENT = "chatMessage";

/**
 * @param {string} accessToken
 * @param {(msg: object) => void} onMessage
 * @param {{ onConnected?: () => void, onDisconnected?: () => void }} [handlers]
 */
export function connectChatHub(accessToken, onMessage, handlers = {}) {
  const base = API_BASE_URL || "";
  const hubUrl = `${base}/hubs/chat?access_token=${encodeURIComponent(accessToken)}`;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { withCredentials: true })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  connection.on(CHAT_MESSAGE_EVENT, (payload) => onMessage(payload ?? {}));

  connection.onreconnecting(() => handlers.onDisconnected?.());
  connection.onreconnected(() => handlers.onConnected?.());
  connection.onclose(() => {
    started = false;
    handlers.onDisconnected?.();
  });

  let started = false;

  return {
    async start() {
      if (started) {
        handlers.onConnected?.();
        return;
      }
      await connection.start();
      started = true;
      handlers.onConnected?.();
    },
    async stop() {
      started = false;
      try {
        await connection.stop();
      } catch {
        /* ignore */
      }
      handlers.onDisconnected?.();
    },
  };
}
