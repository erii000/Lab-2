/** Mock data for design previews — replace with API integration. */

export const mockTrending = [
  {
    id: "lisbon",
    title: "Lisbon",
    country: "Portugal",
    priceFrom: 489,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?auto=format&fit=crop&w=1400&q=80",
    description: "Five-star riverfront suites, Michelin dining, and private city tours.",
    tag: "Luxury",
  },
  {
    id: "kyoto",
    title: "Kyoto",
    country: "Japan",
    priceFrom: 1120,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1400&q=80",
    description: "Exclusive ryokan experiences and curated cultural immersion.",
    tag: "Elite Culture",
  },
  {
    id: "reykjavik",
    title: "Reykjavík",
    country: "Iceland",
    priceFrom: 960,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=1400&q=80",
    description: "Premium glacier excursions with luxury lodge retreats.",
    tag: "Signature Adventure",
  },
];

export const mockSearchResults = [
  ...mockTrending,
  {
    id: "paris",
    title: "Paris",
    country: "France",
    priceFrom: 720,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1400&q=80",
    description: "Private museum access, haute cuisine, and iconic suites.",
    tag: "Prestige City",
  },
];

/** Extended fields for destination detail — merge with list item by id when wiring APIs. */
export const mockDestinationExtras = {
  lisbon: {
    gallery: [
      "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=80",
    ],
    weather: { tempC: 22, condition: "Mostly sunny", seasonTip: "Pleasant evenings — bring a light jacket." },
    thingsToDo: ["Belém & pastel de nata", "Alfama viewpoints", "Sintra day trip", "Sunset at MAAT"],
    reviews: [
      { author: "Maya", rating: 5, text: "Walkable, vibrant, incredible food scene." },
      { author: "Jon", rating: 4, text: "Hills are real — comfy shoes essential." },
    ],
    aiItineraryTeaser: "Day 1: Historic core · Day 2: Belém & riverside · Day 3: Coastal stroll + fado evening",
  },
};

export function getDestinationDetail(id) {
  const base = mockSearchResults.find((d) => d.id === id);
  if (!base) return null;
  const extra =
    mockDestinationExtras[id] ?? {
      gallery: [base.image],
      weather: { tempC: 20, condition: "Fair", seasonTip: "Check forecast before packing." },
      thingsToDo: ["Explore the old town", "Local food tour", "Nearby day excursion"],
      reviews: [{ author: "Traveler", rating: 5, text: "Reviews will sync from your backend." }],
      aiItineraryTeaser:
        "AI itinerary: connect preferences service to replace this teaser with a real schedule.",
    };
  return { ...base, ...extra };
}
