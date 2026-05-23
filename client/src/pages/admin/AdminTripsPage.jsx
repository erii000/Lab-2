import { AddRounded } from "../../ui/icons.jsx";
import { Box, Button, Chip, Grid, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AdvancedListToolbar from "../../components/search/AdvancedListToolbar.jsx";
import AdminNotificationsMenu from "../../components/admin/AdminNotificationsMenu.jsx";
import ConfirmTripDeleteModal from "../../components/admin/trips/ConfirmTripDeleteModal.jsx";
import CreateTripDrawer from "../../components/admin/trips/CreateTripDrawer.jsx";
import TripAdminCard from "../../components/admin/trips/TripAdminCard.jsx";
import TripWorkspaceDrawer from "../../components/admin/trips/TripWorkspaceDrawer.jsx";
import TripsBulkActionsBar from "../../components/admin/trips/TripsBulkActionsBar.jsx";
import { adminColors } from "../../components/admin/adminStyles.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAdminTripsStore } from "../../store/adminTripsStore.js";
import { filterTripsWorkspace, TRIP_FILTER_PILLS } from "../../utils/adminTrips.js";
import { ADMIN_TRIP_SORT_OPTIONS, applyAdvancedListQuery } from "../../utils/advancedSearch.js";

export default function AdminTripsPage() {
  const location = useLocation();
  const { showToast } = useToast();
  const trips = useAdminTripsStore((s) => s.trips);
  const addTrip = useAdminTripsStore((s) => s.addTrip);
  const updateTrip = useAdminTripsStore((s) => s.updateTrip);
  const duplicateTrip = useAdminTripsStore((s) => s.duplicateTrip);
  const archiveTrip = useAdminTripsStore((s) => s.archiveTrip);
  const publishTrip = useAdminTripsStore((s) => s.publishTrip);
  const softDeleteTrip = useAdminTripsStore((s) => s.softDeleteTrip);
  const bulkAction = useAdminTripsStore((s) => s.bulkAction);
  const aiGenerateTrip = useAdminTripsStore((s) => s.aiGenerateTrip);

  const [query, setQuery] = useState("");
  const [pill, setPill] = useState("all");
  const [sortKey, setSortKey] = useState("bookings-desc");
  const [selected, setSelected] = useState(new Set());
  const [hoveredId, setHoveredId] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (location.state?.openCreate) setCreateOpen(true);
  }, [location.state]);

  const filtered = useMemo(() => {
    const base = filterTripsWorkspace(trips, { query: "", pill });
    return applyAdvancedListQuery({
      items: base,
      query,
      getSearchableText: (t) =>
        `${t.title} ${t.country} ${t.destination} ${t.style} ${t.status} ${t.subtitle ?? ""}`,
      sortKey,
      sortDir: sortKey.includes("desc") ? "desc" : "asc",
      getSortValue: (t, key) => {
        if (key === "bookings-desc") return t.bookings ?? 0;
        if (key === "price-asc") return t.priceFrom;
        if (key === "title-asc") return t.title;
        return t.status;
      },
    });
  }, [trips, query, pill, sortKey]);
  const workspaceTrip = useMemo(
    () => trips.find((t) => t.id === workspaceId) ?? null,
    [trips, workspaceId],
  );

  const showCheckboxes = selected.size > 0 || hoveredId !== null;

  function toggleSelect(id, checked) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleMenuAction(action, trip) {
    if (action === "duplicate") {
      const copy = duplicateTrip(trip.id);
      showToast({ message: `Duplicated as ${copy?.title}`, severity: "success" });
    } else if (action === "archive") {
      archiveTrip(trip.id);
      showToast({ message: "Trip archived.", severity: "success" });
      if (workspaceId === trip.id) setWorkspaceId(null);
    } else if (action === "delete") {
      setDeleteTarget(trip);
    }
  }

  function handleBulk(action) {
    bulkAction([...selected], action);
    showToast({ message: `Bulk ${action} completed.`, severity: "success" });
    setSelected(new Set());
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight={800} sx={{ color: "#fff", letterSpacing: "-0.02em" }}>
          Trips
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AdminNotificationsMenu />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRounded />}
            onClick={() => setCreateOpen(true)}
            sx={{ fontWeight: 700, px: 2 }}
          >
            New trip
          </Button>
        </Stack>
      </Stack>

      <AdvancedListToolbar
        accent="admin"
        query={query}
        onQueryChange={setQuery}
        sort={sortKey}
        onSortChange={setSortKey}
        sortOptions={ADMIN_TRIP_SORT_OPTIONS}
        resultCount={filtered.length}
        placeholder="Full-text search trips…"
      />

      <Stack direction="row" spacing={0.75} sx={{ mb: 2.5 }}>
        {TRIP_FILTER_PILLS.map((f) => {
          const active = pill === f.id;
          return (
            <Chip
              key={f.id}
              label={f.label}
              size="small"
              onClick={() => setPill(f.id)}
              sx={{
                fontWeight: 600,
                bgcolor: active ? alpha(adminColors.gold, 0.15) : "transparent",
                color: active ? adminColors.gold : adminColors.textMuted,
                border: `1px solid ${active ? alpha(adminColors.gold, 0.4) : adminColors.border}`,
              }}
            />
          );
        })}
      </Stack>

      <TripsBulkActionsBar count={selected.size} onAction={handleBulk} onClear={() => setSelected(new Set())} />

      {filtered.length === 0 ? (
        <Typography sx={{ color: adminColors.textMuted, py: 6, textAlign: "center" }}>
          No trips match your search.
        </Typography>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((trip) => (
            <Grid key={trip.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Box
                onMouseEnter={() => setHoveredId(trip.id)}
                onMouseLeave={() => setHoveredId((id) => (id === trip.id ? null : id))}
              >
                <TripAdminCard
                  trip={trip}
                  selected={selected.has(trip.id)}
                  showCheckbox={showCheckboxes}
                  hovered={hoveredId === trip.id}
                  onSelect={toggleSelect}
                  onOpen={(t) => setWorkspaceId(t.id)}
                  onMenuAction={handleMenuAction}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <CreateTripDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(trip) => {
          addTrip({ ...trip, country: trip.country || trip.destination });
          showToast({ message: "Trip created.", severity: "success" });
        }}
        onAiGenerate={(prompt) => {
          const t = aiGenerateTrip(prompt);
          showToast({ message: `AI created: ${t.title}`, severity: "success" });
        }}
      />

      <TripWorkspaceDrawer
        trip={workspaceTrip}
        open={Boolean(workspaceTrip)}
        onClose={() => setWorkspaceId(null)}
        onUpdate={(draft) => {
          updateTrip(draft);
          showToast({ message: "Trip saved.", severity: "success" });
        }}
        onPublish={(t) => {
          publishTrip(t.id);
          showToast({ message: "Trip published.", severity: "success" });
        }}
        onMenuAction={handleMenuAction}
        onAiAction={(t, action) => {
          showToast({ message: `AI: ${action} applied to ${t.title}`, severity: "success" });
        }}
      />

      <ConfirmTripDeleteModal
        open={Boolean(deleteTarget)}
        trip={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          softDeleteTrip(deleteTarget.id);
          if (workspaceId === deleteTarget.id) setWorkspaceId(null);
          setDeleteTarget(null);
          showToast({ message: "Trip deleted.", severity: "info" });
        }}
      />
    </Box>
  );
}
