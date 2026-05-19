import {
  AcUnitRounded,
  AutoAwesomeRounded,
  CloseRounded,
  FlightRounded,
  HotelRounded,
  LocalActivityRounded,
  MapRounded,
  TimelineRounded,
  TrendingUpRounded,
  VerifiedRounded,
  WbSunnyRounded,
} from "../../../ui/icons.jsx";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  IconButton,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { computeCustomTripQuote } from "../../../utils/tripIntelligence.js";
import { designTokens } from "../../../theme/theme.js";
import BookingProgressBar from "../../bookings/BookingProgressBar.jsx";

const TABS = [
  { id: "overview", label: "Overview", icon: MapRounded },
  { id: "weather", label: "Weather", icon: WbSunnyRounded },
  { id: "flights", label: "Flights", icon: FlightRounded },
  { id: "hotels", label: "Hotels", icon: HotelRounded },
  { id: "experiences", label: "Experiences", icon: LocalActivityRounded },
  { id: "insights", label: "AI Intel", icon: AutoAwesomeRounded },
];

const MODAL_WIDTH = 600;
const BODY_HEIGHT = "min(52vh, 420px)";

const panelSx = {
  borderRadius: 2,
  border: `1px solid ${alpha(designTokens.brand.gold, 0.14)}`,
  bgcolor: alpha(designTokens.brand.graphite, 0.55),
  backdropFilter: "blur(12px)",
};

export default function SmartTripDrawer({
  open,
  onClose,
  destination,
  tripPackage,
  onGenerateItinerary,
  onCompare,
  onPackageChange,
  onSaveDraft,
  onContinueBooking,
}) {
  const [tab, setTab] = useState(0);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [selectedExperienceIds, setSelectedExperienceIds] = useState(() => new Set());

  useEffect(() => {
    if (!open) {
      setTab(0);
      return;
    }
    if (!tripPackage) return;

    const defaultFlight = tripPackage.flights.find((f) => f.recommended) ?? tripPackage.flights[0];
    const defaultHotel = tripPackage.hotels.find((h) => h.recommended) ?? tripPackage.hotels[0];
    setSelectedFlightId(defaultFlight?.id ?? null);
    setSelectedHotelId(defaultHotel?.id ?? null);
    setSelectedExperienceIds(
      new Set(tripPackage.experiences.filter((e) => e.recommended).map((e) => e.id)),
    );
  }, [open, tripPackage]);

  const liveQuote = useMemo(() => {
    if (!tripPackage) return null;
    const { flights, hotels, experiences, quote, budgetMeter } = tripPackage;
    const flight = flights.find((f) => f.id === selectedFlightId) ?? flights[0];
    const hotel = hotels.find((h) => h.id === selectedHotelId) ?? hotels[0];
    const pickedExperiences = experiences.filter((e) => selectedExperienceIds.has(e.id));

    return computeCustomTripQuote({
      flightPrice: flight?.priceTotal ?? 0,
      hotelTotal: hotel?.total ?? 0,
      guests: quote.guests,
      experiences: pickedExperiences,
      budget: budgetMeter?.budget,
    });
  }, [tripPackage, selectedFlightId, selectedHotelId, selectedExperienceIds]);

  const liveBudgetMeter = useMemo(() => {
    if (!liveQuote) return null;
    return {
      flight: liveQuote.flight,
      hotel: liveQuote.hotel,
      experiences: liveQuote.experiences,
      total: liveQuote.total,
      budget: tripPackage?.budgetMeter?.budget ?? null,
    };
  }, [liveQuote, tripPackage?.budgetMeter?.budget]);

  useEffect(() => {
    if (!liveQuote || !onPackageChange) return;
    onPackageChange(liveQuote, {
      flightId: selectedFlightId,
      hotelId: selectedHotelId,
      experienceIds: [...selectedExperienceIds],
    });
  }, [liveQuote, selectedFlightId, selectedHotelId, selectedExperienceIds, onPackageChange]);

  const configProgress = useMemo(() => {
    let p = 35;
    if (selectedFlightId && selectedHotelId) p += 15;
    if (selectedExperienceIds.size > 0) p += 5;
    return Math.min(p, 55);
  }, [selectedFlightId, selectedHotelId, selectedExperienceIds]);

  if (!tripPackage || !destination) return null;

  const { departure, quote, overview, weatherForecast, flights, hotels, experiences, insights, budgetMeter, weatherAlert } =
    tripPackage;

  const dateRange = `${departure.label} → ${departure.endLabel}`;
  const nights = Math.max(1, Math.round((new Date(departure.end) - new Date(departure.start)) / 86400000));
  const selectedFlight = flights.find((f) => f.id === selectedFlightId) ?? flights[0];
  const selectedHotel = hotels.find((h) => h.id === selectedHotelId) ?? hotels[0];
  const displayQuote = liveQuote ?? quote;

  function toggleExperience(id) {
    setSelectedExperienceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      scroll="paper"
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: alpha("#070b14", 0.82),
            backdropFilter: "blur(12px)",
          },
        },
        container: {
          sx: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        paper: {
          sx: {
            width: { xs: "calc(100vw - 24px)", sm: MODAL_WIDTH },
            maxWidth: "100%",
            maxHeight: "min(90vh, 780px)",
            m: 0,
            bgcolor: designTokens.brand.obsidian,
            backgroundImage: `linear-gradient(168deg, ${alpha(designTokens.brand.graphite, 0.92)} 0%, ${designTokens.brand.obsidian} 48%, #080a0f 100%)`,
            border: `1px solid ${alpha(designTokens.brand.gold, 0.2)}`,
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: `0 32px 80px ${alpha("#000", 0.55)}`,
          },
        },
      }}
    >
      {/* Compact header */}
      <Box
        sx={{
          position: "relative",
          flexShrink: 0,
          px: 2,
          pt: 1.75,
          pb: 1.5,
          borderBottom: `1px solid ${alpha(designTokens.brand.gold, 0.12)}`,
          background: `linear-gradient(90deg, ${alpha(designTokens.brand.navyDark, 0.35)} 0%, transparent 70%)`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            component="img"
            src={destination.image}
            alt=""
            sx={{
              width: 52,
              height: 52,
              borderRadius: 1.5,
              objectFit: "cover",
              border: `1px solid ${alpha(designTokens.brand.gold, 0.25)}`,
              flexShrink: 0,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0, pr: 4 }}>
            <Typography variant="caption" sx={{ color: designTokens.brand.navy, fontWeight: 800, letterSpacing: "0.12em" }}>
              SMART TRIP
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ letterSpacing: "-0.02em" }}>
              {departure.packageTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {destination.title} · {dateRange}
            </Typography>
          </Box>
          <AiScoreRing score={departure.aiScore} size={52} />
          <IconButton
            onClick={onClose}
            aria-label="Close"
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              bgcolor: alpha("#0b0d12", 0.6),
              border: `1px solid ${alpha("#fff", 0.1)}`,
            }}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.25 }}>
          <StatChip label="Total" value={`€${displayQuote.total.toLocaleString()}`} highlight />
          <StatChip label="Guests" value={`${quote.guests}`} />
          <StatChip label="Nights" value={`${nights}`} />
          <StatChip label="Class" value={departure.travelClass ?? "economy"} />
        </Stack>
      </Box>

      {weatherAlert ? (
        <Box
          sx={{
            flexShrink: 0,
            mx: 2,
            mt: 1.25,
            px: 1.25,
            py: 0.75,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            bgcolor: alpha("#f59e0b", 0.1),
            border: `1px solid ${alpha("#f59e0b", 0.3)}`,
          }}
        >
          <AcUnitRounded sx={{ fontSize: 16, color: "warning.light" }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: alpha("#fde68a", 0.95), lineHeight: 1.35 }}>
            {weatherAlert}
          </Typography>
        </Box>
      ) : null}

      {/* Sidebar + content */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          maxHeight: BODY_HEIGHT,
        }}
      >
        <Tabs
          orientation="vertical"
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          sx={{
            flexShrink: 0,
            width: 108,
            borderRight: `1px solid ${alpha(designTokens.brand.gold, 0.1)}`,
            bgcolor: alpha("#0b0d12", 0.35),
            "& .MuiTabs-flexContainer": { gap: 0.25 },
            "& .MuiTab-root": {
              minHeight: 52,
              minWidth: 0,
              px: 1,
              py: 1,
              alignItems: "center",
              textTransform: "none",
              fontSize: "0.68rem",
              fontWeight: 600,
              color: alpha("#fff", 0.5),
            },
            "& .Mui-selected": {
              color: designTokens.brand.champagne,
              bgcolor: alpha(designTokens.brand.navy, 0.25),
            },
            "& .MuiTabs-indicator": {
              left: 0,
              width: 3,
              background: `linear-gradient(180deg, ${designTokens.brand.navy}, ${designTokens.brand.gold})`,
            },
          }}
        >
          {TABS.map(({ label, icon: Icon }) => (
            <Tab
              key={label}
              label={label}
              icon={<Icon sx={{ fontSize: 17 }} />}
              iconPosition="top"
              sx={{ gap: 0.35 }}
            />
          ))}
        </Tabs>

        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            minHeight: 0,
            minWidth: 0,
            p: 1.75,
          }}
        >
          {tab === 0 && (
            <Stack spacing={1.5}>
              <BudgetMeter meter={liveBudgetMeter ?? budgetMeter} compact />
              <SelectionSummary flight={selectedFlight} hotel={selectedHotel} experienceCount={selectedExperienceIds.size} />
              <Stack spacing={0.75}>
                {overview.bullets.map((b) => (
                  <Typography key={b} variant="body2" sx={{ color: alpha("#fff", 0.8), lineHeight: 1.45, pl: 1.5, textIndent: "-0.75rem" }}>
                    · {b}
                  </Typography>
                ))}
              </Stack>
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
                {weatherForecast.map((row) => (
                  <Box
                    key={row.day}
                    sx={{
                      ...panelSx,
                      flex: "0 0 72px",
                      p: 1,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", fontWeight: 700 }}>
                      {row.day}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {row.temp}°
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                      {row.rain}%
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <InsightBlock
                title="Golden hour"
                text={`Best sunset on ${weatherForecast[2]?.day ?? departure.label} ~20:47.`}
                icon={WbSunnyRounded}
                compact
              />
            </Stack>
          )}

          {tab === 2 && (
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                Tap to select · price updates live
              </Typography>
              {flights.map((f) => (
                <FlightCard
                  key={f.id}
                  flight={f}
                  selected={f.id === selectedFlightId}
                  onSelect={() => setSelectedFlightId(f.id)}
                />
              ))}
            </Stack>
          )}

          {tab === 3 && (
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                Tap to select your stay
              </Typography>
              {hotels.map((h) => (
                <HotelCard
                  key={h.id}
                  hotel={h}
                  selected={h.id === selectedHotelId}
                  onSelect={() => setSelectedHotelId(h.id)}
                />
              ))}
            </Stack>
          )}

          {tab === 4 && (
            <Stack spacing={0.75}>
              {experiences.map((exp) => (
                <ExperienceRow
                  key={exp.id}
                  experience={exp}
                  selected={selectedExperienceIds.has(exp.id)}
                  onToggle={() => toggleExperience(exp.id)}
                  guests={quote.guests}
                />
              ))}
            </Stack>
          )}

          {tab === 5 && (
            <Stack spacing={1}>
              <InsightBlock title="Booking" text={insights.booking} icon={TimelineRounded} accent="gold" compact />
              <InsightBlock title="Crowds" text={insights.crowd} icon={TrendingUpRounded} accent="navy" compact />
              <InsightBlock title="Weather" text={insights.weather} icon={WbSunnyRounded} accent="gold" compact />
            </Stack>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1.5,
          borderTop: `1px solid ${alpha(designTokens.brand.gold, 0.15)}`,
          bgcolor: alpha("#0b0d12", 0.92),
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Package total
            </Typography>
            <Typography variant="h6" fontWeight={800} sx={{ color: designTokens.brand.champagne }}>
              €{displayQuote.total.toLocaleString()}
            </Typography>
          </Stack>
          <BookingProgressBar value={configProgress} />
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={onSaveDraft}
              sx={{ fontWeight: 700, borderRadius: 2, py: 1 }}
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={onContinueBooking}
              sx={{ fontWeight: 800, borderRadius: 2, py: 1 }}
            >
              Continue Booking
            </Button>
          </Stack>
          <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap" useFlexGap>
            <Button variant="text" size="small" onClick={onGenerateItinerary} sx={{ fontSize: "0.72rem" }}>
              Itinerary
            </Button>
            <Button variant="text" size="small" onClick={onCompare} sx={{ fontSize: "0.72rem" }}>
              Compare
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
}

function AiScoreRing({ score, size = 52 }) {
  const inset = Math.round(size * 0.12);
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={2.5}
        sx={{ position: "absolute", color: alpha("#fff", 0.08) }}
      />
      <CircularProgress
        variant="determinate"
        value={score}
        size={size}
        thickness={2.5}
        sx={{
          position: "absolute",
          color: designTokens.brand.gold,
          "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset,
          borderRadius: "50%",
          bgcolor: alpha("#0b0d12", 0.8),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" fontWeight={800} lineHeight={1} sx={{ fontSize: size > 60 ? "1rem" : "0.8rem" }}>
          {score}
        </Typography>
      </Box>
    </Box>
  );
}

function StatChip({ label, value, highlight }) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.35,
        borderRadius: 1,
        bgcolor: highlight ? alpha(designTokens.brand.gold, 0.12) : alpha("#fff", 0.04),
        border: `1px solid ${highlight ? alpha(designTokens.brand.gold, 0.35) : alpha("#fff", 0.08)}`,
      }}
    >
      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.62rem", display: "block", lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="caption" fontWeight={800} sx={{ textTransform: "capitalize", fontSize: "0.72rem" }}>
        {value}
      </Typography>
    </Box>
  );
}

function selectableSx(selected) {
  return {
    cursor: "pointer",
    transition: "border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease",
    border: `2px solid ${selected ? designTokens.brand.gold : alpha("#fff", 0.1)}`,
    bgcolor: selected ? alpha(designTokens.brand.gold, 0.08) : alpha(designTokens.brand.graphite, 0.4),
    boxShadow: selected ? `0 0 28px ${alpha(designTokens.brand.gold, 0.15)}` : "none",
    "&:hover": {
      borderColor: selected ? designTokens.brand.gold : alpha(designTokens.brand.gold, 0.45),
      transform: "translateY(-1px)",
    },
  };
}

function SelectionSummary({ flight, hotel, experienceCount }) {
  if (!flight && !hotel) return null;
  return (
    <Box sx={{ ...panelSx, p: 1.25 }}>
      <Typography variant="caption" fontWeight={800} color="primary.main" display="block" sx={{ mb: 0.5 }}>
        Your picks
      </Typography>
      {flight ? (
        <Typography variant="caption" display="block" sx={{ lineHeight: 1.4 }}>
          Flight · {flight.airline} · €{flight.priceTotal.toLocaleString()}
        </Typography>
      ) : null}
      {hotel ? (
        <Typography variant="caption" display="block" sx={{ lineHeight: 1.4 }}>
          Hotel · {hotel.name} · €{hotel.total.toLocaleString()}
        </Typography>
      ) : null}
      <Typography variant="caption" color="text.secondary">
        {experienceCount} experience{experienceCount !== 1 ? "s" : ""}
      </Typography>
    </Box>
  );
}

function InsightBlock({ title, text, icon: Icon, accent = "navy", compact }) {
  const color = accent === "gold" ? designTokens.brand.gold : designTokens.brand.navy;
  return (
    <Box
      sx={{
        p: compact ? 1.25 : 2,
        borderRadius: 2,
        bgcolor: alpha(designTokens.brand.graphite, 0.5),
        borderLeft: `3px solid ${color}`,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Icon sx={{ fontSize: compact ? 16 : 20, color, mt: 0.15 }} />
        <Box>
          <Typography variant="caption" fontWeight={800} display="block">
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45 }}>
            {text}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function FlightCard({ flight, selected, onSelect }) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={selected}
      sx={{
        p: 1.25,
        borderRadius: 2,
        ...selectableSx(selected),
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <FlightRounded sx={{ color: "primary.main", fontSize: 17 }} />
            <Typography variant="body2" fontWeight={800}>
              {flight.airline}
            </Typography>
            {selected ? (
              <Chip icon={<VerifiedRounded sx={{ fontSize: 14 }} />} label="Selected" size="small" color="primary" />
            ) : flight.recommended ? (
              <Chip label="AI pick" size="small" variant="outlined" color="primary" />
            ) : null}
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block">
            {flight.departure} → {flight.arrival}
          </Typography>
        </Box>
        <Typography variant="body2" fontWeight={800} sx={{ color: designTokens.brand.champagne, flexShrink: 0 }}>
          €{flight.priceTotal.toLocaleString()}
        </Typography>
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.75 }}>
        {[flight.baggage, flight.lounge ? "Lounge" : "Standard gate", flight.cancellation, `Carbon ${flight.carbonScore}`].map(
          (tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: "0.7rem", height: 24 }} />
          ),
        )}
      </Stack>
    </Box>
  );
}

function HotelCard({ hotel, selected, onSelect }) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={selected}
      sx={{
        p: 1.25,
        borderRadius: 2,
        ...selectableSx(selected),
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <HotelRounded color="primary" sx={{ fontSize: 17 }} />
            <Typography variant="body2" fontWeight={800}>
              {hotel.name}
            </Typography>
            {selected ? (
              <Chip icon={<VerifiedRounded sx={{ fontSize: 14 }} />} label="Selected" size="small" color="primary" />
            ) : hotel.recommended ? (
              <Chip label="Top match" size="small" variant="outlined" color="primary" />
            ) : null}
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block">
            ★ {hotel.rating} · {hotel.distanceKm} km · {hotel.spa ? "Spa" : "City"}
          </Typography>
        </Box>
        <Typography variant="body2" fontWeight={800} sx={{ color: designTokens.brand.champagne, flexShrink: 0 }}>
          €{hotel.total.toLocaleString()}
        </Typography>
      </Stack>
    </Box>
  );
}

function ExperienceRow({ experience, selected, onToggle, guests }) {
  const lineTotal = experience.price * guests;
  return (
    <Stack
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-pressed={selected}
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      sx={{
        p: 1,
        borderRadius: 1.5,
        ...selectableSx(selected),
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: selected ? alpha(designTokens.brand.gold, 0.25) : alpha("#fff", 0.06),
          color: selected ? "primary.main" : "text.secondary",
          border: `2px solid ${selected ? designTokens.brand.gold : alpha("#fff", 0.15)}`,
        }}
      >
        {selected ? <VerifiedRounded sx={{ fontSize: 18 }} /> : <LocalActivityRounded sx={{ fontSize: 18 }} />}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap>
          {experience.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {selected ? "Included" : "Tap to add"} · €{experience.price}/pp
        </Typography>
      </Box>
      <Typography variant="caption" fontWeight={800} sx={{ color: designTokens.brand.champagne, flexShrink: 0 }}>
        €{lineTotal.toLocaleString()}
      </Typography>
    </Stack>
  );
}

function BudgetMeter({ meter, compact }) {
  if (!meter) return null;
  const pct = meter.budget ? Math.min(100, (meter.total / meter.budget) * 100) : 68;
  const segments = [
    { label: "Flight", value: meter.flight, color: designTokens.brand.navy },
    { label: "Hotel", value: meter.hotel, color: designTokens.brand.gold },
    { label: "Exp.", value: meter.experiences, color: "#6fa8dc" },
  ];
  const totalSeg = segments.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <Box sx={{ ...panelSx, p: compact ? 1.25 : 2.5 }}>
      <Stack direction="row" sx={{ height: 6, borderRadius: 3, overflow: "hidden", mb: 1 }}>
        {segments.map((seg) => (
          <Box
            key={seg.label}
            sx={{
              width: `${(seg.value / totalSeg) * 100}%`,
              bgcolor: seg.color,
              minWidth: seg.value > 0 ? 3 : 0,
            }}
          />
        ))}
      </Stack>
      <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={0.5}>
        {segments.map((seg) => (
          <Typography key={seg.label} variant="caption" color="text.secondary">
            {seg.label} €{seg.value.toLocaleString()}
          </Typography>
        ))}
      </Stack>
      {meter.budget ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {pct.toFixed(0)}% of €{meter.budget.toLocaleString()} budget
        </Typography>
      ) : null}
    </Box>
  );
}
