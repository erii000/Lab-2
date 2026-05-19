import { FlightRounded, HotelRounded, LocalActivityRounded, StarRounded } from "../../ui/icons.jsx";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import AiSearchLoader from "./AiSearchLoader.jsx";

const tabs = [
  { key: "flights", label: "Flights", icon: <FlightRounded fontSize="small" /> },
  { key: "hotels", label: "Hotels", icon: <HotelRounded fontSize="small" /> },
  { key: "packages", label: "Experiences", icon: <LocalActivityRounded fontSize="small" /> },
];

function OfferCard({ item, highlighted }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: highlighted ? "primary.main" : "divider",
        bgcolor: highlighted ? (t) => alpha(t.palette.primary.main, 0.06) : "transparent",
        animation: "float-up 380ms ease",
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography fontWeight={700}>{item.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {item.meta}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
              <StarRounded sx={{ fontSize: 16, color: "warning.main" }} />
              <Typography variant="caption">{item.rating?.toFixed?.(1) ?? item.rating}</Typography>
            </Stack>
          </Box>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            €{item.price.toLocaleString()}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function TripOffersSection({
  sectionRef,
  loading,
  offers,
  aiInsight,
  weatherHint,
  selectedWindow,
}) {
  const [tab, setTab] = useState(0);
  const listKey = tabs[tab].key;
  const items = offers?.[listKey] ?? [];

  return (
    <Box ref={sectionRef} sx={{ scrollMarginTop: 96 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Your trip offers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Flights, stays, and experiences matched to your dates
          </Typography>
        </Box>
        {selectedWindow ? (
          <Chip label={`${selectedWindow.label} departure`} color="primary" variant="outlined" />
        ) : null}
      </Stack>

      {loading ? (
        <AiSearchLoader />
      ) : (
        <Stack spacing={2.5}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.secondary.main, 0.1),
              border: (t) => `1px solid ${alpha(t.palette.secondary.main, 0.28)}`,
            }}
          >
            <Typography variant="body2" fontWeight={600} color="secondary.light">
              {aiInsight}
            </Typography>
            {weatherHint ? (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.8, display: "block" }}>
                {weatherHint}
              </Typography>
            ) : null}
          </Paper>

          <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
              {tabs.map((t, i) => (
                <Tab key={t.key} icon={t.icon} iconPosition="start" label={t.label} value={i} />
              ))}
            </Tabs>
          </Paper>

          <Grid container spacing={2}>
            {items.map((item, i) => (
              <Grid key={item.id} size={{ xs: 12, md: 6 }}>
                <OfferCard item={item} highlighted={i === 0} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}
    </Box>
  );
}
