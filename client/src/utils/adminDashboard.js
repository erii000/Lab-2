import { bookingsChartData as seedChart } from "../data/adminData.js";
import { adminChartSegmentColors } from "../components/admin/adminStyles.js";

export function computeDashboardKpis(bookings, users, trips) {
  const revenue = bookings.reduce((s, b) => {
    if (["confirmed", "paid", "pending", "partially_refunded"].includes(b.status)) return s + (b.amount ?? 0) - (b.refundedAmount ?? 0);
    return s;
  }, 0);
  const activeUsers = users.filter((u) => u.accountStatus !== "deactivated" && u.accountStatus !== "suspended").length;
  const avgAi = trips.length
    ? Math.round(trips.reduce((s, t) => s + (t.aiScore ?? 0), 0) / trips.length)
    : 0;
  const topTrip = [...trips].sort((a, b) => (b.bookings ?? 0) - (a.bookings ?? 0))[0];

  return {
    totalBookings: { value: bookings.length, delta: "+12%", trend: [38, 42, 45, 48, 52, 55, bookings.length] },
    revenue: { value: revenue, delta: "+8.1%", trend: [4200, 4800, 5100, 5500, 6200, 7000, revenue] },
    activeUsers: { value: activeUsers, delta: "+3.2%", trend: [120, 125, 128, 130, 132, 135, activeUsers] },
    aiScore: {
      value: avgAi,
      delta: topTrip ? `Trending: ${topTrip.destination || topTrip.country}` : "+5%",
      trend: [72, 74, 76, 78, 79, 81, avgAi],
      sublabel: topTrip?.title,
    },
    pendingCount: bookings.filter((b) => b.status === "pending").length,
    cancelledCount: bookings.filter((b) => b.status === "cancelled").length,
  };
}

export function buildChartSeries(period = "daily") {
  if (period === "daily") {
    return seedChart.map((d) => ({ ...d }));
  }
  if (period === "weekly") {
    return [
      { label: "W1", bookings: 210, revenue: 22400 },
      { label: "W2", bookings: 248, revenue: 26100 },
      { label: "W3", bookings: 265, revenue: 28900 },
      { label: "W4", bookings: 290, revenue: 31200 },
    ];
  }
  return [
    { label: "Jan", bookings: 820, revenue: 88000 },
    { label: "Feb", bookings: 910, revenue: 95200 },
    { label: "Mar", bookings: 1040, revenue: 108400 },
    { label: "Apr", bookings: 1120, revenue: 118200 },
  ];
}

export function computeDestinationBreakdown(bookings) {
  const map = {};
  bookings.forEach((b) => {
    const key = b.destination ?? "Other";
    map[key] = (map[key] ?? 0) + 1;
  });
  const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
  const colors = adminChartSegmentColors;
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count], i) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
      color: colors[i % colors.length],
    }));
}

export function computeStatusBreakdown(bookings) {
  const keys = [
    { key: "paid", label: "Paid", statuses: ["confirmed", "paid"] },
    { key: "pending", label: "Pending", statuses: ["pending"] },
    { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
    { key: "refunded", label: "Refunded", statuses: ["refunded", "partially_refunded"] },
  ];
  const max = bookings.length || 1;
  return keys.map((k) => ({
    label: k.label,
    count: bookings.filter((b) => k.statuses.includes(b.status)).length,
    pct: Math.round((bookings.filter((b) => k.statuses.includes(b.status)).length / max) * 100),
  }));
}

export function computeTopTrips(trips) {
  return [...trips]
    .filter((t) => !t.deletedAt)
    .sort((a, b) => (b.bookings ?? 0) - (a.bookings ?? 0))
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      title: t.title,
      bookings: t.bookings ?? 0,
      revenue: t.revenue ?? 0,
      aiScore: t.aiScore ?? 0,
    }));
}

export function generateSmartInsights(bookings, trips, users) {
  const insights = [];
  const destCounts = {};
  bookings.forEach((b) => {
    destCounts[b.destination] = (destCounts[b.destination] ?? 0) + 1;
  });
  const topDest = Object.entries(destCounts).sort((a, b) => b[1] - a[1])[0];
  if (topDest) insights.push({ type: "trend", text: `${topDest[0]} leads with ${topDest[1]} active bookings this period` });

  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  if (cancelled >= 1) {
    const rome = bookings.filter((b) => b.destination === "Rome" && b.status === "cancelled").length;
    if (rome) insights.push({ type: "alert", text: "Rome cancellation rate unusually high — review refund policy" });
    else insights.push({ type: "alert", text: `${cancelled} cancellation${cancelled > 1 ? "s" : ""} require attention` });
  }

  const tokyoBookings = bookings.filter((b) => b.destination === "Tokyo").length;
  if (tokyoBookings >= 2) insights.push({ type: "trend", text: `Tokyo bookings increased — ${tokyoBookings} in pipeline` });

  const luxuryTrips = trips.filter((t) => t.style === "luxury" || t.priceFrom > 1500);
  if (luxuryTrips.length) insights.push({ type: "tip", text: "Luxury packages converting better on weekends" });

  insights.push({ type: "tip", text: "Peak search: Paris, Tokyo, Amalfi — feature on homepage" });

  const flagged = users.filter((u) => u.travelerStatus === "inactive" || u.accountStatus === "suspended").length;
  if (flagged) insights.push({ type: "alert", text: `${flagged} account${flagged > 1 ? "s" : ""} flagged for review` });

  return insights.slice(0, 6);
}

export function forecastNextWeek(bookings) {
  const base = bookings.filter((b) => ["confirmed", "paid", "pending"].includes(b.status)).length;
  return Math.max(base + 2, Math.round(base * 1.12));
}
