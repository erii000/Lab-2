import { apiRequest } from "./client.js";

/** @param {string} accessToken @param {object} body */
export function createCheckoutSession(accessToken, body) {
  return apiRequest("/api/v1/payments/checkout", {
    method: "POST",
    token: accessToken,
    json: body,
  });
}

/** @param {string} accessToken @param {number} paymentId */
export function getPayment(accessToken, paymentId) {
  return apiRequest(`/api/v1/payments/${paymentId}`, { token: accessToken });
}
