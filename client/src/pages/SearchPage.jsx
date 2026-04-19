import { CameraAltRounded, MapRounded, SpaRounded, ViewListRounded } from "../ui/icons.jsx";
import { Box, Button, CardMedia, Container, Grid, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import ListingCard from "../components/cards/ListingCard.jsx";
import FiltersPanel from "../components/filters/FiltersPanel.jsx";
import SectionHeading from "../components/common/SectionHeading.jsx";
import { mockSearchResults } from "../data/mockDestinations.js";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const [view, setView] = useState("list");

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <SectionHeading
        eyebrow="Explore"
        title="Search destinations & services"
        subtitle="Filters update this list; map view is reserved for GeoJSON / Mapbox integration."
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            title: "Luxury Beach",
            subtitle: "Handpicked premium coastlines",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            icon: <SpaRounded sx={{ fontSize: 18 }} />,
          },
          {
            title: "City Nightlife",
            subtitle: "Iconic skyline + nightlife routes",
            image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
            icon: <CameraAltRounded sx={{ fontSize: 18 }} />,
          },
          {
            title: "Curated Views",
            subtitle: "Perfect photo spots and tours",
            image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
            icon: <MapRounded sx={{ fontSize: 18 }} />,
          },
        ].map((spot) => (
          <Grid key={spot.title} size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", border: (t) => `1px solid ${t.palette.divider}` }}>
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
          <FiltersPanel defaultLocation={q} />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" gap={2}>
            <Typography variant="body2" color="text.secondary">
              {mockSearchResults.length} results · query: {q || "—"}
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
              {mockSearchResults.map((d) => (
                <Grid key={d.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <ListingCard {...d} />
                </Grid>
              ))}
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
              <Typography variant="h6">Map view</Typography>
              <Typography color="text.secondary" align="center" maxWidth={440}>
                Drop in your map provider (Mapbox, Google Maps, Leaflet). Pass the same filtered result set as markers.
              </Typography>
              <Button variant="outlined" size="small" disabled>
                Connect map SDK
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
