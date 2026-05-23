import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { buildBookingUrl } from "../../utils/destinationSearch.js";

export default function StickyTripSummary({
  visible,
  destination,
  start,
  end,
  guests,
  pricePerPerson,
  total,
  comparison,
  tripParams,
  hotelTierId,
  onContinueBooking,
  continueDisabled,
}) {
  if (!visible || !destination) return null;

  const bookingUrl = buildBookingUrl(destination.id, {
    ...tripParams,
    hotel: hotelTierId,
    total,
  });

  const startLabel = start
    ? new Date(start).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "—";
  const endLabel = end
    ? new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "—";

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        px: { xs: 1.5, sm: 2 },
        pb: { xs: 1.5, sm: 2 },
        pointerEvents: "none",
      }}
    >
      <Paper
        elevation={12}
        sx={{
          pointerEvents: "auto",
          maxWidth: 960,
          mx: "auto",
          p: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          bgcolor: alpha("#0b0d12", 0.82),
          backdropFilter: "blur(18px)",
          border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.45)}`,
          boxShadow: `0 -8px 40px ${alpha("#000", 0.5)}, 0 0 24px ${alpha("#d4af6a", 0.12)}`,
          animation: "float-up 350ms ease",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: "0.12em" }}>
              Selected trip
            </Typography>
            <Typography variant="subtitle1" fontWeight={700}>
              {startLabel} → {endLabel} · {guests} traveler{guests > 1 ? "s" : ""}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {destination.title} · €{pricePerPerson?.toLocaleString()}/person
              {total ? ` · €${total.toLocaleString()} total` : ""}
            </Typography>
            {comparison?.savings > 0 ? (
              <Typography variant="caption" sx={{ color: "success.light", fontWeight: 700, display: "block", mt: 0.5 }}>
                Previous €{comparison.previousPrice.toLocaleString()} → New €{comparison.newPrice.toLocaleString()} · You save €
                {comparison.savings.toLocaleString()}
              </Typography>
            ) : null}
          </Box>
          <Button
            component={onContinueBooking ? "button" : RouterLink}
            to={onContinueBooking ? undefined : bookingUrl}
            onClick={onContinueBooking}
            disabled={continueDisabled}
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              minWidth: { sm: 200 },
              fontWeight: 800,
              boxShadow: (t) => `0 8px 28px ${alpha(t.palette.secondary.main, 0.45)}`,
            }}
          >
            Continue booking
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
