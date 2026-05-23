import { Box, Grid, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { buildDestinationUrl } from "../../utils/destinationSearch.js";
import { buildItineraryPlannerUrl } from "../../utils/itineraryPlanner.js";
import { mapDestinationToCard } from "../../utils/exploreSearch.js";
import ExploreDestinationCard from "./ExploreDestinationCard.jsx";
import { designTokens } from "../../theme/theme.js";

export default function ExploreTrending({ destinations, tripParams, savedIds, onToggleSave }) {
  if (!destinations?.length) return null;

  return (
    <Box sx={{ mt: 10, pt: 6, borderTop: `1px solid ${alpha(designTokens.brand.gold, 0.08)}` }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>
        Trending destinations
      </Typography>
      <Grid container spacing={3}>
        {destinations.map((dest) => {
          const card = mapDestinationToCard(dest);
          return (
            <Grid key={dest.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ExploreDestinationCard
                destination={card}
                itineraryTo={buildItineraryPlannerUrl(dest.id, { ...tripParams, travelers: tripParams.guests })}
                tripTo={buildDestinationUrl(dest.id, {
                  start: tripParams.start,
                  end: tripParams.end,
                  guests: tripParams.guests,
                  budget: tripParams.budget,
                })}
                saved={savedIds.includes(dest.id)}
                onToggleSave={onToggleSave}
              />
            </Grid>
          );
        })}
      </Grid>
      <Typography
        component={RouterLink}
        to="/assistant"
        variant="body2"
        sx={{ display: "inline-block", mt: 3, fontWeight: 600, color: "secondary.main", textDecoration: "none" }}
      >
        Get personalized suggestions from AI →
      </Typography>
    </Box>
  );
}
