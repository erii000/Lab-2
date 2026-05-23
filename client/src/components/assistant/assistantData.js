import { promptChips } from "./assistantTheme.js";

/** @deprecated Use promptChips from assistantTheme.js */
export const suggestionChips = promptChips.map(({ label, query }) => ({ label, query }));

const defaultPlan = {
  title: "5-Day Italy Trip",
  stops: ["Rome", "Florence", "Venice"],
  summary: "Culture, food, and easy train connections between cities.",
  budgetTotal: 1150,
  budgetLines: [
    { label: "Flights", amount: 220 },
    { label: "Hotels", amount: 520 },
    { label: "Activities & food", amount: 410 },
  ],
  days: [
    {
      id: "d1",
      title: "Day 1 — Rome arrival",
      summary: "Check-in, historic center walk, evening trattoria.",
      details: {
        hotel: "Hotel Artemide — 4★ near Termini",
        activities: "Colosseum exterior walk · Trevi Fountain",
        map: "Historic center loop · 2.4 km",
        restaurants: "Trattoria Da Enzo · casual Roman classics",
      },
    },
    {
      id: "d2",
      title: "Day 2 — Rome highlights",
      summary: "Vatican morning, Trastevere dinner.",
      details: {
        hotel: "Hotel Artemide",
        activities: "Vatican Museums · St. Peter's · Castel Sant'Angelo",
        map: "Vatican to river path · 3.1 km",
        restaurants: "Seu Illuminati · wood-fired pizza",
      },
    },
    {
      id: "d3",
      title: "Day 3 — Florence",
      summary: "High-speed train, Duomo area, sunset viewpoint.",
      details: {
        hotel: "Hotel L'Orologio — boutique near Duomo",
        activities: "Duomo square · Uffizi (pre-booked) · Ponte Vecchio",
        map: "Duomo to Piazzale Michelangelo · 2.8 km",
        restaurants: "All'Antico Vinaio · famous sandwiches",
      },
    },
    {
      id: "d4",
      title: "Day 4 — Florence & travel",
      summary: "Morning market, afternoon train to Venice.",
      details: {
        hotel: "Palazzo Veneziano — canal-side 4★",
        activities: "Mercato Centrale · Santa Maria Novella",
        map: "Station transfer · 1.2 km",
        restaurants: "Osteria Santo Spirito",
      },
    },
    {
      id: "d5",
      title: "Day 5 — Venice",
      summary: "Canals, St. Mark's, relaxed evening.",
      details: {
        hotel: "Palazzo Veneziano",
        activities: "St. Mark's Basilica · Rialto · gondola district walk",
        map: "San Marco loop · 2.2 km",
        restaurants: "Antiche Carampane · seafood",
      },
    },
  ],
};

const parisPlan = {
  title: "Weekend in Paris",
  stops: ["Le Marais", "Louvre", "Montmartre"],
  summary: "Short city break with museums, cafés, and Seine walks.",
  budgetTotal: 680,
  budgetLines: [
    { label: "Flights", amount: 140 },
    { label: "Hotel", amount: 280 },
    { label: "Activities & food", amount: 260 },
  ],
  days: [
    {
      id: "p1",
      title: "Day 1 — Arrival & Seine",
      summary: "Check-in, Latin Quarter, evening along the river.",
      details: {
        hotel: "Hôtel Malte — boutique 4★",
        activities: "Seine walk · Notre-Dame exterior",
        map: "Left Bank loop · 1.8 km",
        restaurants: "Le Petit Châtelet",
      },
    },
    {
      id: "p2",
      title: "Day 2 — Museums & Marais",
      summary: "Louvre morning, shopping and dinner in Le Marais.",
      details: {
        hotel: "Hôtel Malte",
        activities: "Louvre · Tuileries Garden",
        map: "Louvre to Marais · 2.5 km",
        restaurants: "Breizh Café · crêperie",
      },
    },
    {
      id: "p3",
      title: "Day 3 — Montmartre & depart",
      summary: "Sacré-Cœur, artists' square, afternoon train or flight.",
      details: {
        hotel: "Late checkout available",
        activities: "Montmartre walk · Sacré-Cœur",
        map: "Hilltop circuit · 1.6 km",
        restaurants: "La Maison Rose",
      },
    },
  ],
};

const luxuryPlan = {
  ...defaultPlan,
  title: "Luxury Italy Escape",
  budgetTotal: 3200,
  budgetLines: [
    { label: "Business flights", amount: 680 },
    { label: "5★ hotels", amount: 1680 },
    { label: "Private tours & dining", amount: 840 },
  ],
  days: defaultPlan.days.map((d) => ({
    ...d,
    details: {
      ...d.details,
      hotel: d.details.hotel.replace("4★", "5★").replace("boutique", "luxury suite"),
    },
  })),
};

const budgetPlan = {
  title: "Budget Summer Trip",
  stops: ["Lisbon", "Porto"],
  summary: "Coastal cities, hostels & guesthouses, great value food.",
  budgetTotal: 890,
  budgetLines: [
    { label: "Flights", amount: 180 },
    { label: "Stays", amount: 340 },
    { label: "Food & transit", amount: 370 },
  ],
  days: [
    {
      id: "b1",
      title: "Day 1 — Lisbon arrival",
      summary: "Alfama viewpoints and sunset miradouro.",
      details: {
        hotel: "Guesthouse Alfama — budget friendly",
        activities: "Tram 28 · São Jorge Castle",
        map: "Alfama hills · 2.0 km",
        restaurants: "Time Out Market · varied stalls",
      },
    },
    {
      id: "b2",
      title: "Day 2 — Lisbon coast",
      summary: "Belém monuments, beach time optional.",
      details: {
        hotel: "Guesthouse Alfama",
        activities: "Belém Tower · Pastéis de Belém",
        map: "Riverfront path · 3.4 km",
        restaurants: "Ponto Final · waterfront",
      },
    },
    {
      id: "b3",
      title: "Day 3 — Porto",
      summary: "Train north, riverside Ribeira evening.",
      details: {
        hotel: "Porto Central Hostel — private room",
        activities: "Ribeira walk · Dom Luís bridge",
        map: "Ribeira loop · 1.5 km",
        restaurants: "Cantinho do Avillez",
      },
    },
  ],
};

const soloPlan = {
  title: "Solo City Break",
  stops: ["Barcelona"],
  summary: "Walkable neighborhoods, tapas, and flexible pacing.",
  budgetTotal: 540,
  budgetLines: [
    { label: "Flights", amount: 110 },
    { label: "Hotel", amount: 220 },
    { label: "Food & activities", amount: 210 },
  ],
  days: [
    {
      id: "s1",
      title: "Day 1 — Gothic Quarter",
      summary: "Arrival, tapas crawl, easy solo-friendly routes.",
      details: {
        hotel: "Hotel Jazz — central 3★",
        activities: "Gothic Quarter · La Boqueria",
        map: "Old city loop · 2.1 km",
        restaurants: "Cervecería Catalana",
      },
    },
    {
      id: "s2",
      title: "Day 2 — Gaudí & coast",
      summary: "Sagrada Família and Barceloneta sunset.",
      details: {
        hotel: "Hotel Jazz",
        activities: "Sagrada Família · Park Güell exterior",
        map: "Eixample to beach · 4.0 km",
        restaurants: "Can Paixano",
      },
    },
  ],
};

export function buildTripPlan(query) {
  const lower = query.toLowerCase();
  if (lower.includes("paris") || lower.includes("weekend")) return { ...parisPlan };
  if (lower.includes("luxury")) return { ...luxuryPlan };
  if (lower.includes("budget") || lower.includes("summer")) return { ...budgetPlan };
  if (lower.includes("solo")) return { ...soloPlan };
  if (lower.includes("italy") || lower.includes("rome")) return { ...defaultPlan };
  return { ...defaultPlan, title: "Custom Trip Plan", summary: `Built from: “${query.slice(0, 80)}”` };
}
