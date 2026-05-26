import { API_BASE_URL } from "./config.js";
import { ApiError } from "./client.js";

/** @typedef {'users'|'bookings'|'payments'|'itineraries'|'notifications'} DataExchangeResource */

const RESOURCE_PATHS = {
  users: "/api/v1/users",
  bookings: "/api/v1/bookings",
  payments: "/api/v1/payments",
  itineraries: "/api/v1/itineraries",
  notifications: "/api/v1/notifications",
};

const FORMAT_EXT = {
  json: "json",
  csv: "csv",
  xlsx: "xlsx",
};

/**
 * @param {string} token
 * @param {DataExchangeResource} resource
 * @param {'json'|'csv'|'xlsx'} format
 */
export async function downloadResourceExport(token, resource, format = "json") {
  const base = RESOURCE_PATHS[resource];
  const path = `${base}/export?format=${encodeURIComponent(format)}`;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);
    const message =
      (body && typeof body === "object" && (body.error || body.message)) ||
      (typeof body === "string" && body) ||
      response.statusText ||
      "Export failed";
    throw new ApiError(message, { status: response.status, body });
  }

  const blob = await response.blob();
  const ext = FORMAT_EXT[format] ?? format;
  const disposition = response.headers.get("content-disposition") ?? "";
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  const filename = match?.[1] ?? `${resource}-${new Date().toISOString().slice(0, 10)}.${ext}`;

  return { blob, filename };
}

/**
 * @param {string} token
 * @param {DataExchangeResource} resource
 * @param {unknown[]} rows
 */
export async function importResourceRows(token, resource, rows) {
  const path = `${RESOURCE_PATHS[resource]}/import`;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rows),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      (body && typeof body === "object" && (body.error || body.message)) ||
      (typeof body === "string" && body) ||
      response.statusText ||
      "Import failed";
    throw new ApiError(message, { status: response.status, body });
  }

  return body;
}

export const DATA_EXCHANGE_RESOURCES = [
  {
    id: "users",
    label: "Users",
    description: "Traveler accounts (Admin).",
    importHint: "JSON array: { firstName, lastName, email, password } per row.",
    sample: [
      {
        firstName: "Import",
        lastName: "Demo",
        email: "import.demo@example.com",
        password: "Import123!",
      },
    ],
  },
  {
    id: "bookings",
    label: "Bookings",
    description: "Reservation records (Admin).",
    importHint:
      "JSON array: { userId, itineraryId, bookingType, provider, referenceCode, amount, currency? }.",
    sample: [
      {
        userId: 1,
        itineraryId: 1,
        bookingType: "package",
        provider: "SmartTravel",
        referenceCode: "IMP-001",
        amount: 499.99,
        currency: "EUR",
      },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    description: "Payment ledger (Admin).",
    importHint:
      "JSON array: { userId, bookingId, amount, currency?, paymentMethod, paymentStatus, externalReference? }.",
    sample: [
      {
        userId: 1,
        bookingId: 1,
        amount: 499.99,
        currency: "EUR",
        paymentMethod: "card",
        paymentStatus: "Completed",
        externalReference: "lab-import-1",
      },
    ],
  },
  {
    id: "itineraries",
    label: "Itineraries",
    description: "Generated trip plans (Admin).",
    importHint: "JSON array: { userId, plan: { destination, startDate, endDate, ... } }.",
    sample: [
      {
        userId: 1,
        plan: {
          destination: "Paris",
          startDate: "2026-09-01",
          endDate: "2026-09-07",
          guests: 2,
          budget: 2000,
        },
      },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "User alerts (Admin).",
    importHint: "JSON array: { userId, title, message, type? }.",
    sample: [
      {
        userId: 1,
        title: "Import test",
        message: "Created via admin data import.",
        type: "system",
      },
    ],
  },
];
