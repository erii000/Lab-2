import { FilterListRounded } from "../../ui/icons.jsx";
import {
  Box,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const tripTypes = ["Adventure", "Relaxing", "City", "Nature", "Food", "Culture"];

export default function FiltersPanel({
  budgetMax = 3000,
  onChange,
  defaultLocation = "",
}) {
  const [location, setLocation] = useState(defaultLocation);
  const [budget, setBudget] = useState(1200);
  const [type, setType] = useState("");

  function emit(next) {
    if (onChange) onChange(next);
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        position: { xs: "static", md: "sticky" },
        top: { md: 88 },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <FilterListRounded color="primary" />
        <Typography variant="subtitle1" fontWeight={700}>
          Filters
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2.5}>
        <TextField
          label="Location"
          placeholder="Region or city"
          fullWidth
          size="small"
          value={location}
          onChange={(e) => {
            const v = e.target.value;
            setLocation(v);
            emit({ location: v, budget, type });
          }}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Max budget (€)
          </Typography>
          <Slider
            value={budget}
            min={200}
            max={budgetMax}
            step={50}
            valueLabelDisplay="auto"
            onChange={(_, v) => {
              setBudget(v);
              emit({ location, budget: v, type });
            }}
          />
          <Typography variant="body2" fontWeight={600}>
            €{budget}
          </Typography>
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel id="trip-type-label">Trip type</InputLabel>
          <Select
            labelId="trip-type-label"
            label="Trip type"
            value={type}
            onChange={(e) => {
              const v = e.target.value;
              setType(v);
              emit({ location, budget, type: v });
            }}
          >
            <MenuItem value="">
              <em>Any</em>
            </MenuItem>
            {tripTypes.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Active
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
            {location ? (
              <Chip
                size="small"
                label={location}
                onDelete={() => {
                  setLocation("");
                  emit({ location: "", budget, type });
                }}
              />
            ) : null}
            <Chip size="small" label={`≤ €${budget}`} variant="outlined" />
            {type ? (
              <Chip
                size="small"
                label={type}
                onDelete={() => {
                  setType("");
                  emit({ location, budget, type: "" });
                }}
              />
            ) : null}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
