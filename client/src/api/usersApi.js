import { apiRequest } from "./client.js";

/**
 * @param {string} accessToken
 * @param {{ pageNumber?: number, pageSize?: number }} [query]
 */
export function listUsers(accessToken, query = {}) {
  const params = new URLSearchParams();
  if (query.pageNumber) params.set("pageNumber", String(query.pageNumber));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  return apiRequest(`/api/v1/users${qs ? `?${qs}` : ""}`, { token: accessToken });
}
