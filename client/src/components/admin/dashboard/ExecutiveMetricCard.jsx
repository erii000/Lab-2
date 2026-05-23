import { Box, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { adminColors, adminPanelSx } from "../adminStyles.js";

function MiniTrend({ data }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 72;
  const h = 24;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block", opacity: 0.85 }}>
      <polyline
        fill="none"
        stroke={adminColors.gold}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function ExecutiveMetricCard({ label, value, delta, trend, icon: Icon, format = "number" }) {
  const display =
    format === "currency" ? `€${Number(value).toLocaleString()}` : format === "score" ? value : Number(value).toLocaleString();

  return (
    <Paper
      sx={{
        ...adminPanelSx,
        p: 2,
        height: "100%",
        transition: "border-color 0.2s ease",
        "&:hover": { borderColor: adminColors.borderHover },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: adminColors.textMuted, fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.04em" }}>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: adminColors.gold }}>
            {display}
          </Typography>
          {delta ? (
            <Typography variant="caption" sx={{ mt: 0.35, display: "block", color: adminColors.textMuted, fontWeight: 500 }}>
              {delta}
            </Typography>
          ) : null}
        </Box>
        {Icon ? (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(adminColors.gold, 0.12),
              color: adminColors.gold,
              border: `1px solid ${alpha(adminColors.gold, 0.25)}`,
            }}
          >
            <Icon fontSize="small" />
          </Box>
        ) : null}
      </Stack>
      {trend?.length ? (
        <Box sx={{ mt: 1.5, pt: 1.25, borderTop: `1px solid ${adminColors.border}` }}>
          <MiniTrend data={trend} />
        </Box>
      ) : null}
    </Paper>
  );
}
