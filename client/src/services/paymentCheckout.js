import { ApiError } from "../api/client.js";
import * as bookingsApi from "../api/bookingsApi.js";
import * as paymentsApi from "../api/paymentsApi.js";
import { pushBookingToApi } from "./bookingSync.js";
import { bookingToMetadataJson } from "../utils/bookingMappers.js";
import { useAuthStore } from "../store/authStore.js";
import { processPayment } from "../utils/paymentGateway.js";

/** Backend falls back to Lab checkout when Stripe/PayPal keys are not configured. */
function paymentProviderForMethod(method) {
  if (method === "paypal") return "PayPal";
  if (method === "card") return "Stripe";
  return "Lab";
}

function isAuthError(err) {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}

/**
 * Ensure booking exists on server before checkout.
 * @param {string} accessToken
 * @param {object} booking
 */
export async function ensureServerBooking(accessToken, booking) {
  if (!accessToken) return booking;
  if (booking.serverId) {
    await bookingsApi.patchBooking(accessToken, booking.serverId, {
      itineraryId: booking.itineraryId ?? null,
      amount: booking.total ?? 0,
      currency: "EUR",
      metadataJson: bookingToMetadataJson(booking),
    });
    return booking;
  }

  try {
    const serverId = await pushBookingToApi(accessToken, booking);
    if (!serverId) throw new Error("Booking API did not return an id.");
    return { ...booking, serverId };
  } catch (err) {
    const detail = err instanceof ApiError ? err.message : err?.message;
    throw new Error(detail ? `Could not save booking: ${detail}` : "Could not save booking.");
  }
}

async function runServerCheckout(accessToken, booking, method, successUrl, cancelUrl) {
  const synced = await ensureServerBooking(accessToken, booking);
  const serverBookingId = synced.serverId;
  if (!serverBookingId) {
    throw new Error("Could not save booking before payment.");
  }

  const buildBody = (p) => ({
    bookingId: serverBookingId,
    paymentProvider: p,
    amount: booking.total,
    currency: "EUR",
    successUrl: successUrl || `${window.location.origin}/bookings/${booking.id}/success`,
    cancelUrl: cancelUrl || `${window.location.origin}/bookings/${booking.id}/traveler`,
  });

  const provider = paymentProviderForMethod(method);

  const session = await paymentsApi.createCheckoutSession(accessToken, buildBody(provider));

  const status = session.status ?? session.Status;
  const paymentId = session.paymentId ?? session.PaymentId;
  const externalRef = session.externalReference ?? session.ExternalReference;
  const checkoutUrl = session.checkoutUrl ?? session.CheckoutUrl;

  if (status === "Completed" || provider === "Lab" || !checkoutUrl) {
    await bookingsApi.patchBooking(accessToken, serverBookingId, {
      itineraryId: synced.itineraryId ?? booking.itineraryId ?? null,
      amount: synced.total ?? booking.total,
      currency: "EUR",
      metadataJson: bookingToMetadataJson(
        { ...synced, traveler: synced.traveler ?? booking.traveler },
        {
          paymentMethod: method,
          paymentCardDisplay: method === "paypal" ? "PayPal" : synced.paymentCardDisplay,
        },
      ),
    });
    await bookingsApi.confirmBookingPayment(accessToken, serverBookingId);
    return {
      ok: true,
      provider: provider.toLowerCase(),
      transactionId: externalRef ?? `pay-${paymentId}`,
      paymentId,
      amount: booking.total,
      currency: "EUR",
      bookingId: booking.id,
      serverBookingId,
      syncedBooking: synced,
      cardBrand: method === "card" ? "Card" : "PayPal",
    };
  }

  window.location.assign(checkoutUrl);
  return { ok: true, redirect: true, checkoutUrl };
}

/**
 * Process payment via API (Lab/Stripe/PayPal) with mock fallback when offline or guest.
 * @param {object} params
 */
export async function checkoutBookingPayment({
  accessToken: initialToken,
  booking,
  method,
  cardNumber,
  successUrl,
  cancelUrl,
}) {
  let accessToken = initialToken;
  if (initialToken) {
    accessToken = await useAuthStore.getState().ensureAccessToken();
  }

  if (!accessToken) {
    return processPayment({
      method,
      amount: booking.total,
      currency: "EUR",
      cardNumber,
      bookingId: booking.id,
    });
  }

  try {
    return await runServerCheckout(accessToken, booking, method, successUrl, cancelUrl);
  } catch (err) {
    if (isAuthError(err)) {
      const refreshed = await useAuthStore.getState().ensureAccessToken();
      if (refreshed) {
        try {
          return await runServerCheckout(refreshed, booking, method, successUrl, cancelUrl);
        } catch (retryErr) {
          if (!isAuthError(retryErr)) throw retryErr;
        }
      }
      const mock = await processPayment({
        method,
        amount: booking.total,
        currency: "EUR",
        cardNumber,
        bookingId: booking.id,
      });
      if (mock.ok) {
        return {
          ...mock,
          authFallback: true,
          message:
            "Your session expired. Payment was recorded locally — log out and sign in again to sync with the server.",
        };
      }
      throw new Error("Your session expired. Please log out, sign in again, and retry payment.");
    }

    const message =
      err instanceof ApiError
        ? err.message
        : err?.message ?? "Could not complete checkout. Ensure the API is running and try again.";
    throw new Error(message);
  }
}
