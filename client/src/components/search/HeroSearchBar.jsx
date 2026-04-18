import { SearchRounded } from "../../ui/icons.jsx";
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

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

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const q = form.query.value?.trim() ?? "";
    if (onSearch) {
      onSearch({ query: q });
      return;
    }
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const start = form.start?.value;
    const end = form.end?.value;
    const guests = form.guests?.value;
    const budget = form.budget?.value;
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    if (guests) params.set("guests", guests);
    if (budget) params.set("budget", budget);
    navigate(`/search?${params.toString()}`);
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
      {!compact ? (
        <Typography variant="subtitle2" sx={{ color: alpha("#e6f1ff", 0.92) }} gutterBottom>
          Where do you want to go?
        </Typography>
      ) : null}

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, md: showOptionalFields ? 5 : 12 }}>
          <TextField
            name="query"
            fullWidth
            placeholder="City, region, or landmark"
            defaultValue={defaultQuery}
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
              <TextField name="start" type="date" label="Start" fullWidth InputLabelProps={{ shrink: true }} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField name="end" type="date" label="End" fullWidth InputLabelProps={{ shrink: true }} sx={fieldSx} />
            </Grid>
            {showGuests ? (
              <Grid size={{ xs: 6, md: 1.5 }}>
                <TextField
                  name="guests"
                  type="number"
                  label="People"
                  fullWidth
                  inputProps={{ min: 1 }}
                  defaultValue={2}
                  sx={fieldSx}
                />
              </Grid>
            ) : null}
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField name="budget" type="number" label="Budget €" fullWidth inputProps={{ min: 0 }} placeholder="Optional" sx={fieldSx} />
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
          Tip: budgets are optional — we&apos;ll optimize suggestions around your comfort range.
        </Typography>
      ) : null}
    </Paper>
  );
}
