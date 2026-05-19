import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { buildBookingUrl } from "../../utils/destinationSearch.js";

export default function TripQuotePanel({
  destination,
  quote,
  hotelTierId,
  onHotelTierChange,
  tripParams,
  selectedCount,
}) {
  const bookingUrl = buildBookingUrl(destination.id, {
    ...tripParams,
    hotel: hotelTierId,
    total: quote.total,
  });

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2.5,
        position: { md: "sticky" },
        top: { md: 96 },
        border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.28)}`,
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
      }}
    >
      <Typography variant="overline" color="secondary">
        Trip estimate
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
        €{quote.total.toLocaleString()}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        €{quote.perPerson.toLocaleString()} per person · {quote.nights} nights · {quote.guests} traveler
        {quote.guests > 1 ? "s" : ""}
      </Typography>

      <FormControl fullWidth size="small" sx={{ mt: 2.5 }}>
        <InputLabel id="hotel-tier-label">Accommodation</InputLabel>
        <Select
          labelId="hotel-tier-label"
          label="Accommodation"
          value={hotelTierId}
          onChange={(e) => onHotelTierChange(e.target.value)}
        >
          {destination.hotelTiers?.map((tier) => (
            <MenuItem key={tier.id} value={tier.id}>
              {tier.label} — €{tier.nightly}/night
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1}>
        {quote.lineItems.map((item) => (
          <Stack key={item.label} direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              €{item.amount.toLocaleString()}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {quote.withinBudget === false ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Exceeds your €{Number(tripParams.budget).toLocaleString()} budget by €
          {Math.abs(quote.budgetRemaining).toLocaleString()}. Adjust dates or activities.
        </Alert>
      ) : null}
      {quote.withinBudget === true ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          Within budget — €{quote.budgetRemaining.toLocaleString()} remaining.
        </Alert>
      ) : null}

      <Button
        component={RouterLink}
        to={bookingUrl}
        variant="contained"
        color="secondary"
        size="large"
        fullWidth
        sx={{ mt: 3 }}
      >
        Continue to booking
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block", textAlign: "center" }}>
        {selectedCount} experience{selectedCount !== 1 ? "s" : ""} selected · secure checkout
      </Typography>
    </Paper>
  );
}
