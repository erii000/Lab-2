import { Box, Container, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AiAssistDrawer from "../components/itinerary/AiAssistDrawer.jsx";
import PlannerToolbar from "../components/itinerary/PlannerToolbar.jsx";
import TripHeader from "../components/itinerary/TripHeader.jsx";
import TripSummaryPanel from "../components/itinerary/TripSummaryPanel.jsx";
import TripTimeline from "../components/itinerary/TripTimeline.jsx";
import { useBookingStore } from "../store/bookingStore.js";
import { usePlannerStore } from "../store/plannerStore.js";
import { designTokens } from "../theme/theme.js";

export default function ItineraryPlannerPage() {
  const [searchParams] = useSearchParams();
  const trip = usePlannerStore((s) => s.trip);
  const initFromSearchParams = usePlannerStore((s) => s.initFromSearchParams);
  const setDays = usePlannerStore((s) => s.setDays);
  const applyAiSuggestion = usePlannerStore((s) => s.applyAiSuggestion);
  const continueToBooking = usePlannerStore((s) => s.continueToBooking);
  const toggleSaved = useBookingStore((s) => s.toggleSavedDestination);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    initFromSearchParams(searchParams);
  }, [searchParams, initFromSearchParams]);

  if (!trip) {
    return null;
  }

  const handleSave = () => {
    toggleSaved(trip.destination.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: trip.meta.title, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <Box sx={{ bgcolor: designTokens.brand.obsidian, minHeight: "100vh", pb: 8 }}>
      <PlannerToolbar
        tripTitle={trip.meta.title}
        destinationId={trip.destination.id}
        tripParams={trip.params}
        onSave={handleSave}
        onContinueToBooking={continueToBooking}
      />

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, pt: 3 }}>
        <TripHeader meta={trip.meta} onSave={handleSave} onShare={handleShare} />

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <TripTimeline
              days={trip.days}
              onDaysChange={setDays}
              onOpenAiAssist={() => setAiOpen(true)}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <TripSummaryPanel
              summary={trip.summary}
              quote={trip.quote}
              included={trip.included}
              destinationId={trip.destination.id}
              tripParams={trip.params}
              onContinueToBooking={continueToBooking}
            />
          </Grid>
        </Grid>
      </Container>

      <AiAssistDrawer
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onSelect={applyAiSuggestion}
      />
    </Box>
  );
}
