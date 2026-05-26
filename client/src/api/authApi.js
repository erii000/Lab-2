import { apiRequest } from "./client.js";

/** @typedef {{ accessToken: string, refreshToken: string, expiresAtUtc: string }} AuthTokens */
/** @typedef {{ id: number, firstName: string, lastName: string, email: string, roles?: string[] }} UserProfile */

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<AuthTokens>}
 */
export function login(credentials) {
  return apiRequest("/api/v1/auth/login", {
    method: "POST",
    json: { email: credentials.email.trim(), password: credentials.password },
  });
}

/**
 * @param {{ name: string, surname: string, email: string, password: string }} payload
 * @returns {Promise<AuthTokens>}
 */
export function register(payload) {
  return apiRequest("/api/v1/auth/register", {
    method: "POST",
    json: payload,
  });
}

/**
 * @param {string} refreshToken
 * @returns {Promise<AuthTokens>}
 */
export function refresh(refreshToken) {
  return apiRequest("/api/v1/auth/refresh", {
    method: "POST",
    json: { refreshToken },
  });
}

/**
 * @param {string} accessToken
 * @returns {Promise<UserProfile>}
 */
export function getMe(accessToken) {
  return apiRequest("/api/v1/users/me", { token: accessToken });
}

/**
 * @param {string} accessToken
 * @param {string} [refreshToken]
 */
export function logout(accessToken, refreshToken) {
  return apiRequest("/api/v1/auth/logout", {
    method: "POST",
    token: accessToken,
    json: refreshToken ? { refreshToken } : {},
  });
}
