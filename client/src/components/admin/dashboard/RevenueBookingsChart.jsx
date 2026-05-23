import { Box, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { adminColors, adminPanelSx, adminToggleSx } from "../adminStyles.js";

export default function RevenueBookingsChart({ data, period, onPeriodChange }) {
  const maxBookings = Math.max(...data.map((d) => d.bookings), 1);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <Paper sx={{ ...adminPanelSx, p: 2, height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: adminColors.gold }}>
            Revenue & bookings
          </Typography>
          <Typography variant="caption" sx={{ color: adminColors.textMuted }}>
            Bars · bookings · line · revenue
          </Typography>
        </Box>
        <ToggleButtonGroup size="small" exclusive value={period} onChange={(_, v) => v && onPeriodChange(v)} sx={adminToggleSx}>
          <ToggleButton value="daily">Daily</ToggleButton>
          <ToggleButton value="weekly">Weekly</ToggleButton>
          <ToggleButton value="monthly">Monthly</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Box sx={{ position: "relative", height: 180, px: 0.5 }}>
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={0.75} sx={{ height: "100%" }}>
          {data.map((point) => (
            <Stack key={point.label} alignItems="center" sx={{ flex: 1, height: "100%", justifyContent: "flex-end" }}>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 32,
                  height: `${(point.bookings / maxBookings) * 85}%`,
                  minHeight: 6,
                  borderRadius: 0.5,
                  bgcolor: alpha(adminColors.gold, 0.35),
                }}
              />
              <Typography variant="caption" sx={{ color: adminColors.textMuted, mt: 0.75, fontSize: "0.65rem" }}>
                {point.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <svg style={{ position: "absolute", inset: "0 20px 18px 0", width: "100%", height: "calc(100% - 38px)", pointerEvents: "none" }}>
          <polyline
            fill="none"
            stroke={adminColors.gold}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data
              .map((p, i) => {
                const x = (i / Math.max(data.length - 1, 1)) * 100;
                const y = 100 - (p.revenue / maxRevenue) * 88;
                return `${x}%,${y}%`;
              })
              .join(" ")}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </Box>
    </Paper>
  );
}
