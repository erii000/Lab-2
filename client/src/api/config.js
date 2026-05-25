/**
 * API base URL — ApiGateway (Docker 5161).
 * In Vite dev, default to same-origin so `/api` uses the dev proxy (see vite.config.js).
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  (import.meta.env.DEV ? "" : "http://localhost:5161");
