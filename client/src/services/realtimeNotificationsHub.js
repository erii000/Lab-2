import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "../api/config.js";

export const TRAVEL_UPDATE_EVENT = "travelUpdate";

/**
 * @param {string} accessToken
 * @param {(payload: { title?: string, message?: string, type?: string, userId?: number, sentAtUtc?: string }) => void} onTravelUpdate
 */
export function connectNotificationsHub(accessToken, onTravelUpdate) {
  const base = API_BASE_URL || "";
  const hubUrl = `${base}/hubs/notifications?access_token=${encodeURIComponent(accessToken)}`;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { withCredentials: true })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  connection.on(TRAVEL_UPDATE_EVENT, (payload) => {
    onTravelUpdate(payload ?? {});
  });

  let started = false;

  async function start() {
    if (started) return connection;
    await connection.start();
    started = true;
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
  }

  return { connection, start, stop };
}
