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
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import AppModal from "../components/common/AppModal.jsx";
import SectionHeading from "../components/common/SectionHeading.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  buildDestinationUrl,
  calculateTripQuote,
  getDestinationDetail,
  parseTripSearchParams,
} from "../utils/destinationSearch.js";

const tabItems = [
  { label: "Flights", icon: <FlightRounded fontSize="small" /> },
  { label: "Hotels", icon: <HotelRounded fontSize="small" /> },
  { label: "Activities", icon: <LocalActivityRounded fontSize="small" /> },
];

export default function BookingPage() {
  const [params] = useSearchParams();
  const { showToast } = useToast();
  const destinationId = params.get("destination");
  const dest = destinationId ? getDestinationDetail(destinationId) : null;
  const trip = parseTripSearchParams(params);
  const selectedActivityIds = trip.activities;

  const quote = useMemo(
    () =>
      dest
        ? calculateTripQuote(dest, {
            start: trip.start,
            end: trip.end,
            guests: trip.guests,
            budget: trip.budget,
            hotelTierId: trip.hotel,
            selectedActivityIds,
          })
        : null,
    [dest, trip, selectedActivityIds],
  );

  const [tab, setTab] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(0);
  const [selectedHotel, setSelectedHotel] = useState(0);

  const flights = useMemo(() => {
    if (!dest) return [];
    return [0, 1, 2].map((i) => ({
      id: `flight-${i}`,
      title: `${dest.airportCode} · ${i === 0 ? "Direct" : i === 1 ? "1 stop" : "Premium"} round-trip`,
      meta: i === 0 ? "Morning departure · 23kg checked bag" : "Flexible fare · lounge access",
      price: dest.flightEstimate + i * 65,
    }));
  }, [dest]);

  const hotels = useMemo(() => dest?.hotelTiers ?? [], [dest]);
  const activities = useMemo(
    () => dest?.activities?.filter((a) => selectedActivityIds.includes(a.id)) ?? [],
    [dest, selectedActivityIds],
  );

  const fees = quote ? quote.total - quote.subtotal : 0;

  function handlePayment() {
    setCheckoutOpen(false);
    showToast({
      message: dest
        ? `Booking confirmed for ${dest.title}! Confirmation sent to your email.`
        : "Payment successful — confirmation email sent.",
      severity: "success",
    });
  }

  if (!dest) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <SectionHeading title="Booking" subtitle="Select a destination from search or a city page to continue." />
        <Alert severity="info" sx={{ mt: 2 }}>
          No trip selected. Start from the{" "}
          <Button component={RouterLink} to="/" size="small">
            homepage
          </Button>{" "}
          or{" "}
          <Button component={RouterLink} to="/search" size="small">
            explore
          </Button>{" "}
          page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <SectionHeading
        eyebrow="Checkout"
        title={`Book ${dest.title}`}
        subtitle={`${trip.start} → ${trip.end} · ${trip.guests} traveler${trip.guests > 1 ? "s" : ""} · ${quote?.nights} nights`}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
            <CardMedia component="img" image={dest.image} height="200" alt={dest.title} />
            <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.72))" }} />
            <Stack spacing={0.5} sx={{ position: "absolute", left: 14, bottom: 12 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CameraAltRounded sx={{ color: "common.white" }} />
                <Typography sx={{ color: "common.white", fontWeight: 700 }}>
                  {dest.title}, {dest.country}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: alpha("#fff", 0.88) }}>
                {dest.airportCode} · {dest.hotelTiers?.find((h) => h.id === trip.hotel)?.label ?? "Hotel included"}
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
              <Chip icon={<LocalActivityRounded />} label="Verified local partners" variant="outlined" />
            </Stack>
            <Button
              component={RouterLink}
              to={buildDestinationUrl(dest.id, {
                start: trip.start,
                end: trip.end,
                guests: trip.guests,
                budget: trip.budget,
                hotel: trip.hotel,
                activities: selectedActivityIds.join(","),
              })}
              size="small"
              sx={{ mt: 2 }}
            >
              Edit trip on city page
            </Button>
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
                  key={item.id}
                  variant="outlined"
                  sx={{
                    borderColor: selectedFlight === i ? "primary.main" : "divider",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedFlight(i)}
                >
                  <CardContent>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                      <Box>
                        <Typography fontWeight={700}>{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.meta} · ★ 4.{8 - i}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={800}>
                        €{(item.price * trip.guests).toLocaleString()}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            {tab === 1 &&
              hotels.map((tier, i) => (
                <Card
                  key={tier.id}
                  variant="outlined"
                  sx={{
                    borderColor: selectedHotel === i ? "primary.main" : "divider",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedHotel(i)}
                >
                  <CardContent>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                      <Box>
                        <Typography fontWeight={700}>{tier.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Breakfast included · Free Wi‑Fi · {quote?.nights} nights in {dest.title}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={800}>
                        €{(tier.nightly * (quote?.nights ?? 3)).toLocaleString()}
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
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                        <Box>
                          <Typography fontWeight={700}>{act.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {act.duration} · {act.category} · ★ {act.rating}
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight={800}>
                          €{(act.price * trip.guests).toLocaleString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Alert severity="info">
                  No experiences selected.{" "}
                  <Button
                    component={RouterLink}
                    to={buildDestinationUrl(dest.id, {
                      start: trip.start,
                      end: trip.end,
                      guests: trip.guests,
                    })}
                    size="small"
                  >
                    Add on city page
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
              {dest.title} · {trip.guests} guest{trip.guests > 1 ? "s" : ""}
            </Typography>
            <Divider sx={{ my: 2 }} />
            {quote?.lineItems.map((item) => (
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
                €{quote?.total.toLocaleString()}
              </Typography>
            </Stack>
            <Button fullWidth variant="contained" color="secondary" sx={{ mt: 3 }} onClick={() => setCheckoutOpen(true)}>
              Proceed to payment
            </Button>
            <Button component={RouterLink} to={`/destination/${dest.id}`} fullWidth sx={{ mt: 1 }}>
              Back to {dest.title}
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
            <Button variant="contained" color="secondary" onClick={handlePayment}>
              Pay €{quote?.total.toLocaleString()}
            </Button>
          </>
        }
      >
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            You are booking <strong>{flights[selectedFlight]?.title}</strong> with{" "}
            <strong>{hotels[selectedHotel]?.label ?? quote?.hotelTier}</strong> for {trip.start} – {trip.end}.
          </Typography>
          <Stack spacing={0.8}>
            <Typography variant="body2" color="text.secondary">
              Travelers: {trip.guests}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Experiences: {activities.length} selected
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Payment: Visa / Mastercard · 3D Secure
            </Typography>
          </Stack>
          <Divider />
          <Stack spacing={0.6}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                €{quote?.subtotal.toLocaleString()}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Fees & taxes
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                €{fees.toLocaleString()}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Total</Typography>
              <Typography variant="subtitle1" fontWeight={800}>
                €{quote?.total.toLocaleString()}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </AppModal>
    </Container>
  );
}
