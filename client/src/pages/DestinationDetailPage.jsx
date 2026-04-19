import { AcUnitRounded, StarRounded, WbSunnyRounded } from "../ui/icons.jsx";
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  ImageList,
  ImageListItem,
  Paper,
  Rating,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink, useParams } from "react-router-dom";
import SectionHeading from "../components/common/SectionHeading.jsx";
import { getDestinationDetail } from "../data/mockDestinations.js";

export default function DestinationDetailPage() {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { id } = useParams();
  const dest = getDestinationDetail(id);

  if (!dest) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5">Destination not found</Typography>
        <Button component={RouterLink} to="/search" sx={{ mt: 2 }}>
          Back to explore
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          height: { xs: 280, md: 360 },
          backgroundImage: `linear-gradient(to top, rgba(15,23,42,0.85), transparent), url(${dest.gallery?.[0] ?? dest.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Container maxWidth="lg" sx={{ mt: -8, position: "relative", pb: 6 }}>
        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          <Stack spacing={2}>
            <Typography variant="overline" color="secondary">
              Destination
            </Typography>
            <Typography variant="h3" component="h1" sx={{ fontSize: { xs: "1.9rem", md: "3rem" }, lineHeight: 1.15 }}>
              {dest.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Rating value={dest.rating} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary">
                {dest.rating} · From €{dest.priceFrom}
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
              {dest.description}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1 }}>
              <Button component={RouterLink} to="/itinerary" variant="contained" color="secondary" size="large">
                Plan this trip
              </Button>
              <Button component={RouterLink} to="/assistant" variant="outlined" size="large">
                Ask AI to refine
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <SectionHeading title="Gallery" subtitle="Swipe-ready on mobile — replace with carousel if preferred." />
            <ImageList variant="masonry" cols={isSmDown ? 1 : 2} gap={12}>
              {(dest.gallery ?? [dest.image]).map((src) => (
                <ImageListItem key={src}>
                  <Box
                    component="img"
                    src={src}
                    alt=""
                    sx={{ borderRadius: 2, width: "100%", display: "block" }}
                  />
                </ImageListItem>
              ))}
            </ImageList>

            <SectionHeading title="Things to do" subtitle="Wire CMS or POI service — structure stays stable." sx={{ mt: 4 }} />
            <Stack spacing={1.5}>
              {dest.thingsToDo?.map((item) => (
                <Paper key={item} variant="outlined" sx={{ px: 2, py: 1.5 }}>
                  <Typography>{item}</Typography>
                </Paper>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Weather snapshot
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <WbSunnyRounded color="warning" />
                <Box>
                  <Typography variant="h5">{dest.weather?.tempC}°C</Typography>
                  <Typography color="text.secondary">{dest.weather?.condition}</Typography>
                </Box>
                <AcUnitRounded sx={{ ml: "auto", opacity: 0.5 }} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {dest.weather?.seasonTip}
              </Typography>
            </Paper>

            <SectionHeading title="Reviews" />
            <Stack spacing={2}>
              {dest.reviews?.map((r) => (
                <Paper key={r.author} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar>{r.author[0]}</Avatar>
                    <Box>
                      <Typography fontWeight={700}>{r.author}</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <StarRounded sx={{ fontSize: 18, color: "warning.main" }} />
                        <Typography variant="caption">{r.rating}</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {r.text}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            <Paper
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: (t) => alpha(t.palette.secondary.main, 0.08),
                border: (t) => `1px solid ${alpha(t.palette.secondary.main, 0.25)}`,
              }}
            >
              <Typography variant="subtitle2" color="secondary" gutterBottom>
                Suggested itinerary (AI)
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {dest.aiItineraryTeaser}
              </Typography>
              <Button component={RouterLink} to="/itinerary" variant="contained" color="secondary" fullWidth>
                Edit in itinerary planner
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
