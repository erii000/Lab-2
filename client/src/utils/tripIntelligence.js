import { addDays, calculateTripQuote, diffNights, formatISODate } from "./destinationSearch.js";

const SMART_TAGS = {
  recommended: { id: "recommended", label: "🥇 Recommended" },
  cheapest: { id: "cheapest", label: "🔥 Best Value" },
  "best-weather": { id: "best-weather", label: "☀️ Best Weather" },
  luxury: { id: "luxury", label: "💎 Luxury Pick" },
  "almost-full": { id: "almost-full", label: "⚡ Almost Full" },
  nightlife: { id: "nightlife", label: "🌙 Nightlife" },
  romantic: { id: "romantic", label: "💕 Romantic" },
  family: { id: "family", label: "👨‍👩‍👧 Family" },
  business: { id: "business", label: "✈️ Business Class" },
  direct: { id: "direct", label: "⚡ Direct Flight" },
};

const TRAVEL_CLASS = {
  economy: { multiplier: 1, comfortBoost: 0, label: "Economy", cabin: "Standard cabin · 1 bag" },
  premium: { multiplier: 1.34, comfortBoost: 10, label: "Premium", cabin: "Extra legroom · Priority boarding" },
  business: { multiplier: 1.78, comfortBoost: 22, label: "Business", cabin: "Lie-flat · Lounge · 2 bags" },
};

function formatDayLabel(date) {
  return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

function getTripTheme(smart, destination) {
  if (smart.nightlife) {
    return { suffix: "Nightlife & Evenings", focus: "nightlife", weatherMod: -4, crowdMod: 8, comfortMod: 6 };
  }
  if (smart.romantic) {
    return { suffix: "Romantic Escape", focus: "romance", weatherMod: 6, crowdMod: -6, comfortMod: 14 };
  }
  if (smart.family) {
    return { suffix: "Family Adventure", focus: "family", weatherMod: 2, crowdMod: -10, comfortMod: 8 };
  }
  if (smart.luxuryOnly) {
    return { suffix: "Luxury Collection", focus: "luxury", weatherMod: 4, crowdMod: -4, comfortMod: 16 };
  }
  return {
    suffix: destination.tag?.includes("Luxury") ? "Premium Escape" : "City Break",
    focus: "general",
    weatherMod: 0,
    crowdMod: 0,
    comfortMod: 0,
  };
}

function computeMatchScore(item, smart, travelClass) {
  let score = 50;
  if (smart.bestWeather) score += item.weatherScore * 0.45;
  if (smart.lowCrowd) score += item.crowdScore * 0.45;
  if (smart.shortestTravel && item.directFlight) score += 25;
  if (smart.luxuryOnly && item.hotelTier === "luxury") score += 30;
  if (smart.nightlife && item.focus === "nightlife") score += 28;
  if (smart.romantic && item.focus === "romance") score += 28;
  if (smart.family && item.focus === "family") score += 28;
  if (travelClass === "business") score += item.comfortScore * 0.2;
  if (!smart.bestWeather && !smart.lowCrowd && !smart.shortestTravel) {
    score += item.aiScore * 0.35;
  }
  return Math.round(score);
}

export function getActiveFilterLabels(filters) {
  const labels = [];
  const cls = TRAVEL_CLASS[filters.travelClass] ?? TRAVEL_CLASS.economy;
  labels.push(cls.label);
  if (filters.directOnly) labels.push("Direct flights");
  if (filters.smart?.bestWeather) labels.push("Best weather");
  if (filters.smart?.luxuryOnly) labels.push("Luxury");
  if (filters.smart?.nightlife) labels.push("Nightlife");
  if (filters.smart?.romantic) labels.push("Romantic");
  if (filters.smart?.family) labels.push("Family");
  if (filters.smart?.lowCrowd) labels.push("Low crowd");
  if (filters.smart?.shortestTravel) labels.push("Shortest route");
  return labels;
}

export function getAiHeroCopy(destination) {
  const tone = destination.tag?.toLowerCase().includes("luxury") ? "Luxury" : "Premium";
  return {
    aiDescription: `${tone} ${destination.tripTypes?.[0]?.toLowerCase() ?? "cultural"} destination in ${destination.country} with ideal ${destination.weather?.condition?.toLowerCase() ?? "seasonal"} conditions.`,
    aiScore: Math.min(99, Math.round(88 + destination.rating * 2)),
    avgWeather: `${destination.weather?.tempC ?? 20}°C · ${destination.weather?.condition ?? "Fair"}`,
  };
}

export function buildAiSummaryBar(destination, { start, end, guests, filters }) {
  const nights = diffNights(start, end);
  const g = Math.max(1, guests || 2);
  const active = getActiveFilterLabels(filters ?? {});
  const flightCount = 8 + (g % 4) + (filters?.travelClass === "business" ? 2 : 0);
  const hotelCount = 5 + (nights % 3) + (filters?.smart?.luxuryOnly ? 3 : 0);
  const expCount = 10 + (destination.activities?.length ?? 0);

  return {
    flights: flightCount,
    hotels: hotelCount,
    experiences: expCount,
    highlights: [
      { label: "Best weather", value: formatDayLabel(addDays(new Date(start), filters?.smart?.bestWeather ? 2 : 1)) },
      { label: "Lowest crowd", value: formatDayLabel(addDays(new Date(start), filters?.smart?.lowCrowd ? 3 : 2)) },
      { label: "Best booking value", value: `${formatDayLabel(new Date(start))} · ${TRAVEL_CLASS[filters?.travelClass ?? "economy"]?.label ?? "Economy"}` },
    ],
    headline: `AI matched ${flightCount} flights, ${hotelCount} hotels, and ${expCount} experiences for ${active.join(" · ")}.`,
    activeFilters: active,
  };
}

export function buildCuratedDepartures(destination, filters = {}) {
  const {
    weeks = 12,
    guests = 2,
    budget,
    travelClass = "economy",
    directOnly = false,
    smart = {},
  } = filters;

  const guestCount = Math.max(1, Number(guests) || 1);
  const budgetNum = budget ? Number(budget) : null;
  const classCfg = TRAVEL_CLASS[travelClass] ?? TRAVEL_CLASS.economy;
  const theme = getTripTheme(smart, destination);
  const hotelTierId = smart.luxuryOnly ? "luxury" : travelClass === "business" ? "luxury" : "boutique";
  const base = addDays(new Date(), 7);
  const items = [];

  for (let i = 0; i < weeks; i += 1) {
    const start = addDays(base, i * 7);
    const end = addDays(start, smart.family ? 5 : 4);
    const startIso = formatISODate(start);
    const endIso = formatISODate(end);

    const seasonFactor = 1 + (i % 3) * 0.05;
    const directFlight = i % 2 === 0 || i === 1;
    if (directOnly && !directFlight) continue;

    const quote = calculateTripQuote(destination, {
      start: startIso,
      end: endIso,
      guests: guestCount,
      hotelTierId,
    });

    let weatherScore = Math.min(99, 68 + (destination.weather?.tempC ?? 20) - i + theme.weatherMod);
    let crowdScore = Math.max(28, 94 - i * 7 - guestCount + theme.crowdMod);
    let comfortScore = Math.min(99, 72 + destination.rating * 4 + classCfg.comfortBoost + theme.comfortMod - i);

    if (smart.bestWeather) weatherScore = Math.min(99, weatherScore + 12 - i * 2);
    if (smart.lowCrowd) crowdScore = Math.min(99, crowdScore + 10);
    if (smart.nightlife && i % 2 === 0) crowdScore += 6;
    if (smart.romantic) comfortScore = Math.min(99, comfortScore + 8);

    const basePrice = Math.round(destination.priceFrom * seasonFactor * classCfg.multiplier);
    const pricePerPerson = Math.round(basePrice * (guestCount >= 4 ? 0.92 : 1));
    const totalTrip = Math.round(quote.total * classCfg.multiplier);
    const suggestedBudget = Math.round(totalTrip * 1.05);
    const aiScore = Math.round((weatherScore + crowdScore + comfortScore) / 3);
    const slotsLeft = Math.max(2, 16 - i * 2 + (smart.family ? 4 : 0));

    const item = {
      id: `${destination.id}-${startIso}-${travelClass}-${theme.focus}`,
      start: startIso,
      end: endIso,
      label: start.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
      endLabel: end.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
      pricePerPerson,
      totalTrip,
      suggestedBudget,
      suggestedGuests: guestCount,
      slotsLeft: smart.family ? slotsLeft + 2 : slotsLeft,
      aiScore,
      weatherScore: Math.round(weatherScore),
      crowdScore: Math.round(crowdScore),
      comfortScore: Math.round(comfortScore),
      directFlight,
      travelClass,
      travelClassLabel: classCfg.label,
      cabinNote: classCfg.cabin,
      hotelTier: hotelTierId,
      focus: theme.focus,
      packageTitle: `${destination.title} ${theme.suffix}`,
      matchScore: 0,
      tags: [],
    };

    item.matchScore = computeMatchScore(item, smart, travelClass);
    items.push(item);
  }

  let filtered = items;

  if (smart.luxuryOnly) {
    filtered = filtered.filter((x) => x.hotelTier === "luxury" || x.comfortScore >= 88);
  }
  if (smart.nightlife) {
    filtered = filtered.filter((x) => x.crowdScore >= 55 || x.focus === "nightlife");
  }
  if (smart.romantic) {
    filtered = filtered.filter((x) => x.comfortScore >= 78);
  }
  if (smart.family) {
    filtered = filtered.filter((x) => x.slotsLeft >= 6);
  }
  if (budgetNum) {
    filtered = filtered.filter((x) => x.suggestedBudget <= budgetNum * 1.12);
  }
  if (smart.shortestTravel || directOnly) {
    filtered = filtered.filter((x) => x.directFlight);
  }

  if (smart.bestWeather) {
    filtered = [...filtered].sort((a, b) => b.weatherScore - a.weatherScore || b.matchScore - a.matchScore);
  } else if (smart.lowCrowd) {
    filtered = [...filtered].sort((a, b) => b.crowdScore - a.crowdScore || b.matchScore - a.matchScore);
  } else if (travelClass === "business") {
    filtered = [...filtered].sort((a, b) => b.comfortScore - a.comfortScore || b.pricePerPerson - a.pricePerPerson);
  } else if (smart.luxuryOnly) {
    filtered = [...filtered].sort((a, b) => b.comfortScore - a.comfortScore);
  } else {
    filtered = [...filtered].sort((a, b) => b.matchScore - a.matchScore);
  }

  const minPrice = filtered.length ? Math.min(...filtered.map((x) => x.pricePerPerson)) : 0;

  filtered.forEach((item, i) => {
    const tags = [];
    if (item.pricePerPerson === minPrice) tags.push(SMART_TAGS.cheapest);
    if (i === 0 && filtered.length) tags.push(SMART_TAGS.recommended);
    if (item.weatherScore >= 90) tags.push(SMART_TAGS["best-weather"]);
    if (item.hotelTier === "luxury" || smart.luxuryOnly) tags.push(SMART_TAGS.luxury);
    if (item.slotsLeft <= 5) tags.push(SMART_TAGS["almost-full"]);
    if (smart.nightlife) tags.push(SMART_TAGS.nightlife);
    if (smart.romantic) tags.push(SMART_TAGS.romantic);
    if (smart.family) tags.push(SMART_TAGS.family);
    if (travelClass === "business") tags.push(SMART_TAGS.business);
    if (item.directFlight) tags.push(SMART_TAGS.direct);
    const unique = [...new Map(tags.map((t) => [t.id, t])).values()].slice(0, 3);
    item.tags = unique;
  });

  return filtered.slice(0, 10);
}

export function filtersSignature(filters) {
  const { smart, ...rest } = filters;
  return JSON.stringify({ ...rest, smart });
}

/** Live total from user-selected flight, hotel, and experiences in the trip modal */
export function computeCustomTripQuote({
  flightPrice = 0,
  hotelTotal = 0,
  guests = 2,
  experiences = [],
  budget = null,
}) {
  const guestCount = Math.max(1, Number(guests) || 1);
  const experiencesTotal = experiences.reduce((sum, e) => sum + (e.price ?? 0) * guestCount, 0);
  const subtotal = flightPrice + hotelTotal + experiencesTotal;
  const serviceFee = Math.round(subtotal * 0.08);
  const taxes = Math.round((flightPrice + hotelTotal) * 0.06);
  const total = subtotal + serviceFee + taxes;
  const budgetNum = budget ? Number(budget) : null;

  return {
    guests: guestCount,
    flight: flightPrice,
    hotel: hotelTotal,
    experiences: experiencesTotal,
    serviceFee,
    taxes,
    subtotal,
    total,
    perPerson: Math.round(total / guestCount),
    withinBudget: budgetNum ? total <= budgetNum : null,
    budgetRemaining: budgetNum ? budgetNum - total : null,
    lineItems: [
      { label: `Flights (${guestCount} traveler${guestCount > 1 ? "s" : ""})`, amount: flightPrice },
      { label: "Accommodation", amount: hotelTotal },
      ...(experiencesTotal > 0
        ? [{ label: `Experiences (${experiences.length})`, amount: experiencesTotal }]
        : []),
      { label: "Service fee", amount: serviceFee },
      { label: "Taxes & levies", amount: taxes },
    ],
  };
}

export function buildTripPackage(destination, departure, filters = {}) {
  const { guests = 2, budget } = filters;
  const nights = diffNights(departure.start, departure.end);
  const hotelTier = departure.hotelTier ?? (filters.luxuryOnly ? "luxury" : "boutique");
  const quote = calculateTripQuote(destination, {
    start: departure.start,
    end: departure.end,
    guests,
    budget,
    hotelTierId: hotelTier,
  });

  const classCfg = TRAVEL_CLASS[departure.travelClass ?? "economy"] ?? TRAVEL_CLASS.economy;
  const weatherForecast = buildWeatherForecast(departure.start, nights, destination);
  const flights = buildFlightOptions(destination, departure, guests, classCfg);
  const hotels = buildHotelOptions(destination, nights, hotelTier);
  const experiences = buildExperienceSuggestions(destination, departure, filters);
  const insights = buildAiInsights(destination, departure, quote, filters);
  const itinerary = buildItinerary(destination, departure, experiences, filters);

  return {
    departure,
    quote,
    weatherForecast,
    flights,
    hotels,
    experiences,
    insights,
    itinerary,
    overview: {
      bullets: buildOverviewBullets(filters, departure),
    },
    budgetMeter: {
      flight: flights.find((f) => f.recommended)?.priceTotal ?? flights[0]?.priceTotal ?? 0,
      hotel: hotels.find((h) => h.recommended)?.total ?? hotels[0]?.total ?? 0,
      experiences: experiences.filter((e) => e.recommended).reduce((s, e) => s + e.price * guests, 0),
      total: Math.round(quote.total * (classCfg.multiplier ?? 1)),
      budget: budget ? Number(budget) : null,
    },
    weatherAlert:
      weatherForecast.some((d) => d.rain > 20)
        ? `Rain expected on ${weatherForecast.find((d) => d.rain > 20)?.day} afternoon. Indoor experiences recommended.`
        : null,
  };
}

function buildOverviewBullets(filters, departure) {
  const bullets = [];
  if (filters?.smart?.bestWeather) bullets.push("Perfect weather window for outdoor sightseeing.");
  else bullets.push("Balanced conditions for city exploration.");
  if (departure.directFlight) bullets.push("Direct routing — shortest travel time.");
  if (filters?.travelClass === "business") bullets.push("Business cabin with lounge access included.");
  if (filters?.smart?.romantic) bullets.push("Ideal for couples — fine dining and sunset slots reserved.");
  if (filters?.smart?.family) bullets.push("Family-friendly pacing with flexible check-in.");
  if (filters?.smart?.nightlife) bullets.push("Evening experiences and nightlife districts prioritized.");
  return bullets.slice(0, 4);
}

function buildWeatherForecast(startIso, nights, destination) {
  const days = [];
  const start = new Date(startIso);
  for (let i = 0; i <= nights; i += 1) {
    const d = addDays(start, i);
    const rain = (i * 7 + 3) % 25;
    days.push({
      day: d.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
      temp: (destination.weather?.tempC ?? 22) + (i % 2) - 1,
      rain,
      condition: rain < 8 ? (i === 2 ? "Perfect" : "Sunny") : rain < 15 ? "Clear" : "Light clouds",
    });
  }
  return days;
}

function buildFlightOptions(destination, departure, guests, classCfg) {
  const mult = classCfg.multiplier ?? 1;
  return [
    {
      id: "f1",
      airline: "Air France",
      departure: "08:40",
      arrival: "11:05",
      baggage: classCfg.label === "Business" ? "32kg + 2 bags" : "23kg + cabin",
      lounge: classCfg.label !== "Economy",
      cancellation: "Free 24h",
      wifi: true,
      carbonScore: "Low",
      priceTotal: Math.round(destination.flightEstimate * 1.1 * mult * guests),
      recommended: classCfg.label === "Premium",
      classLabel: classCfg.label,
    },
    {
      id: "f2",
      airline: "SkyLink",
      departure: "14:15",
      arrival: "16:50",
      baggage: "1 checked bag",
      lounge: false,
      cancellation: "Flexible +€40",
      wifi: true,
      carbonScore: "Medium",
      priceTotal: Math.round(destination.flightEstimate * 0.9 * mult * guests),
      recommended: classCfg.label === "Economy",
      classLabel: classCfg.label,
    },
    {
      id: "f3",
      airline: "Premium Air",
      departure: "19:30",
      arrival: "22:00",
      baggage: "2 bags + priority",
      lounge: true,
      cancellation: "Fully refundable",
      wifi: true,
      carbonScore: "Low",
      priceTotal: Math.round(destination.flightEstimate * 1.38 * mult * guests),
      recommended: classCfg.label === "Business",
      classLabel: classCfg.label,
    },
  ];
}

function buildHotelOptions(destination, nights, tierId) {
  const tiers = destination.hotelTiers ?? [];
  const ordered = tierId === "luxury" ? [...tiers].reverse() : tiers;
  return ordered.map((tier) => ({
    id: tier.id,
    name: tier.label,
    distanceKm: tier.id === "luxury" ? 0.4 : 1.2,
    breakfast: true,
    spa: tier.id === "luxury",
    rating: tier.id === "luxury" ? 4.92 : 4.78,
    luxuryScore: tier.id === "luxury" ? 96 : 82,
    nightly: tier.nightly,
    total: tier.nightly * nights,
    aiNote: tier.id === "luxury" ? "Flagship property with spa and skyline views." : "Perfect for couples and museum access.",
    recommended: tier.id === tierId,
  }));
}

function buildExperienceSuggestions(destination, departure, filters) {
  const smart = filters?.smart ?? {};
  return (destination.activities ?? []).map((act, i) => {
    let recommended = i < 3;
    let reason = "Matches your travel dates";

    if (smart.nightlife && (act.category === "Experience" || act.category === "Entertainment")) {
      recommended = true;
      reason = "Top pick for nightlife & evenings";
    }
    if (smart.romantic && (act.category === "Food" || act.category === "Experience")) {
      recommended = true;
      reason = "Highly rated for couples";
    }
    if (smart.family && (act.category === "Day trip" || act.category === "Adventure")) {
      recommended = true;
      reason = "Family-friendly activity";
    }
    if (smart.bestWeather && act.category === "Experience") {
      recommended = true;
      reason = "Best in clear weather conditions";
    }

    return { ...act, recommended, reason };
  });
}

function buildAiInsights(destination, departure, quote, filters) {
  const cls = filters?.travelClass ?? "economy";
  return {
    booking: cls === "business" ? "Business cabins selling fast — 2 seats left at this fare." : "Prices likely to rise in 2 days.",
    crowd: filters?.smart?.lowCrowd
      ? `Lowest crowds expected ${departure.endLabel ?? departure.label}.`
      : `Moderate traffic around ${departure.label}.`,
    weather: filters?.smart?.bestWeather
      ? "Peak sunshine window — best walking 17:00–20:00."
      : "Best walking conditions detected between 18:00–21:00.",
    flightTip:
      cls === "business"
        ? "Lie-flat seats with lounge — best comfort for this route."
        : "Best balance between comfort and price.",
  };
}

function buildItinerary(destination, departure, experiences, filters) {
  const smart = filters?.smart ?? {};
  const picks = experiences.filter((e) => e.recommended).slice(0, 3);
  const evening = smart.nightlife ? "District nightlife & rooftop bar" : "Seine dinner cruise";
  const culture = smart.romantic ? "Private museum evening" : picks[1]?.name ?? "Louvre";
  const day3 = smart.family ? "Theme park / family excursion" : picks[2]?.name ?? "Food tour";

  return [
    {
      day: 1,
      title: "Arrival",
      items: ["Arrival & private transfer", `${departure.travelClassLabel ?? "Economy"} check-in`, evening],
    },
    {
      day: 2,
      title: smart.romantic ? "Romance day" : "Explore",
      items: [culture, "Local café break", "Sunset viewpoint"],
    },
    {
      day: 3,
      title: "Highlights",
      items: [day3, "Free evening", smart.nightlife ? "Late-night jazz club" : "Optional spa"],
    },
  ];
}
