import { Box, Grid, Paper, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { howItWorksSteps } from "./assistantTheme.js";
import { designTokens } from "../../theme/theme.js";

export default function AssistantHowItWorks() {
  return (
    <Box component="section">
      <Typography variant="overline" color="primary" fontWeight={800} letterSpacing="0.14em">
        How it works
      </Typography>
      <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ mt: 1, mb: 4, letterSpacing: "-0.03em" }}>
        From idea to itinerary in seconds
      </Typography>
      <Grid container spacing={3}>
        {howItWorksSteps.map((item) => (
          <Grid key={item.step} size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: 3,
                bgcolor: alpha(designTokens.brand.charcoal, 0.65),
                border: `1px solid ${alpha(designTokens.brand.gold, 0.12)}`,
                transition: "border-color 0.25s ease, transform 0.25s ease",
                "&:hover": {
                  borderColor: alpha(designTokens.brand.gold, 0.35),
                  transform: "translateY(-4px)",
                },
              }}
            >
              <Typography variant="h3" fontWeight={800} sx={{ color: alpha(designTokens.brand.gold, 0.45), mb: 2 }}>
                {item.step}
              </Typography>
              <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {item.body}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
