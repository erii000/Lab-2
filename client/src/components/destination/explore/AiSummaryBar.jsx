import { AutoAwesomeRounded } from "../../../ui/icons.jsx";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function AiSummaryBar({ summary }) {
  if (!summary) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 2.5,
        bgcolor: (t) => alpha(t.palette.secondary.main, 0.1),
        border: (t) => `1px solid ${alpha(t.palette.secondary.main, 0.32)}`,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
        <AutoAwesomeRounded color="secondary" />
        <Typography variant="body1" fontWeight={600}>
          {summary.headline}
        </Typography>
      </Stack>
      <Grid container spacing={1.5}>
        {summary.highlights.map((h) => (
          <Grid key={h.label} size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha("#0b0d12", 0.45),
                border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {h.label}
              </Typography>
              <Typography variant="subtitle2" fontWeight={700}>
                {h.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
