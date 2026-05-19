import { BOOKING_STATUS, calculateBookingProgress } from "./bookingConstants.js";
import { buildDestinationUrl } from "./destinationSearch.js";

function newId() {
  return `bk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createBookingFromConfigurator({
  destination,
  tripPackage,
  selections,
  liveQuote,
  departure,
  status = BOOKING_STATUS.DRAFT,
}) {
  const { flights, hotels, experiences, quote, itinerary } = tripPackage;
  const flight = flights.find((f) => f.id === selections.flightId) ?? flights[0];
  const hotel = hotels.find((h) => h.id === selections.hotelId) ?? hotels[0];
  const pickedExperiences = experiences.filter((e) => selections.experienceIds?.includes(e.id));

  const displayQuote = liveQuote ?? quote;

  const booking = {
    id: newId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status,
    destinationId: destination.id,
    destinationTitle: destination.title,
    destinationImage: destination.image,
    packageTitle: departure.packageTitle ?? `${destination.title} trip`,
    start: departure.start,
    end: departure.end,
    startLabel: departure.label,
    endLabel: departure.endLabel,
    guests: displayQuote.guests,
    total: displayQuote.total,
    lineItems: displayQuote.lineItems ?? [],
    selections: {
      flightId: flight?.id,
      hotelId: hotel?.id,
      experienceIds: selections.experienceIds ?? [],
    },
    flight: flight ? { ...flight } : null,
    hotel: hotel ? { ...hotel } : null,
    experiences: pickedExperiences.map((e) => ({ ...e })),
    traveler: {
      fullName: "",
      passport: "",
      nationality: "",
      email: "",
      phone: "",
    },
    itinerary: itinerary ?? [],
    bookingReference: null,
  };

  booking.progress = calculateBookingProgress(booking);
  return booking;
}

export function formatBookingDates(booking) {
  if (booking.startLabel && booking.endLabel) {
    return `${booking.startLabel} → ${booking.endLabel}`;
  }
  return `${booking.start} → ${booking.end}`;
}

/** Opens the destination configurator with this draft restored. */
export function buildResumeDestinationUrl(booking) {
  return buildDestinationUrl(booking.destinationId, {
    start: booking.start,
    end: booking.end,
    guests: booking.guests,
    resume: booking.id,
  });
}
