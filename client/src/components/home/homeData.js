import { getCatalogDestinations, getPopularDestinations } from "../../data/destinations.js";

export const trustStats = [
  {
    id: "trips",
    label: "Trips Planned",
    icon: "trips",
    animate: { end: 10, suffix: "K+" },
  },
  {
    id: "destinations",
    label: "Destinations",
    icon: "destinations",
    animate: { end: 120, suffix: "+" },
  },
  {
    id: "ai",
    label: "Powered Recommendations",
    icon: "ai",
    staticValue: "AI",
  },
  {
    id: "support",
    label: "Support",
    icon: "support",
    staticValue: "24/7",
  },
];

export const featuredDestinationIds = ["paris", "tokyo", "barcelona"];

export function getFeaturedDestinations() {
  const destinations = getCatalogDestinations();
  return featuredDestinationIds
    .map((id) => destinations.find((d) => d.id === id))
    .filter(Boolean);
}

export function tripDurationLabel(dest) {
  const dayMatches = dest.aiItineraryTeaser?.match(/Day \d/g);
  const count = dayMatches?.length ?? 0;
  if (count >= 2) return `${count} days`;
  return "5–7 days";
}

export function getQuickSuggestions() {
  return getPopularDestinations(8).map((d, index) => ({
  id: d.id,
  name: d.title,
  country: d.country,
  image: d.image,
  priceFrom: d.priceFrom,
  rating: d.rating,
  duration: tripDurationLabel(d),
  trending: index < 2 || (d.rating ?? 0) >= 4.85,
  popular: (d.reviewCount ?? 0) > 2500,
  }));
}

export const howItWorksSteps = [
  {
    title: "Search destination",
    text: "Tell us where and when you want to travel.",
    iconKey: "search",
  },
  {
    title: "Get AI itinerary",
    text: "Receive a smart day-by-day plan instantly.",
    iconKey: "ai",
  },
  {
    title: "Book & enjoy",
    text: "Save your trip and continue to booking.",
    iconKey: "book",
  },
];

export const testimonials = [
  {
    name: "Sofia Laurent",
    role: "Frequent traveler · Paris",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
    rating: 5,
    text: "The AI itinerary saved me hours. Every restaurant and museum slot felt hand-picked.",
  },
  {
    name: "Marcus Chen",
    role: "Business travel · Tokyo",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
    rating: 5,
    text: "Booked flights and hotel in one flow. Support answered in under two minutes when I had a delay.",
  },
  {
    name: "Elena Rossi",
    role: "Family trip · Rome",
    photo:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80",
    rating: 5,
    text: "Finally a travel tool that feels premium — clear pricing, beautiful UI, zero guesswork.",
  },
];
