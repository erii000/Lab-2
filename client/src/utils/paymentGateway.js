/**
 * Client-side payment gateway simulation (Stripe / PayPal UX).
 * Replace `processPayment` with real Stripe.js / PayPal SDK in production.
 */

export function luhnCheck(cardNumber) {
  const digits = String(cardNumber ?? "").replace(/\D/g, "");
  if (!digits) return false;
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function validateCardPayload({ cardNumber, expiry, cvc, name } = {}) {
  const errors = {};
  const num = String(cardNumber ?? "").replace(/\s/g, "");
  if (!name?.trim()) errors.name = "Cardholder name is required";
  if (!num) errors.cardNumber = "Card number is required";
  else if (!luhnCheck(num)) errors.cardNumber = "Invalid card number";
  if (!/^\d{2}\/\d{2}$/.test(expiry ?? "")) errors.expiry = "Use MM/YY format";
  else {
    const [mm, yy] = expiry.split("/").map((x) => parseInt(x, 10));
    const now = new Date();
    const exp = new Date(2000 + yy, mm - 1);
    if (mm < 1 || mm > 12 || exp < now) errors.expiry = "Card has expired";
  }
  if (!/^\d{3,4}$/.test(cvc ?? "")) errors.cvc = "Invalid security code";
  return errors;
}

export function maskCardNumber(cardNumber) {
  const digits = String(cardNumber ?? "").replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

/** Simulated gateway — 92% success; demo decline on card ending 0002 */
export async function processPayment({ method, amount, currency, cardNumber, bookingId }) {
  await delay(1200 + Math.random() * 600);

  const digits = cardNumber?.replace(/\D/g, "") ?? "";

  if (method === "paypal") {
    return {
      ok: true,
      provider: "paypal",
      transactionId: `PP-${Date.now().toString(36).toUpperCase()}`,
      amount,
      currency,
      bookingId,
    };
  }

  if (digits.endsWith("0002")) {
    return {
      ok: false,
      provider: "stripe",
      code: "card_declined",
      message: "Your card was declined. Try a different payment method.",
    };
  }

  if (Math.random() < 0.04) {
    return {
      ok: false,
      provider: "stripe",
      code: "processing_error",
      message: "Payment processor temporarily unavailable. Please retry.",
    };
  }

  return {
    ok: true,
    provider: "stripe",
    transactionId: `pi_${Date.now().toString(36)}`,
    amount,
    currency,
    bookingId,
    cardBrand: digits.startsWith("4") ? "Visa" : digits.startsWith("5") ? "Mastercard" : "Card",
  };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function getCheckoutCardPayload(card, method) {
  if (method !== "card") return { valid: true, card: null, errors: {} };
  const payload = {
    cardNumber: card?.cardNumber ?? "",
    expiry: card?.expiry ?? "",
    cvc: card?.cvc ?? "",
    name: card?.name ?? "",
  };
  const errors = validateCardPayload(payload);
  return { valid: Object.keys(errors).length === 0, errors, card: payload };
}
