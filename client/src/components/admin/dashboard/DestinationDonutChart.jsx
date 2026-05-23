import { Box, Paper, Stack, Typography } from "@mui/material";
import { adminColors, adminPanelSx } from "../adminStyles.js";

export default function DestinationDonutChart({ segments, title = "Bookings by destination" }) {
  const total = segments.reduce((s, x) => s + x.count, 0) || 1;
  const r = 40;
  const c = 2 * Math.PI * r;
  const slices = segments.reduce(
    (acc, seg) => {
      const dashLen = (seg.count / total) * c;
      acc.items.push({ ...seg, dash: dashLen, offset: acc.offset });
      acc.offset += dashLen;
      return acc;
    },
    { offset: 0, items: [] },
  ).items;

  return (
    <Paper sx={{ ...adminPanelSx, p: 2, height: "100%" }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: adminColors.gold, mb: 1.5 }}>
        {title}
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
          <svg width={96} height={96} viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={r} fill="none" stroke={adminColors.border} strokeWidth="10" />
            {slices.map((s) => (
              <circle
                key={s.name}
                cx="48"
                cy="48"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="10"
                strokeDasharray={`${s.dash} ${c}`}
                strokeDashoffset={-s.offset}
                transform="rotate(-90 48 48)"
              />
            ))}
          </svg>
          <Typography
            variant="caption"
            sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: adminColors.gold, fontWeight: 700 }}
          >
            {total}
          </Typography>
        </Box>
        <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
          {segments.map((s) => (
            <Stack key={s.name} direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.color }} />
                <Typography variant="caption" sx={{ color: adminColors.textMuted }} noWrap>
                  {s.name}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: adminColors.gold }}>
                {s.pct}%
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
