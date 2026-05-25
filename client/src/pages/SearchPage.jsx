import { MapRounded, ViewListRounded } from "../ui/icons.jsx";
import {
  Box,
  Button,
  Container,
  Drawer,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import AdvancedListToolbar from "../components/search/AdvancedListToolbar.jsx";
import VisionUploadAnalyzer from "../components/search/VisionUploadAnalyzer.jsx";
import ExploreAiBlock from "../components/explore/ExploreAiBlock.jsx";
import ExploreDestinationCard from "../components/explore/ExploreDestinationCard.jsx";
import ExploreFiltersSidebar from "../components/explore/ExploreFiltersSidebar.jsx";
import ExploreSearchSummary from "../components/explore/ExploreSearchSummary.jsx";
import ExploreTrending from "../components/explore/ExploreTrending.jsx";
import { useBookingStore } from "../store/bookingStore.js";
import { useExploreStore } from "../store/exploreStore.js";
import { buildDestinationUrl } from "../utils/destinationSearch.js";
import { buildItineraryPlannerUrl } from "../utils/itineraryPlanner.js";
import {
  buildExploreSearchParams,
  buildExploreUrl,
  getDiscoveryGroups,
  getTrendingDestinations,
  mapDestinationToCard,
  parseExploreParams,
  pushRecentSearch,
  runExploreSearch,
  sortExploreResults,
} from "../utils/exploreSearch.js";
import { fullTextMatch } from "../utils/advancedSearch.js";
import { designTokens } from "../theme/theme.js";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const savedIds = useBookingStore((s) => s.savedDestinations);
  const toggleSaved = useBookingStore((s) => s.toggleSavedDestination);

  const initial = useMemo(() => parseExploreParams(searchParams), [searchParams]);

  const [filters, setFilters] = useState(initial);
  const [sort, setSort] = useState(initial.sort);
  const [view, setView] = useState("list");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [ftQuery, setFtQuery] = useState("");

  useEffect(() => {
    const parsed = parseExploreParams(searchParams);
    setFilters(parsed);
    setSort(parsed.sort);
  }, [searchParams]);

  const searchResult = useMemo(() => runExploreSearch(filters), [filters]);
  const sortedResults = useMemo(
    () => sortExploreResults(searchResult.results, sort).map(mapDestinationToCard),
    [searchResult.results, sort],
  );

  const displayResults = useMemo(() => {
    if (!ftQuery.trim()) return sortedResults;
    return sortedResults.filter((d) =>
      fullTextMatch(d, ftQuery, (item) => `${item.title} ${item.country} ${item.badge ?? ""}`),
    );
  }, [sortedResults, ftQuery]);

  const tripParams = useMemo(
    () => ({
      start: filters.start,
      end: filters.end,
      guests: filters.travelers,
      budget: filters.budget,
    }),
    [filters],
  );

  const discoveryGroups = useMemo(() => getDiscoveryGroups(filters.destination), [filters.destination]);
  const trending = useMemo(() => getTrendingDestinations(), []);
  const recentSearches = useExploreStore((s) => s.recentSearches);

  const applyCriteria = useCallback(
    (next, { syncUrl = true } = {}) => {
      const merged = { ...filters, ...next };
      setFilters(merged);
      if (syncUrl) {
        const params = buildExploreSearchParams({ ...merged, sort });
        setSearchParams(params, { replace: true });
      }
      pushRecentSearch(merged);
    },
    [filters, sort, setSearchParams],
  );

  function handleFilterChange(next) {
    setFilters(next);
  }

  const countLabel =
    searchResult.mode === "validation"
      ? "Enter a destination"
      : searchResult.mode === "exact"
        ? `${displayResults.length} trip${displayResults.length !== 1 ? "s" : ""} found`
        : "No exact matches found";

  const showValidationError = searchResult.mode === "validation" && searchResult.validationError;

  return (
    <Box sx={{ bgcolor: designTokens.brand.obsidian, minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 }, pb: 8 }}>
        <ExploreSearchSummary
          criteria={filters}
          onApplySearch={(draft) => {
            applyCriteria(draft);
            navigate(buildExploreUrl({ ...draft, sort }));
          }}
          onToggleFilters={() => {
            if (window.matchMedia("(max-width:899px)").matches) {
              setMobileFilters(true);
            } else {
              setFiltersOpen((o) => !o);
            }
          }}
          filtersOpen={filtersOpen}
        />

        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{ display: { xs: "none", md: filtersOpen ? "block" : "none" } }}
          >
            <ExploreFiltersSidebar filters={filters} onChange={handleFilterChange} />
          </Grid>

          <Grid size={{ xs: 12, md: filtersOpen ? 9 : 12 }}>
            <VisionUploadAnalyzer />
            <AdvancedListToolbar
              query={ftQuery}
              onQueryChange={setFtQuery}
              sort={sort}
              onSortChange={setSort}
              sortOptions={[
                { value: "recommended", label: "Recommended" },
                { value: "price-low", label: "Price: low to high" },
                { value: "price-high", label: "Price: high to low" },
                { value: "rating", label: "Top rated" },
              ]}
              resultCount={displayResults.length}
              placeholder="Full-text search destinations…"
            />
            {showValidationError ? (
              <Typography
                variant="body2"
                color="error"
                sx={{ mb: 2, fontWeight: 600 }}
                role="alert"
              >
                {searchResult.validationError}
              </Typography>
            ) : null}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {countLabel}
                </Typography>
                {searchResult.mode === "alternatives" && filters.destination?.trim() ? (
                  <Typography variant="body2" color="error" sx={{ mt: 0.5, maxWidth: 520, fontWeight: 600 }}>
                    No exact match for &ldquo;{filters.destination.trim()}&rdquo;. Showing similar destinations
                    you may like.
                  </Typography>
                ) : searchResult.mode === "alternatives" ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 520 }}>
                    No trips matched your exact criteria. Here are similar destinations you may like.
                  </Typography>
                ) : null}
              </Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Sort by</InputLabel>
                  <Select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)}>
                    <MenuItem value="recommended">Recommended</MenuItem>
                    <MenuItem value="price-low">Price: low</MenuItem>
                    <MenuItem value="price-high">Price: high</MenuItem>
                    <MenuItem value="rating">Rating</MenuItem>
                  </Select>
                </FormControl>
                <ToggleButtonGroup size="small" value={view} exclusive onChange={(_, v) => v && setView(v)}>
                  <ToggleButton value="list">
                    <ViewListRounded sx={{ fontSize: 18, mr: 0.5 }} />
                    List
                  </ToggleButton>
                  <ToggleButton value="map">
                    <MapRounded sx={{ fontSize: 18, mr: 0.5 }} />
                    Map
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>

            {searchResult.aiInsight && searchResult.mode === "alternatives" ? (
              <Box
                sx={{
                  mb: 3,
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: alpha(designTokens.brand.charcoal, 0.6),
                  border: `1px solid ${alpha(designTokens.brand.gold, 0.1)}`,
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  {searchResult.aiInsight}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                  Try increasing your budget or explore similar destinations curated by AI.
                </Typography>
              </Box>
            ) : null}

            {view === "list" ? (
              <Grid container spacing={3}>
                {displayResults.map((dest) => (
                  <Grid key={dest.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <ExploreDestinationCard
                      destination={dest}
                      suggestReason={searchResult.mode === "alternatives" ? dest.badge : undefined}
                      itineraryTo={buildItineraryPlannerUrl(dest.id, {
                        ...tripParams,
                        travelers: tripParams.guests,
                        vibe: filters.experience || "romantic",
                      })}
                      tripTo={buildDestinationUrl(dest.id, {
                        start: tripParams.start,
                        end: tripParams.end,
                        guests: tripParams.guests,
                        budget: tripParams.budget,
                      })}
                      saved={savedIds.includes(dest.id)}
                      onToggleSave={toggleSaved}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                sx={{
                  height: 420,
                  borderRadius: 3,
                  border: `1px dashed ${alpha(designTokens.brand.gold, 0.2)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1,
                  bgcolor: alpha(designTokens.brand.charcoal, 0.35),
                }}
              >
                <MapRounded sx={{ fontSize: 40, color: "secondary.main", opacity: 0.8 }} />
                <Typography fontWeight={700}>Map view</Typography>
                <Typography variant="body2" color="text.secondary">
                  {displayResults.length} destinations on map
                </Typography>
              </Box>
            )}

            <ExploreAiBlock
              insight={searchResult.mode === "exact" ? searchResult.aiInsight : null}
              discoveryGroups={discoveryGroups}
              recentSearches={recentSearches}
              onDiscoveryClick={(g) => {
                if (g.criteria) applyCriteria(g.criteria);
                else if (g.filter) applyCriteria(g.filter);
              }}
            />

            <ExploreTrending
              destinations={trending}
              tripParams={tripParams}
              savedIds={savedIds}
              onToggleSave={toggleSaved}
            />

            <Button
              component={RouterLink}
              to={buildItineraryPlannerUrl(displayResults[0]?.id || "paris", {
                ...tripParams,
                travelers: tripParams.guests,
              })}
              variant="contained"
              size="large"
              fullWidth
              disabled={!displayResults.length}
              sx={{ mt: 6, py: 1.75, fontWeight: 800, borderRadius: 2.5, maxWidth: 400, mx: "auto", display: "block" }}
            >
              Build itinerary
            </Button>
          </Grid>
        </Grid>
      </Container>

      <Drawer anchor="left" open={mobileFilters} onClose={() => setMobileFilters(false)}>
        <Box sx={{ width: 300, p: 2 }}>
          <ExploreFiltersSidebar filters={filters} onChange={handleFilterChange} />
        </Box>
      </Drawer>
    </Box>
  );
}
