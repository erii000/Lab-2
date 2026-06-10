/**
 * Full-text search, multi-field filtering, and sorting for in-app lists.
 */

export function normalizeSearchText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export function tokenizeQuery(query) {
  return normalizeSearchText(query)
    .split(/\s+/)
    .filter(Boolean);
}

/** Match all tokens against any of the provided field values */
export function fullTextMatch(item, query, getSearchableText) {
  const tokens = tokenizeQuery(query);
  if (!tokens.length) return true;
  const haystack = normalizeSearchText(getSearchableText(item));
  return tokens.every((token) => haystack.includes(token));
}

export function compareValues(a, b, type = "string") {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (type === "number" || (typeof a === "number" && typeof b === "number")) {
    return Number(a) - Number(b);
  }
  if (type === "date") return new Date(a).getTime() - new Date(b).getTime();
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

/**
 * @param {object} options
 * @param {Array} options.items
 * @param {string} options.query
 * @param {Function} options.getSearchableText
 * @param {string} [options.sortKey]
 * @param {'asc'|'desc'} [options.sortDir]
 * @param {Function} [options.getSortValue] - (item, sortKey) => value
 * @param {Function} [options.predicate] - extra filter
 */
export function applyAdvancedListQuery({
  items,
  query,
  getSearchableText,
  sortKey,
  sortDir = "asc",
  getSortValue,
  predicate,
}) {
  let result = items;

  if (predicate) {
    result = result.filter(predicate);
  }

  if (query?.trim()) {
    result = result.filter((item) => fullTextMatch(item, query, getSearchableText));
  }

  if (sortKey && getSortValue) {
    const dir = sortDir === "desc" ? -1 : 1;
    result = [...result].sort((a, b) => dir * compareValues(getSortValue(a, sortKey), getSortValue(b, sortKey)));
  }

  return result;
}

export const EXPLORE_SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "title-asc", label: "Name: A → Z" },
];

export const BOOKING_SORT_OPTIONS = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "Amount: high to low" },
  { value: "title-asc", label: "Destination A → Z" },
];

export const ADMIN_BOOKING_SORT_OPTIONS = [
  { value: "calendar-desc", label: "Date (latest day first)" },
  { value: "calendar-asc", label: "Date (oldest day first)" },
  { value: "travel-date-desc", label: "Travel date (latest first)" },
  { value: "travel-date-asc", label: "Travel date (earliest first)" },
  { value: "date-desc", label: "Recently updated" },
  { value: "date-asc", label: "Oldest update" },
  { value: "amount-desc", label: "Amount" },
  { value: "user-asc", label: "Traveler name" },
  { value: "destination-asc", label: "Destination" },
  { value: "id-desc", label: "Booking ID" },
];

export const ADMIN_USER_SORT_OPTIONS = [
  { value: "calendar-desc", label: "Date (latest day first)" },
  { value: "calendar-asc", label: "Date (oldest day first)" },
  { value: "date-desc", label: "Recently active" },
  { value: "joined-desc", label: "Newest members" },
  { value: "spent-desc", label: "Lifetime value" },
  { value: "trips-desc", label: "Most trips" },
  { value: "name-asc", label: "Name A → Z" },
];

export const ADMIN_TRIP_SORT_OPTIONS = [
  { value: "calendar-desc", label: "Date (latest day first)" },
  { value: "calendar-asc", label: "Date (oldest day first)" },
  { value: "date-desc", label: "Recently updated" },
  { value: "bookings-desc", label: "Most bookings" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "title-asc", label: "Title A → Z" },
  { value: "status-asc", label: "Status" },
];
