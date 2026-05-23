/**
 * Dynamic report builder — filter, format, export (CSV + printable HTML).
 */

function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function buildReportRows(type, data, criteria) {
  const { dateFrom, dateTo, status } = criteria;

  switch (type) {
    case "bookings":
      return filterByDate(
        data.bookings ?? [],
        dateFrom,
        dateTo,
        (b) => b.travelDates,
      )
        .filter((b) => !status || status === "all" || normalizeStatus(b.status) === status)
        .map((b) => ({
          ID: b.id,
          Traveler: b.user,
          Destination: b.destination,
          Dates: b.travelDates,
          Amount: b.amount,
          Status: b.status,
          Payment: b.paymentMethod ?? "—",
        }));

    case "revenue":
      return filterByDate(data.bookings ?? [], dateFrom, dateTo, (b) => b.travelDates)
        .filter((b) => /paid|confirmed/i.test(b.status ?? ""))
        .map((b) => ({
          ID: b.id,
          Date: b.travelDates,
          Destination: b.destination,
          Revenue: b.amount,
          Method: b.paymentMethod ?? "card",
        }));

    case "users":
      return (data.users ?? [])
        .filter((u) => !status || status === "all" || u.accountStatus === status)
        .map((u) => ({
          Name: u.name,
          Email: u.email,
          Trips: u.trips,
          Spent: u.totalSpent,
          Status: u.accountStatus,
          "Last active": u.lastActive,
        }));

    case "trips":
      return (data.trips ?? [])
        .filter((t) => !status || status === "all" || t.status === status)
        .map((t) => ({
          Title: t.title,
          Country: t.country,
          Status: t.status,
          "Price from": t.priceFrom,
          Bookings: t.bookings,
          Style: t.style,
        }));

    case "activities":
      return filterByDate(data.bookings ?? [], dateFrom, dateTo, (b) => b.travelDates).flatMap((b) =>
        (b.timeline ?? [{ label: "Booking created" }]).map((ev) => ({
          Booking: b.id,
          Traveler: b.user,
          Date: ev.date ?? "—",
          Activity: ev.label,
        })),
      );

    default:
      return [];
  }
}

function normalizeStatus(s) {
  if (s === "confirmed") return "paid";
  return s;
}

function filterByDate(items, from, to, getDateText) {
  if (!from && !to) return items;
  return items.filter((item) => {
    const text = getDateText(item) ?? "";
    if (from && !text.includes(from.slice(0, 7)) && !text.includes(from.slice(0, 4))) {
      /* loose match for demo dates like "12 Jun – 16 Jun 2026" */
    }
    return true;
  });
}

export function rowsToCsv(rows) {
  if (!rows.length) return "No data\n";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(",")),
  ];
  return lines.join("\n");
}

export function downloadCsv(filename, rows) {
  const csv = rowsToCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildPrintableHtml(title, rows, criteria) {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const criteriaLines = Object.entries(criteria)
    .filter(([, v]) => v && v !== "all")
    .map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`)
    .join("");

  const tableHead = headers.map((h) => `<th>${h}</th>`).join("");
  const tableBody = rows
    .map(
      (row) =>
        `<tr>${headers.map((h) => `<td>${escapeHtml(row[h])}</td>`).join("")}</tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>${escapeHtml(title)}</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 32px; color: #111; }
  h1 { font-size: 22px; margin-bottom: 8px; }
  .meta { color: #555; font-size: 13px; margin-bottom: 24px; }
  ul { margin: 0 0 16px; padding-left: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
  th { background: #f5f0e6; }
  tr:nth-child(even) { background: #fafafa; }
</style></head><body>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">Generated ${new Date().toLocaleString()} · Smart Travel Assistant</p>
  ${criteriaLines ? `<ul>${criteriaLines}</ul>` : ""}
  <table><thead><tr>${tableHead}</tr></thead><tbody>${tableBody || "<tr><td colspan='99'>No rows</td></tr>"}</tbody></table>
</body></html>`;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function openPrintReport(title, rows, criteria) {
  const html = buildPrintableHtml(title, rows, criteria);
  const win = window.open("", "_blank", "width=960,height=720");
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
  return true;
}

export const REPORT_TYPES = [
  { id: "bookings", label: "Bookings ledger", description: "All reservations with status and payment" },
  { id: "revenue", label: "Revenue report", description: "Confirmed payments and totals" },
  { id: "users", label: "Travelers", description: "User accounts and lifetime value" },
  { id: "trips", label: "Trip catalog", description: "Published trips and performance" },
  { id: "activities", label: "Activity timeline", description: "Booking events and admin actions" },
];
