import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { adminColors, adminPanelSx } from "../adminStyles.js";

export default function TopTripsBars({ trips }) {
  const max = Math.max(...(trips ?? []).map((t) => t.bookings), 1);
  return (
    <Paper sx={{ ...adminPanelSx, p: 2, height: "100%" }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: adminColors.gold, mb: 1.5 }}>
        Top performing trips
      </Typography>
      {!trips?.length ? (
        <Typography variant="body2" sx={{ color: adminColors.textMuted }}>
          No trip data yet.
        </Typography>
      ) : (
        <Stack spacing={1.25}>
          {trips.map((t) => (
            <Box key={t.id}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                <Typography variant="caption" sx={{ color: "#fff", fontWeight: 600 }} noWrap>
                  {t.title}
                </Typography>
                <Typography variant="caption" sx={{ color: adminColors.gold }}>
                  AI {t.aiScore}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(t.bookings / max) * 100}
                sx={{
                  height: 4,
                  borderRadius: 1,
                  bgcolor: alpha("#fff", 0.06),
                  "& .MuiLinearProgress-bar": { bgcolor: alpha(adminColors.gold, 0.55), borderRadius: 1 },
                }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
