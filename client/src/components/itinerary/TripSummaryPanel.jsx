import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { buildBookingUrl } from "../../utils/destinationSearch.js";
import { designTokens } from "../../theme/theme.js";

export default function TripSummaryPanel({
  summary,
  quote,
  included,
  destinationId,
  tripParams,
  onContinueToBooking,
}) {
  const navigate = useNavigate();

  function handleContinue() {
    const booking = onContinueToBooking?.();
    navigate(
      buildBookingUrl(destinationId, {
        bookingId: booking?.id,
        start: tripParams.start,
        end: tripParams.end,
        guests: tripParams.travelers,
        budget: tripParams.budget,
      }),
    );
  }

  const lineItems = quote?.lineItems ?? [];

  return (
    <Box
      sx={{
        position: { md: "sticky" },
        top: { md: 100 },
        p: 3,
        borderRadius: 3,
        bgcolor: alpha(designTokens.brand.charcoal, 0.55),
        border: `1px solid ${alpha(designTokens.brand.gold, 0.1)}`,
      }}
    >
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2.5 }}>
        Trip summary
      </Typography>
      <Stack spacing={1.25}>
        {lineItems.length > 0
          ? lineItems.map((line) => (
              <Stack key={line.label} direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary" sx={{ pr: 1 }}>
                  {line.label}
                </Typography>
                <Typography variant="body2" fontWeight={600} noWrap>
                  €{line.amount.toLocaleString()}
                </Typography>
              </Stack>
            ))
          : (
            <>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Activities
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  €{summary.activities.toLocaleString()}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Hotel
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  €{summary.hotel.toLocaleString()}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Flights
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  €{summary.flights.toLocaleString()}
                </Typography>
              </Stack>
            </>
          )}
        <Divider sx={{ borderColor: alpha(designTokens.brand.gold, 0.1) }} />
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography fontWeight={800}>Estimated total</Typography>
          <Typography variant="h5" fontWeight={800} color="primary.main">
            €{summary.total.toLocaleString()}
          </Typography>
        </Stack>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
        Updates automatically when you add, edit, or remove activities.
      </Typography>

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleContinue}
        sx={{ mt: 3, py: 1.35, fontWeight: 800, borderRadius: 2 }}
      >
        Continue to booking
      </Button>

      {included?.length ? (
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 1 }}>
            Included in your trip
          </Typography>
          <Stack spacing={0.5}>
            {included.map((item) => (
              <Typography key={item} variant="caption" color="text.secondary">
                ✓ {item}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}
