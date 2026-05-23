import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminTrips as initialTrips } from "../data/adminData.js";
import { appendAudit, createEmptyTrip, enrichTrip } from "../utils/adminTrips.js";
import { adminNotify } from "../utils/adminNotify.js";

function mapInitial() {
  const statuses = ["active", "published", "draft", "pending_review", "fully_booked", "archived", "active", "published"];
  return initialTrips.map((t, i) =>
    enrichTrip({
      ...t,
      status: statuses[i % statuses.length],
      destination: t.title?.replace(/ Escape| City Break| Holiday| Premium| Nights| Luxe/gi, "") ?? t.country,
    }),
  );
}

export const useAdminTripsStore = create(
  persist(
    (set, get) => ({
      trips: mapInitial(),

      getTripById: (id) => get().trips.find((t) => t.id === id && !t.deletedAt),

      getTripByIdIncludingDeleted: (id) => get().trips.find((t) => t.id === id),

      addTrip: (trip) => {
        const next = enrichTrip({
          ...createEmptyTrip(),
          ...trip,
          createdAt: Date.now(),
          ...appendAudit({ auditLog: [] }, "Trip created", trip.status ?? "draft"),
        });
        set((s) => ({ trips: [next, ...s.trips] }));
        adminNotify({
          type: "trip",
          title: "Trip created",
          message: `${next.title} · ${next.status}`,
          link: "/admin/trips",
          entityId: next.id,
        });
        return next;
      },

      updateTrip: (trip, auditAction = "Trip updated") => {
        const next = enrichTrip({
          ...trip,
          ...appendAudit(trip, auditAction),
        });
        set((s) => ({
          trips: s.trips.map((t) => (t.id === trip.id ? next : t)),
        }));
        return next;
      },

      duplicateTrip: (id) => {
        const source = get().getTripById(id);
        if (!source) return null;
        const copy = enrichTrip({
          ...JSON.parse(JSON.stringify(source)),
          id: `trip-${Date.now().toString(36)}`,
          title: `${source.title} (Copy)`,
          status: "draft",
          bookings: 0,
          slug: `${source.slug}-copy`,
          ...appendAudit({ auditLog: [] }, "Duplicated from", source.title),
        });
        set((s) => ({ trips: [copy, ...s.trips] }));
        adminNotify({
          type: "trip",
          title: "Trip duplicated",
          message: `Copy of ${source.title}`,
          link: "/admin/trips",
          entityId: copy.id,
        });
        return copy;
      },

      setTripStatus: (id, status, detail) => {
        const trip = get().getTripByIdIncludingDeleted(id);
        if (!trip) return null;
        return get().updateTrip({ ...trip, status }, detail ?? `Status → ${status}`);
      },

      archiveTrip: (id) => {
        const trip = get().getTripById(id);
        const result = get().setTripStatus(id, "archived", "Trip archived");
        if (trip) {
          adminNotify({
            type: "trip",
            title: "Trip archived",
            message: trip.title,
            link: "/admin/trips",
            entityId: id,
          });
        }
        return result;
      },

      publishTrip: (id) => {
        const trip = get().getTripById(id);
        const result = get().setTripStatus(id, "published", "Trip published");
        if (trip) {
          adminNotify({
            type: "trip",
            title: "Trip published",
            message: `${trip.title} is now live`,
            link: "/admin/trips",
            entityId: id,
          });
        }
        return result;
      },

      unpublishTrip: (id) => get().setTripStatus(id, "draft", "Trip unpublished"),

      softDeleteTrip: (id, { silent } = {}) => {
        const trip = get().getTripById(id);
        if (!trip) return;
        const next = enrichTrip({
          ...trip,
          deletedAt: Date.now(),
          ...appendAudit(trip, "Soft deleted"),
        });
        set((s) => ({ trips: s.trips.map((t) => (t.id === id ? next : t)) }));
        if (!silent) {
          adminNotify({
            type: "trip",
            title: "Trip deleted",
            message: trip.title,
            link: "/admin/trips",
            entityId: id,
          });
        }
      },

      restoreTrip: (id) => {
        const trip = get().trips.find((t) => t.id === id);
        if (!trip) return;
        const next = enrichTrip({
          ...trip,
          deletedAt: null,
          ...appendAudit(trip, "Trip restored"),
        });
        set((s) => ({ trips: s.trips.map((t) => (t.id === id ? next : t)) }));
        adminNotify({
          type: "trip",
          title: "Trip restored",
          message: trip.title,
          link: "/admin/trips",
          entityId: id,
        });
      },

      toggleBookingsPaused: (id) => {
        const trip = get().getTripById(id);
        if (!trip) return;
        return get().updateTrip(
          { ...trip, bookingsPaused: !trip.bookingsPaused },
          trip.bookingsPaused ? "Bookings resumed" : "Bookings paused",
        );
      },

      bulkAction: (ids, action) => {
        ids.forEach((id) => {
          if (action === "publish") get().setTripStatus(id, "published", "Trip published");
          else if (action === "archive") get().setTripStatus(id, "archived", "Trip archived");
          else if (action === "delete") get().softDeleteTrip(id, { silent: true });
        });
        if (ids.length) {
          const labels = { publish: "published", archive: "archived", delete: "deleted" };
          adminNotify({
            type: "trip",
            title: `Bulk trips ${labels[action] ?? action}`,
            message: `${ids.length} trip${ids.length > 1 ? "s" : ""} updated`,
            link: "/admin/trips",
          });
        }
      },

      aiGenerateTrip: (prompt) => {
        const title = prompt.includes("Bali")
          ? "Luxury Bali Serenity"
          : prompt.includes("Paris")
            ? "Paris Prestige Escape"
            : "Curated Luxury Journey";
        const image = prompt.toLowerCase().includes("bali")
          ? "https://images.unsplash.com/photo-1537996192761-fea777304b2a?auto=format&fit=crop&w=1400&q=80"
          : prompt.toLowerCase().includes("paris")
            ? "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80"
            : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80";
        return get().addTrip({
          title,
          destination: title.split(" ")[0],
          country: "Generated",
          days: 5,
          description: `AI-generated trip based on: "${prompt}". Includes curated stays, experiences, and premium transfers.`,
          aiSummary: `Premium experience crafted for: ${prompt}`,
          style: "luxury",
          status: "draft",
          priceFrom: 1890,
          image,
          gallery: [image],
        });
      },
    }),
    { name: "sta-admin-trips-v1", partialize: (s) => ({ trips: s.trips }) },
  ),
);
