import { AutoAwesomeRounded, FilterListRounded } from "../../../ui/icons.jsx";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import AiSearchLoader from "../AiSearchLoader.jsx";
import CuratedDepartureCard from "./CuratedDepartureCard.jsx";
import NavyHorizontalScroll from "./NavyHorizontalScroll.jsx";

export default function CuratedDeparturesRow({
  departures,
  selectedId,
  onSelect,
  destinationImage,
  loading,
  filterRefreshing,
  activeFilters = [],
  resultsKey,
}) {
  const empty = !loading && !filterRefreshing && departures.length === 0;

  return (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={1.5} sx={{ mb: 1.5 }}>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            Curated departures
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading || filterRefreshing
              ? "Recalculating options for your filters…"
              : `${departures.length} trip${departures.length !== 1 ? "s" : ""} matched · prices update live`}
          </Typography>
        </Box>
        {activeFilters.length ? (
          <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap" useFlexGap>
            <FilterListRounded sx={{ fontSize: 16, color: "primary.main" }} />
            {activeFilters.map((label) => (
              <Chip key={label} label={label} size="small" color="primary" variant="outlined" />
            ))}
          </Stack>
        ) : null}
      </Stack>

      {(loading || filterRefreshing) && (
        <Box sx={{ mb: 2 }}>
          <AiSearchLoader message="Updating trips for your filters" />
        </Box>
      )}

      {empty ? (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            border: (t) => `1px dashed ${alpha(t.palette.primary.main, 0.35)}`,
          }}
        >
          <AutoAwesomeRounded color="primary" sx={{ mb: 1 }} />
          <Typography fontWeight={600}>No trips match these filters</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Try raising your budget, switching class, or turning off a smart filter.
          </Typography>
        </Box>
      ) : (
        <NavyHorizontalScroll
          key={resultsKey}
          sx={{
            pb: 0.5,
            opacity: filterRefreshing ? 0.35 : 1,
            transition: "opacity 350ms ease",
            pointerEvents: filterRefreshing ? "none" : "auto",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ width: "max-content", minWidth: "100%" }}>
            {departures.map((d) => (
              <CuratedDepartureCard
                key={d.id}
                departure={d}
                selected={selectedId === d.id}
                onSelect={onSelect}
                image={destinationImage}
              />
            ))}
          </Stack>
        </NavyHorizontalScroll>
      )}
    </Box>
  );
}
