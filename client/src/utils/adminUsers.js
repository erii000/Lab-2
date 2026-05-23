export const TRAVELER_STATUS_OPTIONS = [
  { value: "vip", label: "VIP", color: "primary" },
  { value: "frequent", label: "Frequent", color: "info" },
  { value: "new", label: "New", color: "success" },
  { value: "active", label: "Active", color: "success" },
  { value: "inactive", label: "Inactive", color: "default" },
  { value: "high_value", label: "High Value", color: "warning" },
];

export const USER_FILTER_CHIPS = [
  { id: "all", label: "All" },
  { id: "vip", label: "VIP" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

export function getTravelerStatusMeta(status) {
  return TRAVELER_STATUS_OPTIONS.find((s) => s.value === status) ?? TRAVELER_STATUS_OPTIONS[3];
}

export function formatUserValue(amount) {
  if (amount >= 1000) return `€${(amount / 1000).toFixed(1)}k`;
  return `€${amount.toLocaleString()}`;
}

export function enrichUser(user) {
  const spent = user.totalSpent ?? 0;
  let travelerStatus = user.travelerStatus;
  if (!travelerStatus) {
    if (spent >= 5000) travelerStatus = "vip";
    else if (spent >= 4000) travelerStatus = "high_value";
    else if ((user.trips ?? 0) >= 5) travelerStatus = "frequent";
    else if ((user.trips ?? 0) <= 2 && spent < 2500) travelerStatus = "new";
    else if (/week|month/i.test(user.lastActive ?? "")) travelerStatus = "inactive";
    else travelerStatus = "active";
  }

  return {
    ...user,
    travelerStatus,
    aiInsights: user.aiInsights ?? defaultAiInsights(user),
    suggestedDestinations: user.suggestedDestinations ?? defaultSuggestions(user),
    activity: user.activity ?? defaultActivity(user),
    accountStatus: user.accountStatus ?? "active",
  };
}

function defaultAiInsights(user) {
  const prefs = user.preferences ?? [];
  const hints = [];
  if (prefs.includes("luxury")) hints.push("Likely to book summer luxury trips");
  if (prefs.includes("adventure")) hints.push("Prefers active and off-path destinations");
  if (prefs.includes("beach") || prefs.includes("family")) hints.push("High engagement on family & beach content");
  if (!hints.length) hints.push("High engagement traveler");
  if (user.favoriteDestination) hints.push(`Strong interest in ${user.favoriteDestination}`);
  return hints.slice(0, 3);
}

function defaultSuggestions(user) {
  const map = {
    Paris: ["Amalfi Coast", "Bali Escape", "Santorini"],
    Tokyo: ["Kyoto Retreat", "Seoul Premium", "Bali Escape"],
    Rome: ["Amalfi Coast", "Barcelona Nights", "Santorini"],
    Sydney: ["Bali Escape", "Dubai Luxe", "Tokyo City Break"],
  };
  return map[user.favoriteDestination] ?? ["Amalfi Coast", "Bali Escape", "Santorini"];
}

function defaultActivity(user) {
  const items = [];
  (user.bookingHistory ?? []).slice(0, 2).forEach((b) => {
    items.push({ id: `act-b-${b.id}`, text: `Booked ${b.destination}`, at: b.dates });
  });
  (user.savedTrips ?? []).slice(0, 1).forEach((t) => {
    items.push({ id: `act-s-${t}`, text: `Saved ${t}`, at: "Recently" });
  });
  items.push({ id: "act-campaign", text: "Opened summer campaign", at: "This week" });
  return items;
}

export function filterUsers(users, { query, statusFilter }) {
  let list = users;
  if (statusFilter === "vip") {
    list = list.filter((u) => ["vip", "high_value"].includes(u.travelerStatus));
  } else if (statusFilter === "active") {
    list = list.filter((u) => !["inactive"].includes(u.travelerStatus) && u.accountStatus !== "suspended");
  } else if (statusFilter === "inactive") {
    list = list.filter((u) => u.travelerStatus === "inactive" || u.accountStatus === "deactivated");
  }
  if (query?.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.preferences ?? []).some((p) => p.includes(q)) ||
        (u.favoriteDestination ?? "").toLowerCase().includes(q),
    );
  }
  return list;
}
