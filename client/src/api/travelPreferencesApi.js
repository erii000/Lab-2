import { apiRequest } from "./client.js";

/** @param {string} accessToken */
export function getMyTravelPreferences(accessToken) {
  return apiRequest("/api/v1/travel-preferences/me", { token: accessToken });
}

/** @param {string} accessToken */
export function upsertMyTravelPreferences(accessToken, body) {
  return apiRequest("/api/v1/travel-preferences/me", {
    method: "PUT",
    token: accessToken,
    json: body,
  });
}

/** @param {string} accessToken */
export function getUserTravelPreferences(accessToken, userId) {
  return apiRequest(`/api/v1/travel-preferences/user/${userId}`, { token: accessToken });
}

/** @param {string} accessToken */
export function upsertUserTravelPreferences(accessToken, userId, body) {
  return apiRequest(`/api/v1/travel-preferences/user/${userId}`, {
    method: "PUT",
    token: accessToken,
    json: body,
  });
}
