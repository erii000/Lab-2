import { CameraAltRounded, MapRounded, SpaRounded, ViewListRounded } from "../ui/icons.jsx";
import {
  Alert,
  Box,
  Button,
  CardMedia,
  Container,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import ListingCard from "../components/cards/ListingCard.jsx";
import FiltersPanel from "../components/filters/FiltersPanel.jsx";
import HeroSearchBar from "../components/search/HeroSearchBar.jsx";
import SectionHeading from "../components/common/SectionHeading.jsx";
import { buildDestinationUrl, resolveDestinationId, searchDestinations, tripParamsToSearchParams } from "../utils/destinationSearch.js";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const budgetParam = params.get("budget");
  const [view, setView] = useState("list");
  const [filters, setFilters] = useState({
    location: q,
    budget: budgetParam ? Number(budgetParam) : 5000,
    type: "",
  });

  const results = useMemo(
    () =>
      searchDestinations({
        query: filters.location || q,
        budget: filters.budget,
        tripType: filters.type || undefined,
      }),
    [filters.location, filters.budget, filters.type, q],
  );

  const resolvedId = resolveDestinationId(filters.location || q);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <SectionHeading
        eyebrow="Explore"
        title="Search destinations & services"
        subtitle="Filter by budget and trip style — select a city for live dates, activities, and booking."
      />

      <Box sx={{ mb: 4 }}>
        <HeroSearchBar compact defaultQuery={q} ctaLabel="Find destination" />
      </Box>

      {resolvedId && (filters.location || q) ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Did you mean{" "}
          <Button
            component={RouterLink}
            size="small"
            to={buildDestinationUrl(resolvedId, tripParamsToSearchParams({
              start: params.get("start"),
              end: params.get("end"),
              guests: params.get("guests"),
              budget: params.get("budget"),
            }))}
            sx={{ verticalAlign: "baseline", textTransform: "none", fontWeight: 700 }}
          >
            {resolvedId.replace(/-/g, " ")}
          </Button>
          ? Open the full city page for dates and booking.
        </Alert>
      ) : null}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            title: "Luxury Beach",
            subtitle: "Bali, Dubai & coastal escapes",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            icon: <SpaRounded sx={{ fontSize: 18 }} />,
            filter: "Relaxing",
          },
          {
            title: "City Nightlife",
            subtitle: "Paris, New York, Barcelona",
            image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
            icon: <CameraAltRounded sx={{ fontSize: 18 }} />,
            filter: "City",
          },
          {
            title: "Culture & Heritage",
            subtitle: "Rome, Istanbul, Tokyo",
            image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
            icon: <MapRounded sx={{ fontSize: 18 }} />,
            filter: "Culture",
          },
        ].map((spot) => (
          <Grid key={spot.title} size={{ xs: 12, md: 4 }}>
            <Box
              component="button"
              type="button"
              onClick={() => setFilters((f) => ({ ...f, type: spot.filter }))}
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                border: (t) => `1px solid ${t.palette.divider}`,
                width: "100%",
                p: 0,
                cursor: "pointer",
                textAlign: "left",
                bgcolor: "transparent",
              }}
            >
              <CardMedia component="img" image={spot.image} height="156" alt="" />
              <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.78))" }} />
              <Stack direction="row" spacing={1} alignItems="center" sx={{ position: "absolute", left: 12, bottom: 10, right: 12 }}>
                {spot.icon}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: "common.white", fontWeight: 700 }}>
                    {spot.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha("#fff", 0.84) }}>
                    {spot.subtitle}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <FiltersPanel
            defaultLocation={q}
            budgetMax={8000}
            onChange={(next) => setFilters((f) => ({ ...f, ...next }))}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" gap={2}>
            <Typography variant="body2" color="text.secondary">
              {results.length} destination{results.length !== 1 ? "s" : ""}
              {filters.location || q ? ` · “${filters.location || q}”` : ""}
              {filters.type ? ` · ${filters.type}` : ""}
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={view}
              exclusive
              onChange={(_, v) => v && setView(v)}
              aria-label="result view"
            >
              <ToggleButton value="list">
                <ViewListRounded sx={{ mr: 0.5, fontSize: 20 }} />
                List
              </ToggleButton>
              <ToggleButton value="map">
                <MapRounded sx={{ mr: 0.5, fontSize: 20 }} />
                Map
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {view === "list" ? (
            <Grid container spacing={2}>
              {results.length ? (
                results.map((d) => (
                  <Grid key={d.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <ListingCard
                      {...d}
                      linkTo={buildDestinationUrl(d.id, tripParamsToSearchParams({
                        start: params.get("start"),
                        end: params.get("end"),
                        guests: params.get("guests"),
                        budget: params.get("budget") || filters.budget,
                      }))}
                    />
                  </Grid>
                ))
              ) : (
                <Grid size={12}>
                  <Alert severity="warning">No destinations match your filters. Try raising your budget or clearing trip type.</Alert>
                </Grid>
              )}
            </Grid>
          ) : (
            <Box
              sx={{
                height: { xs: 300, sm: 380, md: 480 },
                borderRadius: 2,
                border: (t) => `1px dashed ${t.palette.divider}`,
                bgcolor: alpha("#0369a1", 0.06),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
                px: 2,
              }}
            >
              <MapRounded color="primary" sx={{ fontSize: 48, opacity: 0.8 }} />
              <Typography variant="h6">Interactive map</Typography>
              <Typography color="text.secondary" align="center" maxWidth={440}>
                Showing {results.length} cities — map markers ready for Mapbox or Google Maps SDK integration.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" useFlexGap>
                {results.slice(0, 6).map((d) => (
                  <Button key={d.id} component={RouterLink} to={buildDestinationUrl(d.id)} size="small" variant="outlined">
                    {d.title}
                  </Button>
                ))}
              </Stack>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
