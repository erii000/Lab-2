import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { adminColors, adminPanelSx } from "./adminStyles.js";

export function ActivityTimeline({ title, events }) {
  if (!events?.length) return null;

  return (
    <Box sx={{ ...adminPanelSx, p: 2, mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#fff", mb: 2 }}>
        {title}
      </Typography>
      <Stack spacing={0}>
        {events.map((evt, idx) => (
          <Stack key={evt.id ?? idx} direction="row" spacing={2} sx={{ position: "relative", pb: idx < events.length - 1 ? 2 : 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 12 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: adminColors.gold,
                  boxShadow: `0 0 0 3px ${alpha(adminColors.gold, 0.2)}`,
                }}
              />
              {idx < events.length - 1 ? (
                <Box sx={{ width: 2, flex: 1, bgcolor: alpha(adminColors.gold, 0.2), mt: 0.5 }} />
              ) : null}
            </Box>
            <Box sx={{ flex: 1, pb: 1 }}>
              <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
                {evt.label}
              </Typography>
              <Typography variant="caption" sx={{ color: adminColors.textMuted }}>
                {evt.date}
                {evt.time ? ` · ${evt.time}` : ""}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

export function AdminActionsHistory({ actions }) {
  if (!actions?.length) return null;

  return (
    <Box sx={{ ...adminPanelSx, p: 2, mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#fff", mb: 2 }}>
        Admin actions history
      </Typography>
      <Stack spacing={1.5}>
        {actions.map((act) => (
          <Box
            key={act.id}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha("#fff", 0.03),
              border: `1px solid ${adminColors.border}`,
            }}
          >
            <Typography variant="body2" fontWeight={700} sx={{ color: "#fff" }}>
              {act.title}
            </Typography>
            {act.detail ? (
              <Typography variant="caption" sx={{ color: adminColors.textMuted, display: "block" }}>
                {act.detail}
              </Typography>
            ) : null}
            <Typography variant="caption" sx={{ color: adminColors.gold, fontWeight: 600 }}>
              {act.date} · {act.time}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
