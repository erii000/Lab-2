import { API_BASE_URL } from "./config.js";

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * @param {string} path - e.g. `/api/v1/auth/login`
 * @param {RequestInit & { token?: string; json?: unknown }} options
 */
export async function apiRequest(path, options = {}) {
  const { token, json, headers: extraHeaders, ...init } = options;
  const headers = new Headers(extraHeaders);

  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      (body && typeof body === "object" && (body.error || body.message)) ||
      (typeof body === "string" && body) ||
      response.statusText ||
      "Request failed";
    throw new ApiError(message, { status: response.status, body });
  }

  return body;
}
