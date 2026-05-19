import {
  AutoAwesomeRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  ExploreRounded,
  SavingsRounded,
  StarRounded,
  TimelineRounded,
} from "../ui/icons.jsx";
import {
  Box,
  Button,
  Card,
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
import HomeFeaturedDestinations from "../components/home/HomeFeaturedDestinations.jsx";
import HomeHowItWorks from "../components/home/HomeHowItWorks.jsx";
import HomeTestimonials from "../components/home/HomeTestimonials.jsx";
import HomeTrustStats from "../components/home/HomeTrustStats.jsx";
import { quickSuggestions } from "../components/home/homeData.js";
import HeroSearchBar from "../components/search/HeroSearchBar.jsx";
import { buildDestinationUrl } from "../utils/destinationSearch.js";
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
    body: "Get destinations and activities tailored to your travel style.",
    icon: <AutoAwesomeRounded fontSize="large" color="secondary" />,
  },
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
      {/* Hero */}
      <Box
        sx={{
          position: "relative",
          color: "common.white",
          pt: { xs: 6, md: 10 },
          pb: { xs: 6, md: 8 },
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
        <Box sx={{ position: "absolute", inset: 0, background: designTokens.gradients.hero }} />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${alpha(designTokens.brand.navy, 0.35)} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Stack spacing={1} sx={{ mb: 2.5, textAlign: { xs: "left", md: "center" }, maxWidth: 780, mx: "auto" }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.2em", color: alpha("#fff", 0.85), fontWeight: 700 }}>
              Smart Travel Assistant
            </Typography>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}>
              Plan your perfect trip with AI
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: alpha("#fff", 0.92), fontWeight: 400, lineHeight: 1.5, maxWidth: 680, mx: "auto" }}
            >
              Create personalized itineraries, discover top places, and plan faster with one intelligent assistant.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              justifyContent={{ xs: "flex-start", md: "center" }}
              sx={{ mt: 2.5 }}
            >
              <Button
                component={RouterLink}
                to="/search"
                variant="contained"
                size="large"
                sx={{
                  fontWeight: 800,
                  px: 3,
                  background: `linear-gradient(135deg, ${designTokens.brand.gold}, ${alpha(designTokens.brand.gold, 0.88)})`,
                  color: designTokens.brand.obsidian,
                }}
              >
                Start Your Journey
              </Button>
              <Button
                component={RouterLink}
                to="/search"
                variant="outlined"
                size="large"
                sx={{
                  fontWeight: 700,
                  color: "common.white",
                  borderColor: alpha("#fff", 0.5),
                  "&:hover": { borderColor: "common.white", bgcolor: alpha("#fff", 0.08) },
                }}
              >
                Explore Destinations
              </Button>
            </Stack>
          </Stack>

          <HeroSearchBar ctaLabel="Start Planning" showGuests />
          <HomeTrustStats />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Quick suggestions */}
        <SectionHeading
          eyebrow="Ideas"
          title="Quick suggestions"
          subtitle="Curated escapes with ratings, duration, and live pricing."
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
                  key={item.id}
                  component={RouterLink}
                  to={buildDestinationUrl(item.id)}
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
                    "&:hover .quick-sugg-media": { transform: "scale(1.08)" },
                  }}
                >
                  <Box sx={{ position: "relative", height: 148, overflow: "hidden" }}>
                    <Box
                      className="quick-sugg-media"
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.82))",
                      }}
                    />
                    <Stack direction="row" spacing={0.75} sx={{ position: "absolute", top: 10, left: 10, right: 10 }}>
                      <Chip
                        label={item.country}
                        size="small"
                        sx={{ height: 24, fontSize: "0.7rem", fontWeight: 700, bgcolor: alpha("#000", 0.5) }}
                      />
                      {item.trending ? (
                        <Chip label="Trending" size="small" color="primary" sx={{ height: 24, fontSize: "0.7rem", fontWeight: 700 }} />
                      ) : null}
                      {item.popular && !item.trending ? (
                        <Chip label="Popular" size="small" sx={{ height: 24, fontSize: "0.7rem", fontWeight: 700, bgcolor: alpha("#000", 0.5) }} />
                      ) : null}
                    </Stack>
                    <Stack sx={{ position: "absolute", left: 12, right: 12, bottom: 10 }} spacing={0.35}>
                      <Typography sx={{ color: "common.white", fontWeight: 800, fontSize: "1.05rem" }}>{item.name}</Typography>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" sx={{ color: alpha("#fff", 0.85), fontWeight: 600 }}>
                          {item.duration} · from €{item.priceFrom}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.35}>
                          <StarRounded sx={{ fontSize: 14, color: designTokens.brand.gold }} />
                          <Typography variant="caption" sx={{ color: designTokens.brand.champagne, fontWeight: 700 }}>
                            {item.rating.toFixed(1)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
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

        {/* Featured */}
        <Box sx={{ mt: { xs: 8, md: 10 } }}>
          <SectionHeading
            eyebrow="Trending"
            title="Featured destinations"
            subtitle="Hand-picked cities with premium stays and AI-built itineraries."
          />
          <HomeFeaturedDestinations />
        </Box>

        {/* Features */}
        <Box sx={{ mt: { xs: 8, md: 10 } }}>
          <SectionHeading
            eyebrow="Features"
            title="Why Smart Travel Assistant"
            subtitle="Three core capabilities that make planning fast and personalized."
          />
          <Grid container spacing={3}>
            {highlights.map((h) => (
              <Grid key={h.title} size={{ xs: 12, md: 4 }}>
                <Paper
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 3,
                    border: `1px solid ${alpha(designTokens.brand.gold, 0.12)}`,
                    background: `linear-gradient(160deg, ${alpha("#fff", 0.03)} 0%, ${alpha(designTokens.brand.charcoal, 0.9)} 100%)`,
                  }}
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: alpha(designTokens.brand.navy, 0.35),
                      }}
                    >
                      {h.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={800}>
                      {h.title}
                    </Typography>
                    <Typography color="text.secondary">{h.body}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* How it works */}
        <Box sx={{ mt: { xs: 8, md: 10 } }}>
          <SectionHeading eyebrow="How it works" title="Plan in 3 simple steps" subtitle="Search, plan with AI, then book — all in one flow." />
          <HomeHowItWorks />
        </Box>

        {/* Testimonials */}
        <Box sx={{ mt: { xs: 8, md: 10 } }}>
          <SectionHeading eyebrow="Social proof" title="What travelers say" subtitle="Real feedback from guests who planned with us." />
          <HomeTestimonials />
        </Box>

        {/* Final CTA */}
        <Box
          sx={{
            mt: { xs: 8, md: 10 },
            pt: { xs: 5, md: 6 },
            textAlign: "center",
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            Start planning your next trip today
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 440, mx: "auto" }}>
            Destination ideas, AI itineraries, and booking in one place.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              component={RouterLink}
              to="/assistant"
              variant="contained"
              color="primary"
              sx={{ fontWeight: 700, px: 3, whiteSpace: "nowrap" }}
            >
              Ask AI Assistant
            </Button>
            <Button
              component={RouterLink}
              to="/bookings"
              variant="outlined"
              sx={{
                fontWeight: 600,
                px: 3,
                borderColor: alpha(designTokens.brand.gold, 0.4),
                color: "text.primary",
              }}
            >
              My bookings
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
