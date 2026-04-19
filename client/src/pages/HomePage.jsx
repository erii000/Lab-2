import {
  AutoAwesomeRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  ExploreRounded,
  SavingsRounded,
  TimelineRounded,
} from "../ui/icons.jsx";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import SectionHeading from "../components/common/SectionHeading.jsx";
import HeroSearchBar from "../components/search/HeroSearchBar.jsx";
import { designTokens } from "../theme/theme.js";

const highlights = [
  {
    title: "AI Trip Planner",
    body: "Generate day-by-day plans in seconds based on preferences and trip length.",
    icon: <TimelineRounded fontSize="large" color="secondary" />,
  },
  {
    title: "Smart Budgeting",
    body: "Balance experiences, transport, and stays around your budget automatically.",
    icon: <SavingsRounded fontSize="large" color="secondary" />,
  },
  {
    title: "Personalized Recommendations",
    body: "Get destinations and activities tailored to your profile and travel style.",
    icon: <AutoAwesomeRounded fontSize="large" color="secondary" />,
  },
];

const quickSuggestions = [
  { name: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80" },
  { name: "Rome", image: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=900&q=80" },
  { name: "Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80" },
  { name: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80" },
  { name: "Barcelona", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=80" },
  { name: "Dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80" },
  { name: "London", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80" },
  { name: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=900&q=80" },
];

const steps = [
  { title: "Search destination", text: "Tell us where and when you want to travel." },
  { title: "Get AI itinerary", text: "Receive a smart day-by-day plan instantly." },
  { title: "Book & enjoy", text: "Save your trip and continue to booking." },
];

export default function HomePage() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"));
  const visibleCount = isXs ? 1 : isMdDown ? 2 : 3;
  const [slideStart, setSlideStart] = useState(0);

  const maxStart = Math.max(0, quickSuggestions.length - visibleCount);
  const startIndex = Math.min(slideStart, maxStart);
  const visibleSlides = quickSuggestions.slice(startIndex, startIndex + visibleCount);

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          color: "common.white",
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              'url("https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=2200&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "saturate(1.08)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: designTokens.gradients.hero,
          }}
        />
        <Container maxWidth="lg">
          <Stack
            spacing={1}
            sx={{
              mb: 3,
              textAlign: { xs: "left", md: "center" },
              maxWidth: 780,
              mx: "auto",
              position: "relative",
              zIndex: 2,
            }}
          >
            <Typography
              variant="overline"
              sx={{ letterSpacing: "0.2em", color: alpha("#fff", 0.85), fontWeight: 700 }}
            >
              Smart Travel Assistant
            </Typography>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}>
              Plan your perfect trip with AI
            </Typography>
            <Typography variant="h6" sx={{ color: alpha("#fff", 0.92), fontWeight: 400, lineHeight: 1.5, maxWidth: 680, mx: "auto" }}>
              Create personalized itineraries, discover top places, and plan faster with one intelligent assistant.
            </Typography>
          </Stack>
          <Box sx={{ position: "relative", zIndex: 2 }}>
            <HeroSearchBar ctaLabel="Start Planning" showGuests={false} />
          </Box>
        </Container>
      </Box>

      <Box
        sx={{
          position: "relative",
          minHeight: { xs: 220, md: 280 },
          backgroundImage:
            'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2200&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderTop: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
          borderBottom: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(7,11,20,0.25) 0%, rgba(7,11,20,0.82) 100%)",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", py: { xs: 5, md: 8 } }}>
          <Typography variant="h5" sx={{ color: "common.white", fontWeight: 800, maxWidth: 560 }}>
            Discover extraordinary destinations with an interface designed for modern travelers.
          </Typography>
          <Typography sx={{ color: alpha("#fff", 0.86), mt: 1.2, maxWidth: 520 }}>
            Real destinations, smart planning, and professional-grade travel tools in one seamless experience.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <SectionHeading
          eyebrow="Ideas"
          title="Quick suggestions"
          subtitle="Pick a destination and start planning immediately."
        />
        <Stack direction="row" spacing={{ xs: 0.8, sm: 1.5 }} alignItems="center" sx={{ pb: 0.5 }}>
          <IconButton
            aria-label="Previous destinations"
            onClick={() => setSlideStart((s) => Math.max(0, Math.min(s, maxStart) - 1))}
            disabled={startIndex <= 0}
            sx={{
              flexShrink: 0,
              width: { xs: 34, sm: 40 },
              height: { xs: 34, sm: 40 },
              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.35)}`,
              bgcolor: alpha("#121826", 0.85),
              color: "primary.main",
              "&:hover": { bgcolor: alpha("#1a2438", 0.95) },
              "&.Mui-disabled": { opacity: 0.35 },
            }}
          >
            <ChevronLeftRounded />
          </IconButton>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "stretch" }}>
              {visibleSlides.map((item) => (
                <Card
                  key={item.name}
                  component={RouterLink}
                  to={`/search?q=${encodeURIComponent(item.name)}`}
                  sx={{
                    flex: `1 1 ${100 / visibleCount}%`,
                    minWidth: 0,
                    borderRadius: 2.5,
                    overflow: "hidden",
                    textDecoration: "none",
                    border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.22)}`,
                    boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
                    transition: "transform 220ms ease, box-shadow 220ms ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 22px 50px rgba(0,0,0,0.38)",
                    },
                    "&:hover .quick-sugg-media": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <Box sx={{ position: "relative", height: 132, overflow: "hidden" }}>
                    <Box
                      className="quick-sugg-media"
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transformOrigin: "center center",
                        transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        transform: "scale(1)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.76))",
                        pointerEvents: "none",
                      }}
                    />
                    <Typography
                      sx={{
                        position: "absolute",
                        left: 12,
                        bottom: 10,
                        color: "common.white",
                        fontWeight: 800,
                        letterSpacing: "0.02em",
                        fontSize: "1rem",
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Stack>
          </Box>

          <IconButton
            aria-label="Next destinations"
            onClick={() => setSlideStart((s) => Math.min(maxStart, Math.min(s, maxStart) + 1))}
            disabled={startIndex >= maxStart}
            sx={{
              flexShrink: 0,
              width: { xs: 34, sm: 40 },
              height: { xs: 34, sm: 40 },
              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.35)}`,
              bgcolor: alpha("#121826", 0.85),
              color: "primary.main",
              "&:hover": { bgcolor: alpha("#1a2438", 0.95) },
              "&.Mui-disabled": { opacity: 0.35 },
            }}
          >
            <ChevronRightRounded />
          </IconButton>
        </Stack>

        <Box sx={{ mt: 8 }}>
          <SectionHeading
            eyebrow="Features"
            title="Why Smart Travel Assistant"
            subtitle="Three core features that make planning fast and personalized."
          />
          <Grid container spacing={3}>
            {highlights.map((h) => (
              <Grid key={h.title} size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 3, height: "100%", border: (theme) => `1px solid ${theme.palette.divider}` }}>
                  <Stack spacing={2}>
                    {h.icon}
                    <Typography variant="h6">{h.title}</Typography>
                    <Typography color="text.secondary">{h.body}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 8 }}>
          <SectionHeading eyebrow="How it works" title="Plan in 3 simple steps" subtitle="Visual and simple flow." />
          <Grid container spacing={2.5}>
            {steps.map((step, index) => (
              <Grid key={step.title} size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 3, height: "100%", border: (theme) => `1px solid ${theme.palette.divider}` }}>
                  <Chip label={`Step ${index + 1}`} color="secondary" size="small" sx={{ mb: 1.4 }} />
                  <Typography variant="h6" sx={{ mb: 0.8 }}>
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary">{step.text}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 8 }}>
          <SectionHeading eyebrow="Preview" title="Sample itinerary" subtitle="See the value before you commit." />
          <Card sx={{ borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack spacing={1.5}>
                <Typography variant="h6">3 days in Paris</Typography>
                <Typography color="text.secondary">Day 1: Eiffel Tower + Seine walk</Typography>
                <Typography color="text.secondary">Day 2: Louvre + Montmartre</Typography>
                <Typography color="text.secondary">Day 3: Versailles + local food tour</Typography>
                <Button component={RouterLink} to="/destination/paris" variant="outlined" endIcon={<ExploreRounded />} sx={{ alignSelf: "flex-start", mt: 1 }}>
                  View details
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            mt: 8,
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.12)} 100%)`,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack spacing={2} alignItems={{ xs: "stretch", sm: "center" }} direction={{ xs: "column", sm: "row" }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                Start planning your next trip today
              </Typography>
              <Typography color="text.secondary">
                Your assistant is ready with destination ideas, AI itineraries, and booking-ready planning.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 360 } }}>
              <Button component={RouterLink} to="/itinerary" variant="contained" color="secondary" size="large" fullWidth>
                Create my trip
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
