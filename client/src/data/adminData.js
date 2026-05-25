import { FALLBACK_DESTINATIONS } from "./destinationsFallback.js";

export const dashboardMetrics = {
  totalBookings: 1248,
  bookingsDelta: "+12% this month",
  revenue: 48720,
  revenueDelta: "+8.1% vs last month",
  activeUsers: 842,
  usersDelta: "+3.2%",
  topDestination: "Paris",
};

export const bookingsChartData = [
  { label: "Mon", bookings: 38, revenue: 4200 },
  { label: "Tue", bookings: 52, revenue: 5100 },
  { label: "Wed", bookings: 45, revenue: 4800 },
  { label: "Thu", bookings: 61, revenue: 6200 },
  { label: "Fri", bookings: 78, revenue: 8100 },
  { label: "Sat", bookings: 94, revenue: 9800 },
  { label: "Sun", bookings: 82, revenue: 8700 },
];

export const aiInsights = [
  "Rome searches increased by 21% this week — consider a seasonal feature on the homepage.",
  "Users are spending more on luxury experiences this month (+14% average basket).",
];

export const recentBookings = [
  { id: "BK-92841", user: "Emma Johnson", destination: "Paris", amount: 3557, status: "paid" },
  { id: "BK-92838", user: "Arber Krasniqi", destination: "Tokyo", amount: 2890, status: "pending" },
  { id: "BK-92835", user: "Era Bytyqi", destination: "Rome", amount: 1920, status: "paid" },
  { id: "BK-92831", user: "Gent Dervishi", destination: "Sydney", amount: 4210, status: "cancelled" },
  { id: "BK-92828", user: "Diona Gashi", destination: "Paris", amount: 1680, status: "paid" },
];

export const bookingStatusLabels = {
  paid: "Paid",
  pending: "Pending",
  cancelled: "Cancelled",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
  confirmed: "Paid",
};

export const bookingStatusColors = {
  paid: "success",
  confirmed: "success",
  pending: "warning",
  cancelled: "error",
  refunded: "info",
  partially_refunded: "info",
};

const tripNames = {
  paris: "Paris Escape",
  tokyo: "Tokyo City Break",
  rome: "Roman Holiday",
  sydney: "Sydney Premium",
  barcelona: "Barcelona Nights",
  dubai: "Dubai Luxe",
};

const tripStyles = ["Romantic", "Luxury", "Adventure", "Family", "City break", "Beach"];
const tripStatuses = ["active", "draft", "archived"];

export const adminTrips = FALLBACK_DESTINATIONS.slice(0, 8).map((d, i) => ({
  id: d.id,
  title: tripNames[d.id] ?? `${d.title} Journey`,
  subtitle: tripStyles[i % tripStyles.length] + " Getaway",
  country: d.country,
  days: 3 + (i % 4),
  priceFrom: d.priceFrom,
  bookings: 124 - i * 11,
  image: d.image,
  gallery: d.gallery ?? [d.image],
  description: d.description,
  aiSummary: d.description,
  style: tripStyles[i % tripStyles.length].toLowerCase(),
  status: tripStatuses[i % 3],
  budgetMin: d.priceFrom - 200,
  budgetMax: d.priceFrom + 800,
  activities: (d.activities ?? []).slice(0, 4).map((a) => ({ ...a })),
  itinerary: [
    { day: 1, title: "Arrival & check-in", items: ["Airport transfer", "Welcome dinner"] },
    { day: 2, title: "Highlights", items: [(d.activities ?? [])[0]?.name ?? "City tour", "Local cuisine"] },
    { day: 3, title: "Free exploration", items: ["Neighborhood walk", "Evening leisure"] },
    { day: 4, title: "Departure", items: ["Late checkout", "Airport transfer"] },
  ].slice(0, 3 + (i % 2)),
  pricing: (() => {
    const hotel = Math.round(d.priceFrom * 0.45);
    const flights = Math.round(d.priceFrom * 0.35);
    const activities = Math.round(d.priceFrom * 0.12);
    const taxes = Math.round(d.priceFrom * 0.08);
    return { hotel, flights, activities, taxes, total: hotel + flights + activities + taxes };
  })(),
  services: {
    breakfast: true,
    airportTransfer: i % 2 === 0,
    guidedTours: true,
  },
  featured: i < 3,
}));

export const adminBookings = [
  {
    id: "BK-92841",
    user: "Emma Johnson",
    email: "emma@example.com",
    destination: "Paris",
    travelDates: "12 Jun – 16 Jun 2026",
    travelers: 2,
    amount: 3557,
    status: "pending",
    paymentMethod: "card",
    invoice: "INV-2026-0841",
    traveler: {
      fullName: "Emma Johnson",
      passport: "US9283746",
      email: "emma@example.com",
      phone: "+1 415 555 0192",
    },
    itinerarySummary: "4 nights · CDG direct · Boutique hotel · 6 activities",
  },
  {
    id: "BK-92838",
    user: "Arber Krasniqi",
    email: "arber@example.com",
    destination: "Tokyo",
    travelDates: "3 Jul – 8 Jul 2026",
    travelers: 2,
    amount: 2890,
    status: "paid",
    paymentMethod: "paypal",
    invoice: "INV-2026-0838",
    traveler: {
      fullName: "Arber Krasniqi",
      passport: "AL8829103",
      email: "arber@example.com",
      phone: "+355 69 882 110",
    },
    itinerarySummary: "5 nights · NRT · Design hotel · 8 activities",
  },
  {
    id: "BK-92835",
    user: "Era Bytyqi",
    email: "era@example.com",
    destination: "Rome",
    travelDates: "20 May – 23 May 2026",
    travelers: 1,
    amount: 1920,
    status: "paid",
    paymentMethod: "apple",
    invoice: "INV-2026-0835",
    traveler: {
      fullName: "Era Bytyqi",
      passport: "XK7712345",
      email: "era@example.com",
      phone: "+383 45 771 234",
    },
    itinerarySummary: "3 nights · FCO · Historic center · 5 activities",
  },
  {
    id: "BK-92831",
    user: "Gent Dervishi",
    email: "gent@example.com",
    destination: "Sydney",
    travelDates: "1 Aug – 7 Aug 2026",
    travelers: 3,
    amount: 4210,
    status: "cancelled",
    paymentMethod: "card",
    invoice: "INV-2026-0831",
    traveler: {
      fullName: "Gent Dervishi",
      passport: "MK9928174",
      email: "gent@example.com",
      phone: "+389 70 992 817",
    },
    itinerarySummary: "6 nights · SYD · Harbor view · 7 activities",
  },
  {
    id: "BK-92828",
    user: "Diona Gashi",
    email: "diona@example.com",
    destination: "Paris",
    travelDates: "5 Apr – 8 Apr 2026",
    travelers: 2,
    amount: 1680,
    status: "refunded",
    paymentMethod: "card",
    invoice: "INV-2026-0828",
    traveler: {
      fullName: "Diona Gashi",
      passport: "XK6619283",
      email: "diona@example.com",
      phone: "+383 44 661 928",
    },
    itinerarySummary: "3 nights · Orly · Central stay · 4 activities",
  },
  {
    id: "BK-92822",
    user: "Luan Hoxha",
    email: "luan@example.com",
    destination: "Barcelona",
    travelDates: "14 Sep – 18 Sep 2026",
    travelers: 2,
    amount: 2140,
    status: "pending",
    paymentMethod: "paypal",
    invoice: "INV-2026-0822",
    traveler: {
      fullName: "Luan Hoxha",
      passport: "AL4410298",
      email: "luan@example.com",
      phone: "+355 68 441 029",
    },
    itinerarySummary: "4 nights · BCN · Gothic quarter · 5 activities",
  },
];

export const adminUsers = [
  {
    id: "u1",
    name: "Emma Johnson",
    email: "emma@example.com",
    persona: "Luxury Traveler",
    trips: 4,
    bookings: 2,
    totalSpent: 5237,
    lastActive: "2 hours ago",
    favoriteDestination: "Paris",
    averageBudget: 2800,
    preferences: ["luxury", "museums", "fine dining"],
    savedTrips: ["Paris Escape", "Tokyo City Break"],
    bookingHistory: [
      { id: "BK-92841", destination: "Paris", amount: 3557, status: "pending", dates: "Jun 2026" },
      { id: "BK-91802", destination: "Rome", amount: 1680, status: "paid", dates: "Mar 2026" },
    ],
  },
  {
    id: "u2",
    name: "Arber Krasniqi",
    email: "arber@example.com",
    persona: "Adventure Explorer",
    trips: 6,
    bookings: 3,
    totalSpent: 8420,
    lastActive: "Yesterday",
    favoriteDestination: "Tokyo",
    averageBudget: 3200,
    preferences: ["adventure", "nightlife", "street food"],
    savedTrips: ["Tokyo City Break"],
    bookingHistory: [
      { id: "BK-92838", destination: "Tokyo", amount: 2890, status: "paid", dates: "Jul 2026" },
      { id: "BK-90112", destination: "Sydney", amount: 5530, status: "paid", dates: "Jan 2026" },
    ],
  },
  {
    id: "u3",
    name: "Era Bytyqi",
    email: "era@example.com",
    persona: "Culture Enthusiast",
    trips: 2,
    bookings: 1,
    totalSpent: 1920,
    lastActive: "3 days ago",
    favoriteDestination: "Rome",
    averageBudget: 1900,
    preferences: ["museums", "history", "wine"],
    savedTrips: ["Roman Holiday"],
    bookingHistory: [{ id: "BK-92835", destination: "Rome", amount: 1920, status: "paid", dates: "May 2026" }],
  },
  {
    id: "u4",
    name: "Gent Dervishi",
    email: "gent@example.com",
    persona: "Family Planner",
    trips: 3,
    bookings: 2,
    totalSpent: 6100,
    lastActive: "1 week ago",
    favoriteDestination: "Sydney",
    averageBudget: 3500,
    preferences: ["beach", "family", "relaxed pace"],
    savedTrips: [],
    bookingHistory: [
      { id: "BK-92831", destination: "Sydney", amount: 4210, status: "cancelled", dates: "Aug 2026" },
      { id: "BK-89001", destination: "Dubai", amount: 1890, status: "paid", dates: "Dec 2025" },
    ],
  },
];

export const contentBlocks = {
  heroTitle: "Plan luxury trips with AI precision",
  heroSubtitle: "Curated destinations, real-time pricing, and itineraries that adapt to you.",
  featuredCities: ["Paris", "Tokyo", "Sydney"],
  heroImage:
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80",
};

export const contentDestinations = FALLBACK_DESTINATIONS.slice(0, 8).map((d) => ({
  id: d.id,
  title: d.title,
  country: d.country,
  image: d.image,
  gallery: d.gallery ?? [d.image],
  aiDescription: d.description,
  highlights: (d.activities ?? []).slice(0, 3).map((a) => a.name),
  aiTips: `Best time to visit ${d.title}: ${d.bestSeason ?? "year-round"}. Book flights 6–8 weeks ahead for best fares.`,
  featured: contentBlocks.featuredCities.some((c) => c.toLowerCase() === d.title.toLowerCase()),
}));

export const featuredContent = {
  trending: ["Tokyo", "Paris", "Barcelona"],
  seasonal: ["Rome in spring", "Sydney summer escapes"],
  banners: [
    { id: "b1", title: "Summer in Europe", subtitle: "Up to 15% off curated city breaks", active: true },
    { id: "b2", title: "Asia discovery", subtitle: "AI-matched itineraries from €890", active: true },
  ],
};

export const settingsSections = {
  general: {
    appName: "Smart Travel Assistant",
    logo: "/favicon.svg",
    tagline: "Luxury Planning Platform",
    primaryColor: "#d4af6a",
  },
  payments: {
    stripeEnabled: true,
    paypalEnabled: true,
    currencies: ["EUR", "USD", "GBP"],
  },
  notifications: {
    emailNotifications: true,
    bookingReminders: true,
    adminAlerts: true,
  },
  admins: [
    { name: "Administrator", email: "admin@smarttravel.app", role: "Super admin" },
    { name: "Content Manager", email: "content@smarttravel.app", role: "Editor" },
  ],
};
