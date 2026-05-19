import { TimelineRounded } from "../../ui/icons.jsx";
import { Box, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo } from "react";
import { getAvailabilityWindows, todayISO } from "../../utils/destinationSearch.js";
import AiSearchLoader from "./AiSearchLoader.jsx";
import DepartureWindowCard from "./DepartureWindowCard.jsx";

const SEARCH_DELAY_MS = 1500;

export default function TripPlannerPanel({
  destination,
  start,
  end,
  guests,
  budget,
  selectedWindowId,
  onStartChange,
  onEndChange,
  onGuestsChange,
  onBudgetChange,
  onWindowSelect,
  loading,
  onLoadingChange,
  comparison,
}) {
  const availability = useMemo(
    () => getAvailabilityWindows(destination.id, { weeks: 10, guests, budget }),
    [destination.id, guests, budget],
  );

  const selectedWindow = useMemo(
    () => availability.find((w) => w.id === selectedWindowId) ?? null,
    [availability, selectedWindowId],
  );

  function handleCardSelect(window) {
    onLoadingChange(true);
    onWindowSelect(window);
  }

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        mt: 3,
        borderRadius: 2.5,
        bgcolor: alpha("#0f1524", 0.55),
        backdropFilter: "blur(8px)",
        border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <TimelineRounded color="primary" />
        <Typography variant="h6" fontWeight={700}>
          Plan your dates
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            label="Check-in"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={start}
            inputProps={{ min: todayISO() }}
            onChange={(e) => onStartChange(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            label="Check-out"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={end}
            inputProps={{ min: start || todayISO() }}
            onChange={(e) => onEndChange(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            label="Travelers"
            type="number"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={guests}
            inputProps={{ min: 1, max: 12 }}
            onChange={(e) => onGuestsChange(Number(e.target.value) || 1)}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            label="Budget €"
            type="number"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={budget}
            onChange={(e) => onBudgetChange(e.target.value)}
          />
        </Grid>
      </Grid>

      {comparison?.savings > 0 ? (
        <Paper
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: (t) => alpha(t.palette.success.main, 0.12),
            border: (t) => `1px solid ${alpha(t.palette.success.main, 0.35)}`,
            animation: "float-up 300ms ease",
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            Previous €{comparison.previousPrice.toLocaleString()} → New €{comparison.newPrice.toLocaleString()} · You save €
            {comparison.savings.toLocaleString()}
          </Typography>
        </Paper>
      ) : null}

      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }}>
        Curated departures
      </Typography>

      {loading ? (
        <Box sx={{ mb: 2 }}>
          <AiSearchLoader message="Finding the best trips for you" />
        </Box>
      ) : null}

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          overflowX: "auto",
          pb: 1.5,
          opacity: loading ? 0.5 : 1,
          transition: "opacity 300ms",
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        {availability.map((window) => (
          <DepartureWindowCard
            key={window.id}
            window={window}
            selected={selectedWindowId === window.id}
            destinationImage={destination.image}
            onSelect={handleCardSelect}
          />
        ))}
      </Stack>

      {selectedWindow ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            borderColor: "primary.dark",
            bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
            animation: "float-up 400ms ease",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {selectedWindow.weatherHint}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.8 }}>
            {selectedWindow.aiNote}
          </Typography>
        </Paper>
      ) : null}
    </Paper>
  );
}

export { SEARCH_DELAY_MS };
