import { Box, Grid, Typography } from "@mui/material";
import { adminColors } from "../adminStyles.js";
import BookingStatusBars from "./BookingStatusBars.jsx";
import DestinationDonutChart from "./DestinationDonutChart.jsx";
import RecentUsersPanel from "./RecentUsersPanel.jsx";
import TopTripsBars from "./TopTripsBars.jsx";

export default function DashboardAnalyticsSection({
  destSegments,
  statusItems,
  topTrips,
  recentUsers,
  flaggedUsers,
}) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: adminColors.gold, mb: 0.5 }}>
        Analytics
      </Typography>
      <Typography variant="caption" sx={{ color: adminColors.textMuted, display: "block", mb: 2 }}>
        Destinations, booking health, trip performance, and traveler activity
      </Typography>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DestinationDonutChart segments={destSegments} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <BookingStatusBars items={statusItems} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TopTripsBars trips={topTrips} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <RecentUsersPanel recent={recentUsers} flagged={flaggedUsers} />
        </Grid>
      </Grid>
    </Box>
  );
}
