import { VerifiedRounded } from "../ui/icons.jsx";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import BookingProgressBar from "../components/bookings/BookingProgressBar.jsx";
import SectionHeading from "../components/common/SectionHeading.jsx";
import SecureCheckoutForm from "../components/payment/SecureCheckoutForm.jsx";
import { useLoading } from "../context/LoadingContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useBookingStore } from "../store/bookingStore.js";
import { usePaymentLogStore } from "../store/paymentLogStore.js";
import { formatBookingDates } from "../utils/bookingFactory.js";
import { buildItineraryPlannerUrl } from "../utils/itineraryPlanner.js";
import { useAuthStore } from "../store/authStore.js";
import { checkoutBookingPayment } from "../services/paymentCheckout.js";
import { getCheckoutCardPayload, maskCardNumber } from "../utils/paymentGateway.js";
import { designTokens } from "../theme/theme.js";

export default function BookingTravelerPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { runWithLoader } = useLoading();

  const getBookingById = useBookingStore((s) => s.getBookingById);
  const travelerProfile = useBookingStore((s) => s.travelerProfile);
  const updateTraveler = useBookingStore((s) => s.updateTraveler);
  const setPendingPayment = useBookingStore((s) => s.setPendingPayment);
  const confirmPayment = useBookingStore((s) => s.confirmPayment);
  const upsertBooking = useBookingStore((s) => s.upsertBooking);
  const setCurrentBooking = useBookingStore((s) => s.setCurrentBooking);
  const logTransaction = usePaymentLogStore((s) => s.logTransaction);
  const session = useAuthStore((s) => s.session);

  const booking = getBookingById(bookingId);
  const [traveler, setTraveler] = useState(booking?.traveler ?? {});
  const [paymentMethod, setPaymentMethod] = useState(booking?.paymentMethod ?? "card");
  const [cardPayload, setCardPayload] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    if (booking?.traveler) {
      setTraveler({
        ...booking.traveler,
        fullName: booking.traveler.fullName?.trim()
          ? booking.traveler.fullName
          : (travelerProfile.fullName ?? session?.name ?? ""),
        email: booking.traveler.email?.trim()
          ? booking.traveler.email
          : (travelerProfile.email ?? session?.email ?? ""),
        passport: booking.traveler.passport?.trim()
          ? booking.traveler.passport
          : (travelerProfile.passport ?? ""),
        nationality: booking.traveler.nationality?.trim()
          ? booking.traveler.nationality
          : (travelerProfile.nationality ?? ""),
        phone: booking.traveler.phone?.trim()
          ? booking.traveler.phone
          : (travelerProfile.phone ?? ""),
      });
    }
    if (booking?.id) setCurrentBooking(booking.id);
  }, [booking?.id, booking?.traveler, setCurrentBooking, session?.name, session?.email, travelerProfile]);

  const isValid = useMemo(() => {
    const t = traveler;
    const travelerOk = Boolean(
      t.fullName?.trim() &&
        t.passport?.trim() &&
        t.nationality?.trim() &&
        t.email?.trim() &&
        t.phone?.trim(),
    );
    if (!travelerOk) return false;
    if (paymentMethod === "card") {
      const { valid } = getCheckoutCardPayload(cardPayload ?? {}, paymentMethod);
      return valid;
    }
    return true;
  }, [traveler, paymentMethod, cardPayload]);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setPayError("");

    if (!isValid) {
      showToast({ message: "Please complete traveler and payment details.", severity: "warning" });
      return;
    }

    if (paymentMethod === "card") {
      const { valid } = getCheckoutCardPayload(cardPayload ?? {}, paymentMethod);
      if (!valid) {
        showToast({ message: "Fix payment field errors before continuing.", severity: "warning" });
        return;
      }
    }

    setPaying(true);
    updateTraveler(booking.id, { ...traveler, paymentMethod });
    setPendingPayment(booking.id);

    logTransaction({
      status: "pending",
      bookingId: booking.id,
      amount: booking.total,
      currency: "EUR",
      method: paymentMethod,
      travelerEmail: traveler.email,
    });

    try {
      const result = await runWithLoader(() =>
        checkoutBookingPayment({
          accessToken: session?.accessToken ?? null,
          booking,
          method: paymentMethod,
          cardNumber: cardPayload?.cardNumber,
          successUrl: `${window.location.origin}/bookings/${booking.id}/success`,
          cancelUrl: `${window.location.origin}/bookings/${booking.id}/traveler`,
        }),
      );

      if (result.redirect) return;

      if (!result.ok) {
        setPayError(result.message);
        logTransaction({
          status: "failed",
          bookingId: booking.id,
          amount: booking.total,
          code: result.code,
          message: result.message,
          method: paymentMethod,
        });
        showToast({ message: result.message, severity: "error" });
        return;
      }

      const cardDisplay =
        paymentMethod === "card"
          ? `${result.cardBrand ?? "Card"} ${maskCardNumber(cardPayload?.cardNumber ?? "")}`
          : "PayPal";

      logTransaction({
        status: "succeeded",
        bookingId: booking.id,
        amount: booking.total,
        transactionId: result.transactionId,
        provider: result.provider,
        method: paymentMethod,
        cardDisplay,
      });

      if (result.syncedBooking?.serverId) {
        upsertBooking(
          { ...booking, ...result.syncedBooking, serverId: result.syncedBooking.serverId },
          { skipSync: true },
        );
      }

      const ref = confirmPayment(booking.id, {
        paymentMethod,
        paymentCardDisplay: cardDisplay,
        transactionId: result.transactionId,
        paymentId: result.paymentId,
        serverId: result.serverBookingId ?? result.syncedBooking?.serverId,
      });

      if (result.authFallback) {
        showToast({
          message: result.message ?? "Payment saved locally. Sign in again to sync with the server.",
          severity: "warning",
        });
      } else {
        showToast({ message: "Payment successful. Confirmation sent to your email.", severity: "success" });
      }
      navigate(`/bookings/${booking.id}/success`, { state: { reference: ref } });
    } catch (err) {
      const message = err?.message ?? "Payment could not be completed. Please try again.";
      setPayError(message);
      logTransaction({
        status: "failed",
        bookingId: booking.id,
        amount: booking.total,
        message,
        method: paymentMethod,
      });
      showToast({ message, severity: "error" });
    } finally {
      setPaying(false);
    }
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
        ← Back to trip
      </Button>

      <SectionHeading
        eyebrow="Checkout"
        title="Traveler & payment"
        subtitle={`Secure payment for ${booking.destinationTitle ?? "your trip"}`}
      />

      <BookingProgressBar status={booking.status} sx={{ mb: 3 }} />

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
            <Typography variant="subtitle1" fontWeight={800} gutterBottom>
              Traveler details
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Full name"
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
            </Stack>

            <Divider sx={{ my: 3 }} />

            <SecureCheckoutForm
              amount={booking.total}
              method={paymentMethod}
              onMethodChange={setPaymentMethod}
              onCardChange={setCardPayload}
            />

            {payError ? (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                {payError}
              </Alert>
            ) : null}

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              disabled={!isValid || paying}
              startIcon={paying ? <CircularProgress size={20} color="inherit" /> : <VerifiedRounded />}
              sx={{ mt: 3, py: 1.35, fontWeight: 800 }}
            >
              {paying ? "Processing payment…" : `Pay €${booking.total?.toLocaleString()}`}
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
              {formatBookingDates(booking)} · {flightLabel} · {hotelLabel}
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
