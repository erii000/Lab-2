import { CameraAltRounded, FlightRounded, HotelRounded, LocalActivityRounded, VerifiedRounded } from "../ui/icons.jsx";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import AppModal from "../components/common/AppModal.jsx";
import SectionHeading from "../components/common/SectionHeading.jsx";
import { useBookingStore } from "../store/bookingStore.js";
import { usePlannerStore } from "../store/plannerStore.js";
import { getDestinationDetail } from "../utils/destinationSearch.js";
import { buildItineraryPlannerUrl } from "../utils/itineraryPlanner.js";

const tabItems = [
  { label: "Flights", icon: <FlightRounded fontSize="small" /> },
  { label: "Hotels", icon: <HotelRounded fontSize="small" /> },
  { label: "Activities", icon: <LocalActivityRounded fontSize="small" /> },
];

export default function BookingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const destinationId = params.get("destination");
  const bookingIdParam = params.get("bookingId");
  const dest = destinationId ? getDestinationDetail(destinationId) : null;

  const plannerTrip = usePlannerStore((s) => s.trip);
  const linkedBookingId = usePlannerStore((s) => s.linkedBookingId);

  const getBookingById = useBookingStore((s) => s.getBookingById);
  const currentBookingId = useBookingStore((s) => s.currentBookingId);
  const continueBookingFromPlanner = useBookingStore((s) => s.continueBookingFromPlanner);
  const setCurrentBooking = useBookingStore((s) => s.setCurrentBooking);

  const bookingId = bookingIdParam || linkedBookingId || currentBookingId;
  const [booking, setBooking] = useState(() =>
    bookingId ? getBookingById(bookingId) : null,
  );

  useEffect(() => {
    if (!dest) return;

    const existingId = bookingIdParam || linkedBookingId || currentBookingId;
    const existing = existingId ? getBookingById(existingId) : null;

    if (plannerTrip?.destination?.id === dest.id) {
      const synced = continueBookingFromPlanner(plannerTrip, existing?.id);
      setBooking(synced);
      setCurrentBooking(synced.id);
      return;
    }

    if (existing) {
      setBooking(existing);
      setCurrentBooking(existing.id);
    }
  }, [
    dest,
    plannerTrip,
    bookingIdParam,
    linkedBookingId,
    currentBookingId,
    getBookingById,
    continueBookingFromPlanner,
    setCurrentBooking,
  ]);

  const [tab, setTab] = useState(2);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(0);
  const [selectedHotel, setSelectedHotel] = useState(0);

  const flights = useMemo(() => {
    if (!dest || !booking) return [];
    if (booking.flight) {
      return [
        booking.flight,
        {
          id: "alt-flight",
          title: `${dest.airportCode} · Alternative fare`,
          meta: "Flexible ticket",
          price: Math.round(booking.flight.priceTotal * 0.92),
          priceTotal: Math.round(booking.flight.priceTotal * 0.92),
        },
      ];
    }
    return [0, 1].map((i) => ({
      id: `flight-${i}`,
      title: `${dest.airportCode} · ${i === 0 ? "Direct" : "1 stop"} round-trip`,
      meta: "Round-trip estimate",
      price: dest.flightEstimate + i * 65,
      priceTotal: (dest.flightEstimate + i * 65) * (booking.guests ?? 2),
    }));
  }, [dest, booking]);

  const hotels = useMemo(() => {
    if (!dest) return [];
    if (booking?.hotel) {
      return [
        booking.hotel,
        ...(dest.hotelTiers ?? []).map((tier) => ({
          id: tier.id,
          name: tier.label,
          total: tier.nightly * (booking.lineItems?.find((l) => l.label.includes("night")) ? 3 : 3),
          nightly: tier.nightly,
        })),
      ];
    }
    return dest.hotelTiers ?? [];
  }, [dest, booking]);

  const activities = useMemo(() => booking?.experiences ?? [], [booking]);

  const lineItems = booking?.lineItems ?? [];
  const total = booking?.total ?? 0;
  function handleContinueToTraveler() {
    if (!booking) return;
    setCheckoutOpen(false);
    setCurrentBooking(booking.id);
    navigate(`/bookings/${booking.id}/traveler`);
  }

  if (!dest) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <SectionHeading title="Booking" subtitle="Select a destination from explore or your itinerary to continue." />
        <Alert severity="info" sx={{ mt: 2 }}>
          No trip selected. Start from the{" "}
          <Button component={RouterLink} to="/" size="small">
            homepage
          </Button>{" "}
          or{" "}
          <Button component={RouterLink} to="/explore" size="small">
            explore
          </Button>{" "}
          page.
        </Alert>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Alert severity="warning">
          No booking draft found.{" "}
          <Button
            component={RouterLink}
            to={buildItineraryPlannerUrl(dest.id)}
            size="small"
          >
            Build your itinerary first
          </Button>
        </Alert>
      </Container>
    );
  }

  const fromPlanner = booking.source === "itinerary-planner";
  const fromConfigurator = booking.source === "configurator";

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <SectionHeading
        eyebrow="Checkout"
        title={`Book ${dest.title}`}
        subtitle={`${booking.start} → ${booking.end} · ${booking.guests} traveler${booking.guests > 1 ? "s" : ""}`}
      />

      {fromPlanner ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Priced from your itinerary — {activities.length} activit{activities.length === 1 ? "y" : "ies"} · total €
          {total.toLocaleString()}.{" "}
          <Button
            component={RouterLink}
            to={buildItineraryPlannerUrl(dest.id, {
              start: booking.start,
              end: booking.end,
              travelers: booking.guests,
            })}
            size="small"
          >
            Edit itinerary
          </Button>
        </Alert>
      ) : null}
      {fromConfigurator ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Trip configured on {dest.title} — review selections below, then proceed to traveler details and payment.{" "}
          <Button component={RouterLink} to={`/destination/${dest.id}`} size="small">
            Edit trip package
          </Button>
        </Alert>
      ) : null}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
            <CardMedia component="img" image={dest.image} height="160" alt={dest.title} />
            <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.72))" }} />
            <Stack spacing={0.5} sx={{ position: "absolute", left: 14, bottom: 12 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CameraAltRounded sx={{ color: "common.white" }} />
                <Typography sx={{ color: "common.white", fontWeight: 700 }}>
                  {dest.title}, {dest.country}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: alpha("#fff", 0.88) }}>
                {booking.packageTitle}
              </Typography>
            </Stack>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2.2, height: "100%" }}>
            <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700 }}>
              Trip protection included
            </Typography>
            <Stack spacing={1.1}>
              <Chip icon={<VerifiedRounded />} label="Free cancellation 24h" variant="outlined" />
              <Chip icon={<FlightRounded />} label="ATOL-style coverage" variant="outlined" />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          {tabItems.map((t, i) => (
            <Tab key={t.label} icon={t.icon} iconPosition="start" label={t.label} value={i} />
          ))}
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {tab === 0 &&
              flights.map((item, i) => (
                <Card
                  key={item.id ?? i}
                  variant="outlined"
                  sx={{ borderColor: selectedFlight === i ? "primary.main" : "divider", cursor: "pointer" }}
                  onClick={() => setSelectedFlight(i)}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography fontWeight={700}>{item.title ?? item.airline}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.meta ?? item.baggage}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={800}>
                        €{(item.priceTotal ?? item.price ?? 0).toLocaleString()}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            {tab === 1 &&
              hotels.map((tier, i) => (
                <Card
                  key={tier.id ?? i}
                  variant="outlined"
                  sx={{ borderColor: selectedHotel === i ? "primary.main" : "divider", cursor: "pointer" }}
                  onClick={() => setSelectedHotel(i)}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography fontWeight={700}>{tier.name ?? tier.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tier.meta ?? "Breakfast included · Free Wi‑Fi"}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={800}>
                        €{(tier.total ?? tier.nightly * 3).toLocaleString()}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            {tab === 2 &&
              (activities.length ? (
                activities.map((act) => (
                  <Card key={act.id} variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Box>
                          <Typography fontWeight={700}>{act.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {act.dayLabel ? `Day ${act.day} · ` : ""}
                            {act.duration}
                            {act.description ? ` · ${act.description}` : ""}
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight={800}>
                          €{(act.priceTotal ?? act.price * booking.guests).toLocaleString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Alert severity="info">
                  No activities in this booking.{" "}
                  <Button
                    component={RouterLink}
                    to={buildItineraryPlannerUrl(dest.id, { start: booking.start, end: booking.end, travelers: booking.guests })}
                    size="small"
                  >
                    Add in itinerary planner
                  </Button>
                </Alert>
              ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, position: { xs: "static", md: "sticky" }, top: { md: 96 } }}>
            <Typography variant="h6" gutterBottom>
              Booking summary
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {dest.title} · {booking.guests} guest{booking.guests > 1 ? "s" : ""}
            </Typography>
            <Divider sx={{ my: 2 }} />
            {lineItems.map((item) => (
              <Stack key={item.label} direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  €{item.amount.toLocaleString()}
                </Typography>
              </Stack>
            ))}
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={700}>Total</Typography>
              <Typography variant="h5" fontWeight={800} color="primary.main">
                €{total.toLocaleString()}
              </Typography>
            </Stack>
            <Button fullWidth variant="contained" color="secondary" sx={{ mt: 3 }} onClick={() => setCheckoutOpen(true)}>
              Proceed to payment
            </Button>
            <Button
              component={RouterLink}
              to={buildItineraryPlannerUrl(dest.id, { start: booking.start, end: booking.end, travelers: booking.guests })}
              fullWidth
              sx={{ mt: 1 }}
            >
              Back to itinerary
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <AppModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Confirm your booking"
        subtitle={`Secure payment for ${dest.title}`}
        maxWidth="sm"
        actions={
          <>
            <Button onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" onClick={handleContinueToTraveler}>
              Pay €{total.toLocaleString()}
            </Button>
          </>
        }
      >
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            You are booking <strong>{flights[selectedFlight]?.title ?? flights[selectedFlight]?.airline ?? "flights"}</strong> with{" "}
            <strong>{hotels[selectedHotel]?.name ?? hotels[selectedHotel]?.label ?? "your selected hotel"}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Next: enter passport and contact details before payment.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Itinerary activities: {activities.length} · Total reflects your latest planner edits.
          </Typography>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2">Total due</Typography>
            <Typography variant="subtitle1" fontWeight={800}>
              €{total.toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      </AppModal>
    </Container>
  );
}
