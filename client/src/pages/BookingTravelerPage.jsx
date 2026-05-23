import { VerifiedRounded } from "../ui/icons.jsx";
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import BookingProgressBar from "../components/bookings/BookingProgressBar.jsx";
import SectionHeading from "../components/common/SectionHeading.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useBookingStore } from "../store/bookingStore.js";
import { formatBookingDates } from "../utils/bookingFactory.js";
import { buildItineraryPlannerUrl } from "../utils/itineraryPlanner.js";
import { designTokens } from "../theme/theme.js";

export default function BookingTravelerPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const getBookingById = useBookingStore((s) => s.getBookingById);
  const updateTraveler = useBookingStore((s) => s.updateTraveler);
  const setPendingPayment = useBookingStore((s) => s.setPendingPayment);
  const confirmPayment = useBookingStore((s) => s.confirmPayment);
  const setCurrentBooking = useBookingStore((s) => s.setCurrentBooking);

  const booking = getBookingById(bookingId);
  const [traveler, setTraveler] = useState(booking?.traveler ?? {});

  useEffect(() => {
    if (booking?.traveler) setTraveler(booking.traveler);
    if (booking?.id) setCurrentBooking(booking.id);
  }, [booking?.id, booking?.traveler, setCurrentBooking]);

  const [paymentMethod, setPaymentMethod] = useState(booking?.paymentMethod ?? "card");

  const isValid = useMemo(() => {
    const t = traveler;
    return Boolean(
      t.fullName?.trim() &&
        t.passport?.trim() &&
        t.nationality?.trim() &&
        t.email?.trim() &&
        t.phone?.trim() &&
        paymentMethod,
    );
  }, [traveler, paymentMethod]);

  if (!booking) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5" fontWeight={800}>
          Booking not found
        </Typography>
        <Button component={RouterLink} to="/bookings" sx={{ mt: 2 }}>
          Back to bookings
        </Button>
      </Container>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) {
      showToast({ message: "Please complete all required fields.", severity: "warning" });
      return;
    }
    updateTraveler(booking.id, { ...traveler, paymentMethod });
    setPendingPayment(booking.id);
    const ref = confirmPayment(booking.id);
    showToast({ message: "Payment successful. Confirmation sent to your email.", severity: "success" });
    navigate(`/bookings/${booking.id}/success`, { state: { reference: ref } });
  }

  const hotelLabel = booking.hotel?.name ?? booking.hotel?.label ?? "Hotel included";
  const flightLabel = booking.flight?.title ?? booking.flight?.airline ?? "Flights";

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Button
        component={RouterLink}
        to={`/booking?destination=${booking.destinationId}&bookingId=${booking.id}`}
        size="small"
        sx={{ mb: 2 }}
      >
        ← Back to trip review
      </Button>

      <SectionHeading
        eyebrow="Step 2 of 3"
        title="Traveler details"
        subtitle={`Required for ${booking.destinationTitle} · ${formatBookingDates(booking)}`}
      />

      <Box sx={{ mb: 3 }}>
        <BookingProgressBar value={55} />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              border: `1px solid ${alpha(designTokens.brand.gold, 0.15)}`,
            }}
          >
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Personal information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Enter details exactly as they appear on your passport. All fields are required.
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Full name (as on passport)"
                fullWidth
                required
                value={traveler.fullName ?? ""}
                onChange={(e) => setTraveler((t) => ({ ...t, fullName: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Passport number"
                fullWidth
                required
                value={traveler.passport ?? ""}
                onChange={(e) => setTraveler((t) => ({ ...t, passport: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Nationality"
                fullWidth
                required
                value={traveler.nationality ?? ""}
                onChange={(e) => setTraveler((t) => ({ ...t, nationality: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={traveler.email ?? ""}
                onChange={(e) => setTraveler((t) => ({ ...t, email: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Phone"
                fullWidth
                required
                value={traveler.phone ?? ""}
                onChange={(e) => setTraveler((t) => ({ ...t, phone: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth required>
                <InputLabel shrink>Payment method</InputLabel>
                <Select
                  label="Payment method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  displayEmpty
                  notched
                >
                  <MenuItem value="card">Credit or debit card</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                  <MenuItem value="apple">Apple Pay</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              disabled={!isValid}
              startIcon={<VerifiedRounded />}
              sx={{ mt: 3, py: 1.35, fontWeight: 800 }}
            >
              Pay €{booking.total?.toLocaleString()}
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            sx={{
              p: 2.5,
              position: { md: "sticky" },
              top: { md: 96 },
              borderRadius: 3,
              border: `1px solid ${alpha(designTokens.brand.gold, 0.12)}`,
              bgcolor: alpha(designTokens.brand.charcoal, 0.5),
            }}
          >
            <Typography variant="subtitle1" fontWeight={800} gutterBottom>
              Trip summary
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {booking.packageTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              {flightLabel} · {hotelLabel} · {booking.experiences?.length ?? 0} activities
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            {(booking.lineItems ?? []).map((line) => (
              <Stack key={line.label} direction="row" justifyContent="space-between" sx={{ py: 0.4 }}>
                <Typography variant="caption" color="text.secondary">
                  {line.label}
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  €{line.amount?.toLocaleString()}
                </Typography>
              </Stack>
            ))}
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography fontWeight={800}>Total due</Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                €{booking.total?.toLocaleString()}
              </Typography>
            </Stack>
            <Button
              component={RouterLink}
              to={buildItineraryPlannerUrl(booking.destinationId, {
                start: booking.start,
                end: booking.end,
                travelers: booking.guests,
              })}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
            >
              Edit itinerary
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
