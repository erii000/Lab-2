/** VoyageAI assistant landing theme */
export const assistantTheme = {
  brandName: "VoyageAI",
  bg: {
    base: "#050816",
    mid: "#0B1220",
    deep: "#101827",
  },
  gradient: {
    hero: "linear-gradient(165deg, #050816 0%, #0B1220 45%, #101827 100%)",
    cta: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)",
    ctaHover: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #818cf8 100%)",
    borderFocus: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9), rgba(79,70,229,0.9))",
    aurora1: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(79, 70, 229, 0.35) 0%, transparent 55%)",
    aurora2: "radial-gradient(ellipse 70% 50% at 85% 20%, rgba(124, 58, 237, 0.28) 0%, transparent 50%)",
    aurora3: "radial-gradient(ellipse 60% 40% at 50% 90%, rgba(59, 130, 246, 0.18) 0%, transparent 55%)",
  },
};

export const rotatingPlaceholders = [
  "3 days in Tokyo under $1200 with nightlife and sushi spots",
  "Romantic weekend in Italy with wine tastings",
  "7 days in Bali under $2000 with beach clubs",
  "Solo trip to Japan — temples, ramen, and rail passes",
  "Luxury Maldives escape for two under $5000",
  "Europe backpacking under $1500 for 10 days",
];

export const promptChips = [
  { label: "Weekend in Paris", query: "Weekend in Paris for two with museums and cafés", icon: "✈️" },
  { label: "Luxury in Maldives", query: "Luxury vacation in Maldives overwater villa", icon: "🏝️" },
  { label: "Solo Backpacking Asia", query: "Solo backpacking Asia 2 weeks budget", icon: "🎒" },
  { label: "Europe Under $1500", query: "Europe summer trip under €1500 for 10 days", icon: "💸" },
];

export const trustStats = [
  { value: "12K+", label: "Trips planned" },
  { value: "89", label: "Countries" },
  { value: "30 sec", label: "Avg planning time" },
];

export const partnerLogos = ["Booking.com", "Airbnb", "Skyscanner", "Google Maps"];

export const loadingSteps = [
  "Finding flights",
  "Matching hotels",
  "Building itinerary",
  "Optimizing budget",
];

export const howItWorksSteps = [
  {
    step: "01",
    title: "Describe your trip",
    body: "Tell us where, when, budget, and vibe — in plain language.",
  },
  {
    step: "02",
    title: "AI builds your plan",
    body: "Flights, stays, activities, and day-by-day routes in seconds.",
  },
  {
    step: "03",
    title: "Book with confidence",
    body: "Refine, save, and continue to secure checkout when ready.",
  },
];

export const aiFeatures = [
  { title: "Smart budgeting", body: "AI balances flights, hotels, and experiences to your cap." },
  { title: "Context-aware routes", body: "Day plans with maps, dining, and realistic pacing." },
  { title: "Instant regeneration", body: "Tweak one prompt — get a fresh itinerary immediately." },
];

export const trendingDestinations = [
  { id: "tokyo", name: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80" },
  { id: "paris", name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80" },
  { id: "rome", name: "Rome", country: "Italy", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80" },
  { id: "barcelona", name: "Barcelona", country: "Spain", image: "https://images.unsplash.com/photo-1583422409516-2895a09efeb4?w=600&q=80" },
];
