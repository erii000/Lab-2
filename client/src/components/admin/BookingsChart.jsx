import { Box, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { adminColors, adminPanelSx } from "./adminStyles.js";

export default function BookingsChart({ data, title = "Performance" }) {
  const [mode, setMode] = useState("bookings");
  const max = Math.max(...data.map((d) => (mode === "bookings" ? d.bookings : d.revenue)), 1);

  return (
    <Paper sx={{ ...adminPanelSx, p: 2.5, height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#fff" }}>
          {title}
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={mode}
          onChange={(_, v) => v && setMode(v)}
          sx={{
            "& .MuiToggleButton-root": {
              py: 0.35,
              px: 1.5,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: adminColors.textMuted,
              borderColor: adminColors.border,
              "&.Mui-selected": { color: adminColors.gold, bgcolor: alpha(adminColors.gold, 0.12) },
            },
          }}
        >
          <ToggleButton value="bookings">Bookings</ToggleButton>
          <ToggleButton value="revenue">Revenue</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={1} sx={{ height: 180, px: 0.5 }}>
        {data.map((point) => {
          const val = mode === "bookings" ? point.bookings : point.revenue;
          return (
            <Stack key={point.label} alignItems="center" spacing={1} sx={{ flex: 1 }}>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 40,
                  height: `${(val / max) * 100}%`,
                  minHeight: 10,
                  borderRadius: 1.5,
                  bgcolor: alpha(adminColors.gold, 0.75),
                  transition: "height 0.35s ease",
                }}
              />
              <Typography variant="caption" sx={{ color: adminColors.textMuted, fontWeight: 600 }}>
                {point.label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}
