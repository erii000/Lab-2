import { AutoAwesomeRounded } from "../../ui/icons.jsx";
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useBookingStore } from "../../store/bookingStore.js";
import { useExploreStore } from "../../store/exploreStore.js";
import { getPersonalizedRecommendations } from "../../utils/mlPersonalization.js";
import { buildDestinationUrl } from "../../utils/destinationSearch.js";
import { designTokens } from "../../theme/theme.js";

export default function MlRecommendationsRail() {
  const savedDestinationIds = useBookingStore((s) => s.savedDestinations);
  const bookingDrafts = useBookingStore((s) => s.bookingDrafts);
  const recentSearches = useExploreStore((s) => s.recentSearches);

  const recommendations = useMemo(
    () =>
      getPersonalizedRecommendations({
        savedDestinationIds,
        recentSearches,
        bookings: bookingDrafts,
      }),
    [savedDestinationIds, recentSearches, bookingDrafts],
  );

  if (!recommendations.length) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 4,
        borderRadius: 3,
        border: `1px solid ${alpha(designTokens.brand.gold, 0.28)}`,
        background: `linear-gradient(135deg, ${alpha(designTokens.brand.navy, 0.35)} 0%, ${alpha(designTokens.brand.charcoal, 0.9)} 100%)`,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <AutoAwesomeRounded sx={{ color: designTokens.brand.gold }} />
        <Box>
          <Typography variant="overline" sx={{ color: designTokens.brand.gold, fontWeight: 800, letterSpacing: "0.12em" }}>
            ML recommendations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Personalized from your searches, saves, and bookings
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2}>
        {recommendations.map(({ destination, score, reasons }) => (
          <Box
            key={destination.id}
            sx={{
              p: 2,
              borderRadius: 2,
              border: `1px solid ${alpha(designTokens.brand.gold, 0.12)}`,
              bgcolor: alpha("#000", 0.2),
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
              <Box
                component="img"
                src={destination.image}
                alt=""
                loading="lazy"
                sx={{ width: 88, height: 64, borderRadius: 1.5, objectFit: "cover" }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Typography fontWeight={800}>{destination.title}</Typography>
                  <Chip size="small" label={`${score}% match`} color="primary" sx={{ fontWeight: 700 }} />
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {reasons.join(" · ")}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={score}
                  sx={{
                    mt: 1,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: alpha(designTokens.brand.gold, 0.15),
                    "& .MuiLinearProgress-bar": { bgcolor: designTokens.brand.gold },
                  }}
                />
              </Box>
              <Button
                component={RouterLink}
                to={buildDestinationUrl(destination.id)}
                variant="outlined"
                size="small"
                sx={{ flexShrink: 0, fontWeight: 700 }}
              >
                View trip
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
