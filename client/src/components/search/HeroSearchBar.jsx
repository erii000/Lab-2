import { SearchRounded } from "../../ui/icons.jsx";
import {
  Button,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { defaultTripDates, todayISO } from "../../utils/destinationSearch.js";
import { buildExploreUrl } from "../../utils/exploreSearch.js";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: alpha("#1d2b45", 0.88),
    color: "#f8fbff",
    "& fieldset": { borderColor: alpha("#7ea0cf", 0.38) },
    "&:hover fieldset": { borderColor: alpha("#9db8de", 0.62) },
    "&.Mui-focused fieldset": { borderColor: alpha("#aecdff", 0.9) },
  },
  "& .MuiInputLabel-root": { color: alpha("#d8e8ff", 0.84) },
  "& .MuiInputLabel-root.Mui-focused": { color: "#dfefff" },
};

export default function HeroSearchBar({
  compact = false,
  onSearch,
  defaultQuery = "",
  showOptionalFields = true,
  showGuests = true,
  ctaLabel = "Search destinations",
}) {
  const navigate = useNavigate();
  const defaults = defaultTripDates();
  const minDate = todayISO();

  const [queryInput, setQueryInput] = useState(defaultQuery);
  const [start, setStart] = useState(defaults.start);
  const [end, setEnd] = useState(defaults.end);
  const [guests, setGuests] = useState(2);
  const [budget, setBudget] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const query = queryInput.trim();
    const criteria = {
      destination: query,
      start,
      end,
      travelers: guests,
      budget: budget ? Number(budget) : null,
    };

    if (onSearch) {
      onSearch(criteria);
      return;
    }

    navigate(buildExploreUrl(criteria));
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        p: compact ? 2 : { xs: 2, md: 3 },
        borderRadius: 3,
        bgcolor: alpha("#0f1d35", compact ? 0.98 : 0.94),
        border: (theme) => `1px solid ${alpha(theme.palette.primary.light, 0.42)}`,
        boxShadow: compact ? 1 : "0 24px 70px rgba(5, 9, 18, 0.55)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, md: showOptionalFields ? 5 : 12 }}>
          <TextField
            name="query"
            label="Where do you want to go?"
            fullWidth
            required
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded color="primary" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        {showOptionalFields ? (
          <>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                type="date"
                label="Check-in"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={start}
                inputProps={{ min: minDate }}
                onChange={(e) => {
                  const v = e.target.value;
                  setStart(v);
                  if (end && v > end) setEnd(v);
                }}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                type="date"
                label="Check-out"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={end}
                inputProps={{ min: start || minDate }}
                onChange={(e) => setEnd(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            {showGuests ? (
              <Grid size={{ xs: 6, md: 1.5 }}>
                <TextField
                  type="number"
                  label="Travelers"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={guests}
                  inputProps={{ min: 1, max: 12 }}
                  onChange={(e) => setGuests(Number(e.target.value) || 1)}
                  sx={fieldSx}
                />
              </Grid>
            ) : null}
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField
                type="number"
                label="Budget €"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={budget}
                inputProps={{ min: 0, step: 100 }}
                onChange={(e) => setBudget(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
          </>
        ) : null}
      </Grid>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }} justifyContent="flex-end">
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          size="large"
          fullWidth={!compact}
          sx={{
            minWidth: 200,
            bgcolor: "#2f69b0",
            color: "#f8fbff",
            fontWeight: 700,
            "&:hover": { bgcolor: "#3b78c4" },
          }}
        >
          {ctaLabel}
        </Button>
      </Stack>

      {!compact ? (
        <Typography variant="caption" sx={{ mt: 1.5, display: "block", color: alpha("#cde0ff", 0.75) }}>
          Enter a city name, then choose your dates and budget.
        </Typography>
      ) : null}
    </Paper>
  );
}
