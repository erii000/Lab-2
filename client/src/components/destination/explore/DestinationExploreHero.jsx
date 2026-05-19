import { AutoAwesomeRounded, TravelExploreRounded, WbSunnyRounded } from "../../../ui/icons.jsx";
import { Box, Chip, Container, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function DestinationExploreHero({ destination, heroMeta }) {
  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      <Box
        sx={{
          height: { xs: 320, md: 440 },
          backgroundImage: `linear-gradient(180deg, rgba(11,13,18,0.25) 0%, rgba(11,13,18,0.92) 75%), url(${destination.gallery?.[0] ?? destination.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative", mt: -14, pb: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 3,
            bgcolor: alpha("#0f1524", 0.88),
            backdropFilter: "blur(16px)",
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.35)}`,
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Chip icon={<TravelExploreRounded />} label={destination.country} size="small" color="primary" variant="outlined" />
              <Chip icon={<AutoAwesomeRounded />} label={`AI Score ${heroMeta.aiScore}/100`} size="small" sx={{ fontWeight: 700 }} />
              <Chip icon={<WbSunnyRounded />} label={heroMeta.avgWeather} size="small" variant="outlined" />
              <Chip label={`Best season: ${destination.bestSeason}`} size="small" variant="outlined" />
            </Stack>
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: "2.2rem", md: "3rem" }, lineHeight: 1.05 }}>
              {destination.title}
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 400, maxWidth: 720, lineHeight: 1.5 }}>
              {heroMeta.aiDescription}
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
