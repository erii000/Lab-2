import { AutoAwesomeRounded, TrendingUpRounded } from "../../ui/icons.jsx";
import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo } from "react";
import { generateMlInsights } from "../../utils/mlPredictive.js";
import { adminColors, adminPanelSx } from "./adminStyles.js";

export default function MlPredictiveInsights({ bookings, trips, users }) {
  const ml = useMemo(() => generateMlInsights(bookings, trips, users), [bookings, trips, users]);

  return (
    <Paper sx={{ ...adminPanelSx, p: 2, mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <AutoAwesomeRounded sx={{ color: adminColors.gold }} />
        <Typography variant="subtitle1" fontWeight={800}>
          ML predictive analytics
        </Typography>
        <Chip size="small" label="Forecast model" sx={{ ml: "auto", fontWeight: 600 }} />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <MetricCard
          label="Next-week bookings"
          value={ml.bookingForecast.forecast}
          sub={`${Math.round(ml.bookingForecast.confidence * 100)}% confidence · ${ml.bookingForecast.trend}`}
          progress={ml.bookingForecast.confidence * 100}
        />
        <MetricCard
          label="Projected revenue"
          value={`€${ml.revenue.nextWeekRevenue.toLocaleString()}`}
          sub={`Avg ticket €${ml.revenue.avgTicket.toLocaleString()}`}
          progress={ml.revenue.confidence * 100}
        />
      </Stack>

      <Stack spacing={1}>
        {ml.insights.map((text, i) => (
          <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
            <TrendingUpRounded sx={{ fontSize: 18, color: adminColors.gold, mt: 0.25 }} />
            <Typography variant="body2" sx={{ color: adminColors.textMuted, lineHeight: 1.55 }}>
              {text}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {ml.churn.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ color: adminColors.gold, fontWeight: 700 }}>
            Churn risk (ML)
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
            {ml.churn.map((c) => (
              <Chip
                key={c.userId}
                size="small"
                label={`${c.name} · ${c.risk}%`}
                color={c.band === "high" ? "error" : "warning"}
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      ) : null}
    </Paper>
  );
}

function MetricCard({ label, value, sub, progress }) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(adminColors.gold, 0.2)}`,
        bgcolor: alpha(adminColors.gold, 0.05),
      }}
    >
      <Typography variant="caption" sx={{ color: adminColors.textMuted }}>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={800} sx={{ color: adminColors.gold }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: adminColors.textMuted, display: "block", mb: 1 }}>
        {sub}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          borderRadius: 2,
          bgcolor: alpha(adminColors.gold, 0.12),
          "& .MuiLinearProgress-bar": { bgcolor: adminColors.gold },
        }}
      />
    </Box>
  );
}
