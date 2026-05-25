import * as bookingsApi from "../api/bookingsApi.js";
import * as itinerariesApi from "../api/itinerariesApi.js";
import * as usersApi from "../api/usersApi.js";
import { apiBookingToAdmin, apiTripToAdmin } from "../utils/bookingMappers.js";
import { enrichBooking } from "../utils/adminBookingActivity.js";
import { enrichTrip } from "../utils/adminTrips.js";
import { enrichUser } from "../utils/adminUsers.js";

function mapApiUser(row) {
  const roles = row.roles ?? row.Roles ?? [];
  const primaryRole = roles[0] ?? "Traveler";
  const first = row.firstName ?? row.FirstName ?? "";
  const last = row.lastName ?? row.LastName ?? "";
  return enrichUser({
    id: String(row.id ?? row.Id),
    name: [first, last].filter(Boolean).join(" ") || row.email?.split("@")[0],
    email: row.email ?? row.Email,
    role: primaryRole,
    travelerStatus: row.isActive === false || row.IsActive === false ? "inactive" : "active",
    trips: 0,
    bookings: 0,
    totalSpent: 0,
    lastActive: "—",
    favoriteDestination: "—",
    averageBudget: 0,
    preferences: [],
    savedTrips: [],
    bookingHistory: [],
    accountStatus: row.isActive === false || row.IsActive === false ? "deactivated" : "active",
  });
}

export async function fetchAdminBookings(accessToken) {
  const data = await bookingsApi.searchBookings(accessToken, { page: 1, pageSize: 500 });
  const items = data.items ?? data.Items ?? [];
  let usersById = new Map();
  try {
    const usersData = await usersApi.listUsers(accessToken, { pageNumber: 1, pageSize: 500 });
    const users = usersData.items ?? usersData.Items ?? [];
    usersById = new Map(
      users.map((u) => [
        u.id ?? u.Id,
        {
          name: [u.firstName ?? u.FirstName, u.lastName ?? u.LastName].filter(Boolean).join(" "),
          email: u.email ?? u.Email,
        },
      ]),
    );
  } catch {
    /* users optional for labels */
  }
  return items.map((row) => enrichBooking(apiBookingToAdmin(row, usersById)));
}

export async function fetchAdminTrips(accessToken) {
  const data = await itinerariesApi.searchTrips(accessToken, { page: 1, pageSize: 100 });
  const items = data.items ?? data.Items ?? [];
  return items.map((row) => enrichTrip(apiTripToAdmin(row)));
}

export async function fetchAdminUsers(accessToken) {
  const data = await usersApi.listUsers(accessToken, { pageNumber: 1, pageSize: 500 });
  const items = data.items ?? data.Items ?? [];
  return items.map(mapApiUser);
}
