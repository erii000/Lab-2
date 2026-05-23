import { Box, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { adminColors, adminPanelSx } from "./adminStyles.js";

export default function AdminMetricCard({ label, value, delta, icon: Icon }) {
  return (
    <Paper sx={{ ...adminPanelSx, p: 2.5, height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="caption" sx={{ color: adminColors.textMuted, fontWeight: 600, letterSpacing: "0.04em" }}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 0.75, color: "#fff" }}>
            {value}
          </Typography>
          {delta ? (
            <Typography variant="caption" sx={{ mt: 0.75, display: "block", color: adminColors.gold, fontWeight: 600 }}>
              {delta}
            </Typography>
          ) : null}
        </Box>
        {Icon ? (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(adminColors.gold, 0.12),
              color: adminColors.gold,
            }}
          >
            <Icon fontSize="small" />
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}
