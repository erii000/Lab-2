import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { adminColors, adminPanelSx } from "../adminStyles.js";

export default function BookingStatusBars({ items, title = "Booking status" }) {
  return (
    <Paper sx={{ ...adminPanelSx, p: 2, height: "100%" }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: adminColors.gold, mb: 1.5 }}>
        {title}
      </Typography>
      <Stack spacing={1.5}>
        {items.map((item) => (
          <Box key={item.label}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.35 }}>
              <Typography variant="caption" sx={{ color: adminColors.textMuted }}>
                {item.label}
              </Typography>
              <Typography variant="caption" sx={{ color: adminColors.gold }}>
                {item.count}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={item.pct}
              sx={{
                height: 4,
                borderRadius: 1,
                bgcolor: alpha("#fff", 0.06),
                "& .MuiLinearProgress-bar": { bgcolor: adminColors.gold, borderRadius: 1 },
              }}
            />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
