import { apiRequest } from "./client.js";

/**
 * @param {string} [accessToken]
 * @param {{
 *   subject: string;
 *   message: string;
 *   fullName?: string;
 *   email?: string;
 *   bookingId?: string;
 *   tripType?: string;
 *   priority?: string;
 * }} payload
 */
export function createContactTicket(accessToken, payload) {
  return apiRequest("/api/v1/supporttickets/contact", {
    method: "POST",
    token: accessToken || undefined,
    json: payload,
  });
}
