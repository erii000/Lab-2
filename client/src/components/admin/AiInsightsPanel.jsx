import { AutoAwesomeRounded } from "../../ui/icons.jsx";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { adminColors, adminPanelSx } from "./adminStyles.js";

export default function AiInsightsPanel({ insights }) {
  return (
    <Paper
      sx={{
        ...adminPanelSx,
        p: 2.5,
        background: `linear-gradient(160deg, ${alpha(adminColors.gold, 0.1)} 0%, ${alpha(adminColors.surface, 0.95)} 50%)`,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <AutoAwesomeRounded sx={{ color: adminColors.gold, fontSize: 22 }} />
        <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#fff" }}>
          AI insights
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {insights.map((text) => (
          <Box
            key={text}
            sx={{
              pl: 2,
              borderLeft: `2px solid ${alpha(adminColors.gold, 0.5)}`,
            }}
          >
            <Typography variant="body2" sx={{ color: adminColors.textMuted, lineHeight: 1.65 }}>
              {text}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
