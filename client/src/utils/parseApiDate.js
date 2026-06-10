/** Parse API / SQL timestamps as UTC milliseconds (avoids local-time skew). */
export function parseApiDate(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const text = String(value).trim();
  if (!text) return null;

  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(text)) {
    const ms = Date.parse(text);
    return Number.isNaN(ms) ? null : ms;
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const ms = Date.parse(text.endsWith("Z") ? text : `${text}Z`);
    return Number.isNaN(ms) ? null : ms;
  }

  if (/^\d{4}-\d{2}-\d{2}(\s|$)/.test(text)) {
    const iso = text.includes("T") ? text : text.replace(" ", "T");
    const ms = Date.parse(iso.endsWith("Z") ? iso : `${iso}Z`);
    return Number.isNaN(ms) ? null : ms;
  }

  const ms = Date.parse(text);
  return Number.isNaN(ms) ? null : ms;
}

/** Normalize a timestamp to UTC midnight for same-day grouping (Jun 10 before Jun 9). */
export function calendarDayMs(value) {
  const ms = typeof value === "number" ? value : parseApiDate(value);
  if (ms == null) return 0;
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

const MONTHS = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/** Parse trip departure from metadata or labels like "17 Jun → 21 Jun". */
export function parseTravelStartMs(meta, travelDatesLabel) {
  if (meta && typeof meta === "object") {
    const fromMeta =
      parseApiDate(meta.start) ??
      parseApiDate(meta.startDate) ??
      parseApiDate(meta.departure?.start);
    if (fromMeta != null) return fromMeta;
  }

  const text = travelDatesLabel ?? meta?.startLabel ?? "";
  const match = String(text).match(/(\d{1,2})\s+([A-Za-z]{3,9})/);
  if (!match) return 0;

  const day = Number(match[1]);
  const month = MONTHS[match[2].slice(0, 3).toLowerCase()];
  if (month == null || !Number.isFinite(day)) return 0;

  const year = new Date().getFullYear();
  return Date.UTC(year, month, day);
}
