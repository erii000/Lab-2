import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "../api/config.js";

export const TRAVEL_UPDATE_EVENT = "travelUpdate";

/**
 * SignalR WebSocket hub for real-time travel notifications.
 * @param {string} accessToken
 * @param {(payload: object) => void} onTravelUpdate
 * @param {{ onConnected?: () => void, onDisconnected?: () => void }} [handlers]
 */
export function connectNotificationsHub(accessToken, onTravelUpdate, handlers = {}) {
  const base = API_BASE_URL || "";
  const hubUrl = `${base}/hubs/notifications?access_token=${encodeURIComponent(accessToken)}`;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { withCredentials: true })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  connection.on(TRAVEL_UPDATE_EVENT, (payload) => {
    onTravelUpdate(payload ?? {});
  });

  connection.onreconnected(() => {
    handlers.onConnected?.();
  });

  connection.onclose(() => {
    handlers.onDisconnected?.();
  });

  let started = false;

  async function start() {
    if (started) return connection;
    await connection.start();
    started = true;
    handlers.onConnected?.();
    return connection;
  }

  async function stop() {
    if (!started) return;
    try {
      await connection.stop();
    } catch {
      /* ignore */
    }
    started = false;
    handlers.onDisconnected?.();
  }

  return { connection, start, stop };
}
