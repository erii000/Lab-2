/** Lightweight pub/sub for SignalR `travelUpdate` events (admin sync, dashboards). */

const listeners = new Set();

/** @param {(payload: object) => void} handler */
export function subscribeTravelUpdate(handler) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

/** @param {object} payload */
export function emitTravelUpdate(payload) {
  listeners.forEach((fn) => {
    try {
      fn(payload);
    } catch {
      /* ignore subscriber errors */
    }
  });
}
