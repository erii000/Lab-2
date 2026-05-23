import { AutoAwesomeRounded } from "../../../ui/icons.jsx";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { adminColors, adminPanelSx } from "../adminStyles.js";

export default function SmartInsightsPanel({ insights, forecast }) {
  return (
    <Paper sx={{ ...adminPanelSx, p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <AutoAwesomeRounded sx={{ color: adminColors.gold, fontSize: 20 }} />
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: adminColors.gold }}>
          Smart insights
        </Typography>
      </Stack>
      {forecast != null ? (
        <Box
          sx={{
            mb: 1.5,
            p: 1.25,
            borderRadius: 2,
            bgcolor: alpha(adminColors.gold, 0.08),
            border: `1px solid ${alpha(adminColors.gold, 0.22)}`,
          }}
        >
          <Typography variant="caption" sx={{ color: adminColors.textMuted }}>
            Forecast next week
          </Typography>
          <Typography variant="body1" fontWeight={700} sx={{ color: adminColors.gold }}>
            {forecast} bookings
          </Typography>
        </Box>
      ) : null}
      <Stack spacing={1} sx={{ flex: 1 }}>
        {(insights ?? []).map((item, i) => (
          <Typography
            key={i}
            variant="body2"
            sx={{
              color: adminColors.textMuted,
              lineHeight: 1.5,
              fontSize: "0.8rem",
              pl: 1,
              borderLeft: `2px solid ${alpha(adminColors.gold, 0.35)}`,
            }}
          >
            {item.text}
          </Typography>
        ))}
      </Stack>
    </Paper>
  );
}
