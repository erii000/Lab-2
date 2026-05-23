import { useState } from "react";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import AppModal from "../common/AppModal.jsx";
import { formatBookingDates, buildResumeDestinationUrl } from "../../utils/bookingFactory.js";
import { buildBookingUrl } from "../../utils/destinationSearch.js";
import { isDraftStatus } from "../../utils/bookingConstants.js";
import { designTokens } from "../../theme/theme.js";
import BookingProgressBar from "./BookingProgressBar.jsx";
import BookingStatusChip from "./BookingStatusChip.jsx";

export default function BookingCard({ booking, onDelete }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isDraft = isDraftStatus(booking.status);
  const ctaLabel =
    booking.status === "confirmed" || booking.status === "completed" ? "View trip" : "Continue booking";
  const checkoutUrl = buildBookingUrl(booking.destinationId, {
    bookingId: booking.id,
    start: booking.start,
    end: booking.end,
    guests: booking.guests,
  });

  function handleConfirmDelete() {
    onDelete?.(booking.id);
    setDeleteOpen(false);
  }

  return (
    <>
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          overflow: "hidden",
          border: `1px solid ${alpha(designTokens.brand.gold, 0.18)}`,
          bgcolor: alpha(designTokens.brand.graphite, 0.45),
        }}
      >
        <Box
          component="img"
          src={booking.destinationImage}
          alt=""
          sx={{
            width: { xs: "100%", sm: 140 },
            height: { xs: 120, sm: "auto" },
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
        <CardContent sx={{ flex: 1, py: 2, "&:last-child": { pb: 2 } }}>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Box>
                <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
                  {booking.packageTitle || booking.destinationTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatBookingDates(booking)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {booking.guests} guest{booking.guests > 1 ? "s" : ""} · Total €{booking.total.toLocaleString()}
                </Typography>
              </Box>
              <BookingStatusChip status={booking.status} />
            </Stack>
            <BookingProgressBar value={booking.progress ?? 0} />
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {isDraft ? (
                <>
                  <Button
                    component={RouterLink}
                    to={buildResumeDestinationUrl(booking)}
                    variant="outlined"
                    color="inherit"
                    size="small"
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                  >
                    Edit trip
                  </Button>
                  <Button
                    component={RouterLink}
                    to={checkoutUrl}
                    variant="contained"
                    color="secondary"
                    size="small"
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                  >
                    {ctaLabel}
                  </Button>
                  {onDelete ? (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      onClick={() => setDeleteOpen(true)}
                      sx={{ fontWeight: 600 }}
                    >
                      Delete
                    </Button>
                  ) : null}
                </>
              ) : (
                <Button
                  component={RouterLink}
                  to={`/bookings/${booking.id}`}
                  variant="contained"
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  {ctaLabel}
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <AppModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this draft?"
        subtitle={booking.packageTitle || booking.destinationTitle}
        actions={
          <>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleConfirmDelete}>
              Delete draft
            </Button>
          </>
        }
      >
        <Typography variant="body2" color="text.secondary">
          This removes the draft from your list. You can always start a new trip from Explore.
        </Typography>
      </AppModal>
    </>
  );
}
