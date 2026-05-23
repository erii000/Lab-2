import { FlightRounded, HotelRounded, LocalActivityRounded, VerifiedRounded } from "../ui/icons.jsx";
import {
  Box,
  Button,
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
import BookingStatusChip from "../components/bookings/BookingStatusChip.jsx";
import AppModal from "../components/common/AppModal.jsx";
import SectionHeading from "../components/common/SectionHeading.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useBookingStore } from "../store/bookingStore.js";
import { BOOKING_STATUS, isDraftStatus } from "../utils/bookingConstants.js";
import { buildResumeDestinationUrl, formatBookingDates } from "../utils/bookingFactory.js";
import { designTokens } from "../theme/theme.js";

function SummaryPanel({ title, icon: Icon, children }) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(designTokens.brand.gold, 0.12)}`,
        bgcolor: alpha(designTokens.brand.graphite, 0.4),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <Icon sx={{ fontSize: 20, color: "primary.main" }} />
        <Typography variant="subtitle1" fontWeight={800}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
}

export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const getBookingById = useBookingStore((s) => s.getBookingById);
  const updateTraveler = useBookingStore((s) => s.updateTraveler);
  const deleteBooking = useBookingStore((s) => s.deleteBooking);

  const booking = getBookingById(bookingId);
  const [traveler, setTraveler] = useState(booking?.traveler ?? {});
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (booking?.traveler) setTraveler(booking.traveler);
  }, [booking?.id, booking?.traveler]);

  const canPay = useMemo(() => {
    const t = traveler;
    return Boolean(t.fullName?.trim() && t.passport?.trim() && t.email?.trim() && t.phone?.trim());
  }, [traveler]);

  if (!booking) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5">Booking not found</Typography>
        <Button component={RouterLink} to="/bookings" sx={{ mt: 2 }}>
          Back to bookings
        </Button>
      </Container>
    );
  }

  const isFinalized = booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.COMPLETED;
  const isDraft = isDraftStatus(booking.status);

  function handleDeleteDraft() {
    deleteBooking(booking.id);
    showToast({ message: "Draft removed.", severity: "success" });
    navigate("/bookings");
  }

  function persistTraveler() {
    updateTraveler(booking.id, traveler);
    showToast({ message: "Traveler details saved.", severity: "success" });
  }

  function handleConfirmPay() {
    if (canPay) persistTraveler();
    navigate(`/bookings/${booking.id}/traveler`);
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Button component={RouterLink} to="/bookings" size="small" sx={{ mb: 2 }}>
        ← Bookings
      </Button>

      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Box>
          <SectionHeading
            eyebrow="Finalize booking"
            title={booking.packageTitle}
            subtitle={`${booking.destinationTitle} · ${formatBookingDates(booking)} · ${booking.guests} guests`}
          />
        </Box>
        <BookingStatusChip status={booking.status} />
      </Stack>

      <Box sx={{ mb: 3 }}>
        <BookingProgressBar value={booking.progress ?? 0} />
      </Box>

      {isDraft ? (
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
          <Button component={RouterLink} to={buildResumeDestinationUrl(booking)} variant="outlined" size="small">
            Edit trip package
          </Button>
          <Button variant="text" color="error" size="small" onClick={() => setDeleteOpen(true)}>
            Delete draft
          </Button>
        </Stack>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2.5, mb: 2, border: `1px solid ${alpha(designTokens.brand.gold, 0.15)}` }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Traveler information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Full name"
                  fullWidth
                  size="small"
                  value={traveler.fullName ?? ""}
                  onChange={(e) => setTraveler((t) => ({ ...t, fullName: e.target.value }))}
                  disabled={isFinalized}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Passport number"
                  fullWidth
                  size="small"
                  value={traveler.passport ?? ""}
                  onChange={(e) => setTraveler((t) => ({ ...t, passport: e.target.value }))}
                  disabled={isFinalized}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Nationality"
                  fullWidth
                  size="small"
                  value={traveler.nationality ?? ""}
                  onChange={(e) => setTraveler((t) => ({ ...t, nationality: e.target.value }))}
                  disabled={isFinalized}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  size="small"
                  value={traveler.email ?? ""}
                  onChange={(e) => setTraveler((t) => ({ ...t, email: e.target.value }))}
                  disabled={isFinalized}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Phone"
                  fullWidth
                  size="small"
                  value={traveler.phone ?? ""}
                  onChange={(e) => setTraveler((t) => ({ ...t, phone: e.target.value }))}
                  disabled={isFinalized}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            {!isFinalized ? (
              <Button variant="outlined" size="small" onClick={persistTraveler} sx={{ mt: 2 }}>
                Save traveler details
              </Button>
            ) : null}
          </Paper>

          <SummaryPanel title="Flight summary" icon={FlightRounded}>
            {booking.flight ? (
              <Stack spacing={0.5}>
                <Typography fontWeight={700}>{booking.flight.airline}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {booking.flight.departure} → {booking.flight.arrival}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {booking.flight.baggage} · Lounge {booking.flight.lounge ? "yes" : "no"} · {booking.flight.cancellation}
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: designTokens.brand.champagne }}>
                  €{booking.flight.priceTotal?.toLocaleString()}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No flight selected
              </Typography>
            )}
          </SummaryPanel>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            <SummaryPanel title="Hotel summary" icon={HotelRounded}>
              {booking.hotel ? (
                <Stack spacing={0.5}>
                  <Typography fontWeight={700}>{booking.hotel.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {booking.hotel.distanceKm} km from center · ★ {booking.hotel.rating}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Breakfast · {booking.hotel.spa ? "Spa" : "City view"} · Luxury {booking.hotel.luxuryScore}/100
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={800}>
                    €{booking.hotel.total?.toLocaleString()}
                  </Typography>
                </Stack>
              ) : null}
            </SummaryPanel>

            <SummaryPanel title="Experiences" icon={LocalActivityRounded}>
              {booking.experiences?.length ? (
                booking.experiences.map((e) => (
                  <Typography key={e.id} variant="body2" sx={{ mb: 0.5 }}>
                    · {e.name} — €{e.price}/person
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  None selected
                </Typography>
              )}
            </SummaryPanel>

            <Paper
              sx={{
                p: 2,
                border: `1px solid ${alpha(designTokens.brand.gold, 0.25)}`,
                bgcolor: alpha(designTokens.brand.navy, 0.12),
              }}
            >
              <Typography variant="overline" color="primary" fontWeight={800}>
                Payment summary
              </Typography>
              {(booking.lineItems ?? []).map((line) => (
                <Stack key={line.label} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {line.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    €{line.amount?.toLocaleString()}
                  </Typography>
                </Stack>
              ))}
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={800}>Total</Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: designTokens.brand.champagne }}>
                  €{booking.total?.toLocaleString()}
                </Typography>
              </Stack>
            </Paper>

            {!isFinalized ? (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                disabled={!canPay}
                startIcon={<VerifiedRounded />}
                onClick={handleConfirmPay}
                sx={{ fontWeight: 800, py: 1.25 }}
              >
                Continue to payment
              </Button>
            ) : (
              <Button
                component={RouterLink}
                to={`/bookings/${booking.id}/success`}
                variant="contained"
                color="primary"
                fullWidth
              >
                View confirmation
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>

      <AppModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this draft?"
        subtitle={booking.packageTitle}
        actions={
          <>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteDraft}>
              Delete draft
            </Button>
          </>
        }
      >
        <Typography variant="body2" color="text.secondary">
          This removes the draft from your list. You can always start a new trip from Explore.
        </Typography>
      </AppModal>
    </Container>
  );
}
