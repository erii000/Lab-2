import { AutoAwesomeRounded } from "../ui/icons.jsx";
import { Box, Container, Grid, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import AdvancedListToolbar from "../components/search/AdvancedListToolbar.jsx";
import { BOOKING_SORT_OPTIONS, applyAdvancedListQuery, fullTextMatch } from "../utils/advancedSearch.js";
import { Link as RouterLink } from "react-router-dom";
import BookingCard from "../components/bookings/BookingCard.jsx";
import { useToast } from "../context/ToastContext.jsx";
import SectionHeading from "../components/common/SectionHeading.jsx";
import { getDestinationDetail } from "../utils/destinationSearch.js";
import {
  isCompletedBooking,
  isDraftStatus,
  isUpcomingBooking,
} from "../utils/bookingConstants.js";
import { useBookingStore } from "../store/bookingStore.js";
import { designTokens } from "../theme/theme.js";

export default function BookingsDashboardPage() {
  const [tab, setTab] = useState(0);
  const [listQuery, setListQuery] = useState("");
  const [listSort, setListSort] = useState("date-desc");
  const { showToast } = useToast();
  const bookingDrafts = useBookingStore((s) => s.bookingDrafts);
  const savedDestinations = useBookingStore((s) => s.savedDestinations);
  const deleteBooking = useBookingStore((s) => s.deleteBooking);

  async function handleDeleteDraft(bookingId) {
    await deleteBooking(bookingId);
    showToast({ message: "Draft removed.", severity: "success" });
  }

  const drafts = useMemo(() => bookingDrafts.filter((b) => isDraftStatus(b.status)), [bookingDrafts]);
  const upcoming = useMemo(() => bookingDrafts.filter((b) => isUpcomingBooking(b)), [bookingDrafts]);
  const completed = useMemo(() => bookingDrafts.filter((b) => isCompletedBooking(b)), [bookingDrafts]);

  const savedPlaces = useMemo(
    () =>
      savedDestinations
        .map((id) => getDestinationDetail(id))
        .filter(Boolean),
    [savedDestinations],
  );

  const lists = [drafts, upcoming, completed, savedPlaces];
  const rawList = lists[tab];

  const activeList = useMemo(() => {
    if (tab === 3) {
      if (!listQuery.trim()) return rawList;
      return rawList.filter((d) =>
        fullTextMatch(d, listQuery, (item) => `${item.title} ${item.country} ${item.description ?? ""}`),
      );
    }
    return applyAdvancedListQuery({
      items: rawList,
      query: listQuery,
      getSearchableText: (b) =>
        `${b.id} ${b.destinationTitle} ${b.packageTitle} ${b.status} ${b.bookingReference ?? ""}`,
      sortKey: listSort,
      sortDir: listSort.includes("desc") ? "desc" : "asc",
      getSortValue: (b, key) => {
        if (key === "amount-desc") return b.total ?? 0;
        if (key === "title-asc") return b.destinationTitle;
        return b.updatedAt ?? b.createdAt;
      },
    });
  }, [rawList, tab, listQuery, listSort]);

  const tabLabels = ["Drafts", "Upcoming", "Completed", "Saved"];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <SectionHeading
        eyebrow="Travel dashboard"
        title="Your bookings"
        subtitle="Manage drafts, confirmed trips, and saved destinations in one place."
      />

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2.5,
          border: `1px solid ${alpha(designTokens.brand.gold, 0.2)}`,
          background: `linear-gradient(135deg, ${alpha(designTokens.brand.navy, 0.2)} 0%, transparent 100%)`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <AutoAwesomeRounded color="primary" />
          <Typography variant="body2" color="text.secondary">
            {drafts.length} draft{drafts.length !== 1 ? "s" : ""} · {upcoming.length} upcoming ·{" "}
            {completed.length} completed
          </Typography>
        </Stack>
      </Paper>

      <AdvancedListToolbar
        query={listQuery}
        onQueryChange={setListQuery}
        sort={listSort}
        onSortChange={setListSort}
        sortOptions={BOOKING_SORT_OPTIONS}
        resultCount={activeList.length}
        placeholder={tab === 3 ? "Search saved destinations…" : "Full-text search your bookings…"}
      />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 44 },
        }}
      >
        {tabLabels.map((label, i) => (
          <Tab key={label} label={`${label}${i === 0 && drafts.length ? ` (${drafts.length})` : ""}`} />
        ))}
      </Tabs>

      {tab === 3 ? (
        savedPlaces.length ? (
          <Grid container spacing={2}>
            {savedPlaces.map((dest) => (
              <Grid key={dest.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  component={RouterLink}
                  to={`/destination/${dest.id}`}
                  sx={{
                    p: 0,
                    overflow: "hidden",
                    textDecoration: "none",
                    color: "inherit",
                    border: `1px solid ${alpha(designTokens.brand.gold, 0.15)}`,
                  }}
                >
                  <Box component="img" src={dest.image} alt="" sx={{ width: "100%", height: 120, objectFit: "cover" }} />
                  <Box sx={{ p: 1.5 }}>
                    <Typography fontWeight={700}>{dest.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      from €{dest.priceFrom}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <EmptyTab message="Save destinations from trip cards to see them here." />
        )
      ) : activeList.length ? (
        <Stack spacing={2}>
          {activeList.map((item) => (
            <BookingCard
              key={item.id}
              booking={item}
              onDelete={tab === 0 ? handleDeleteDraft : undefined}
            />
          ))}
        </Stack>
      ) : (
        <EmptyTab
          message={
            tab === 0
              ? "No drafts yet. Customize a trip and tap Save Draft."
              : tab === 1
                ? "No upcoming trips. Confirm a booking to see it here."
                : "No completed trips yet."
          }
        />
      )}
    </Container>
  );
}

function EmptyTab({ message }) {
  return (
    <Paper sx={{ p: 4, textAlign: "center", border: (t) => `1px dashed ${t.palette.divider}` }}>
      <Typography color="text.secondary">{message}</Typography>
    </Paper>
  );
}
