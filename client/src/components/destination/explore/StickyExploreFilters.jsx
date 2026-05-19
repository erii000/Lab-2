import { FilterListRounded } from "../../../ui/icons.jsx";
import { todayISO } from "../../../utils/destinationSearch.js";
import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

const SMART_CHIPS = [
  { key: "bestWeather", label: "Best weather" },
  { key: "luxuryOnly", label: "Luxury only" },
  { key: "nightlife", label: "Nightlife" },
  { key: "romantic", label: "Romantic" },
  { key: "family", label: "Family" },
  { key: "lowCrowd", label: "Low crowd" },
  { key: "shortestTravel", label: "Shortest travel" },
];

export default function StickyExploreFilters({ filters, onChange }) {
  function update(patch) {
    onChange({ ...filters, ...patch });
  }

  function toggleSmart(key) {
    onChange({
      ...filters,
      smart: { ...filters.smart, [key]: !filters.smart[key] },
    });
  }

  return (
    <Box
      sx={{
        position: "sticky",
        top: { xs: 56, md: 72 },
        zIndex: 20,
        py: 1.5,
        bgcolor: (t) => alpha(t.palette.background.default, 0.92),
        backdropFilter: "blur(12px)",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 2.5,
          borderColor: (t) => alpha(t.palette.primary.main, 0.28),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <FilterListRounded color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={700}>
            Refine your trip
          </Typography>
        </Stack>

        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              label="Check-in"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.start}
              inputProps={{ min: todayISO() }}
              onChange={(e) => update({ start: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              label="Check-out"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.end}
              inputProps={{ min: filters.start || todayISO() }}
              onChange={(e) => update({ end: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              label="Travelers"
              type="number"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.guests}
              inputProps={{ min: 1, max: 12 }}
              onChange={(e) => update({ guests: Number(e.target.value) || 1 })}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              label="Budget €"
              type="number"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.budget}
              onChange={(e) => update({ budget: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="class-label">Class</InputLabel>
              <Select
                labelId="class-label"
                label="Class"
                value={filters.travelClass}
                onChange={(e) => update({ travelClass: e.target.value })}
              >
                <MenuItem value="economy">Economy</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="business">Business</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.directOnly}
                  onChange={(e) => update({ directOnly: e.target.checked })}
                  color="primary"
                />
              }
              label="Direct flights only"
            />
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          Smart filters
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
          {SMART_CHIPS.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              clickable
              color={filters.smart[chip.key] ? "primary" : "default"}
              variant={filters.smart[chip.key] ? "filled" : "outlined"}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault();
                toggleSmart(chip.key);
              }}
            />
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
