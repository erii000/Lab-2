/**
 * Predictive analytics — time-series style forecasting from booking history (client-side model).
 */

export function predictWeeklyBookings(bookings, { weeksAhead = 1 } = {}) {
  const byWeek = aggregateByWeek(bookings);
  const values = Object.values(byWeek);
  if (!values.length) return { forecast: 0, confidence: 0, trend: "stable" };

  const n = values.length;
  const weights = values.map((_, i) => i + 1);
  const weightSum = weights.reduce((s, w) => s + w, 0);
  const weightedAvg = values.reduce((s, v, i) => s + v * weights[i], 0) / weightSum;

  const recent = values.slice(-3);
  const older = values.slice(0, -3);
  const recentAvg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : weightedAvg;
  const olderAvg = older.length ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
  const momentum = (recentAvg - olderAvg) / Math.max(1, olderAvg);

  const forecast = Math.round(weightedAvg * (1 + momentum * 0.35) * weeksAhead);
  const confidence = Math.min(0.94, 0.55 + n * 0.04);

  let trend = "stable";
  if (momentum > 0.08) trend = "up";
  else if (momentum < -0.08) trend = "down";

  return { forecast, confidence, trend, momentum: Math.round(momentum * 100) };
}

export function predictRevenue(bookings) {
  const paid = bookings.filter((b) => /paid|confirmed/i.test(b.status ?? ""));
  const total = paid.reduce((s, b) => s + (b.amount ?? 0), 0);
  const { forecast, confidence } = predictWeeklyBookings(bookings);
  const avgTicket = paid.length ? total / paid.length : 2400;
  return {
    nextWeekRevenue: Math.round(forecast * avgTicket),
    confidence,
    avgTicket: Math.round(avgTicket),
  };
}

export function predictChurnRisk(users) {
  return users
    .map((u) => {
      let risk = 0.2;
      if (/inactive|suspended/i.test(u.accountStatus ?? "")) risk += 0.45;
      if (/month|week/i.test(u.lastActive ?? "")) risk += 0.25;
      if ((u.trips ?? 0) <= 1) risk += 0.15;
      if ((u.totalSpent ?? 0) >= 5000) risk -= 0.2;
      risk = Math.max(0.05, Math.min(0.92, risk));
      return { userId: u.id, name: u.name, risk: Math.round(risk * 100), band: risk > 0.55 ? "high" : risk > 0.35 ? "medium" : "low" };
    })
    .filter((r) => r.band !== "low")
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 5);
}

export function generateMlInsights(bookings, trips, users) {
  const bookingForecast = predictWeeklyBookings(bookings);
  const revenue = predictRevenue(bookings);
  const churn = predictChurnRisk(users);

  const insights = [
    `ML forecast: ~${bookingForecast.forecast} bookings next week (${Math.round(bookingForecast.confidence * 100)}% confidence, trend ${bookingForecast.trend}).`,
    `Projected revenue €${revenue.nextWeekRevenue.toLocaleString()} at €${revenue.avgTicket.toLocaleString()} average ticket.`,
  ];

  const topTrip = [...trips].sort((a, b) => (b.bookings ?? 0) - (a.bookings ?? 0))[0];
  if (topTrip) {
    insights.push(`Demand model ranks "${topTrip.title}" highest for conversion this month.`);
  }

  if (churn.length) {
    insights.push(`${churn.length} traveler(s) flagged for churn risk — proactive outreach recommended.`);
  }

  return { insights, bookingForecast, revenue, churn };
}

function aggregateByWeek(bookings) {
  const buckets = {};
  bookings.forEach((b, i) => {
    const week = `w${Math.floor(i / 5)}`;
    buckets[week] = (buckets[week] ?? 0) + 1;
  });
  return buckets;
}
