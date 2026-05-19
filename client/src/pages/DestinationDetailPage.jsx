import { ExploreRounded } from "../ui/icons.jsx";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useToast } from "../context/ToastContext.jsx";
import { useBookingStore } from "../store/bookingStore.js";
import AiTripChatFab from "../components/destination/explore/AiTripChatFab.jsx";
import AiSummaryBar from "../components/destination/explore/AiSummaryBar.jsx";
import CuratedDeparturesRow from "../components/destination/explore/CuratedDeparturesRow.jsx";
import DestinationExploreHero from "../components/destination/explore/DestinationExploreHero.jsx";
import ItineraryGeneratorDialog from "../components/destination/explore/ItineraryGeneratorDialog.jsx";
import SmartTripDrawer from "../components/destination/explore/SmartTripDrawer.jsx";
import StickyExploreFilters from "../components/destination/explore/StickyExploreFilters.jsx";
import StickyTripSummary from "../components/destination/StickyTripSummary.jsx";
import {
  getDestinationDetail,
  parseTripSearchParams,
  tripParamsToSearchParams,
} from "../utils/destinationSearch.js";
import {
  buildAiSummaryBar,
  buildCuratedDepartures,
  buildTripPackage,
  filtersSignature,
  getActiveFilterLabels,
  getAiHeroCopy,
} from "../utils/tripIntelligence.js";

const FILTER_REFRESH_MS = 700;

const SEARCH_DELAY_MS = 1400;

const defaultSmart = {
  bestWeather: false,
  luxuryOnly: false,
  nightlife: false,
  romantic: false,
  family: false,
  lowCrowd: false,
  shortestTravel: false,
};

export default function DestinationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const saveDraftFromConfigurator = useBookingStore((s) => s.saveDraftFromConfigurator);
  const continueBookingFromConfigurator = useBookingStore((s) => s.continueBookingFromConfigurator);
  const getBookingById = useBookingStore((s) => s.getBookingById);
  const dest = getDestinationDetail(id);

  const [editingBookingId, setEditingBookingId] = useState(() => searchParams.get("resume") || null);
  const resumeAppliedRef = useRef(null);

  const initialTrip = parseTripSearchParams(searchParams);
  const [filters, setFilters] = useState({
    start: initialTrip.start,
    end: initialTrip.end,
    guests: initialTrip.guests,
    budget: initialTrip.budget,
    travelClass: "economy",
    directOnly: false,
    smart: { ...defaultSmart },
  });

  const [selectedDepartureId, setSelectedDepartureId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [lastPrice, setLastPrice] = useState(null);
  const [compareDeparture, setCompareDeparture] = useState(null);
  const [filterRefreshing, setFilterRefreshing] = useState(false);
  const [livePackageQuote, setLivePackageQuote] = useState(null);
  const [packageSelections, setPackageSelections] = useState(null);
  const filterSig = useMemo(() => filtersSignature(filters), [filters]);
  const prevFilterSig = useRef(filterSig);
  const isFirstFilterRender = useRef(true);

  const heroMeta = useMemo(() => (dest ? getAiHeroCopy(dest) : null), [dest]);

  const departures = useMemo(
    () => (dest ? buildCuratedDepartures(dest, filters) : []),
    [dest, filters],
  );

  const activeFilterLabels = useMemo(() => getActiveFilterLabels(filters), [filters]);

  const summary = useMemo(
    () =>
      dest
        ? buildAiSummaryBar(dest, {
            start: filters.start,
            end: filters.end,
            guests: filters.guests,
            filters,
          })
        : null,
    [dest, filters],
  );

  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      prevFilterSig.current = filterSig;
      return;
    }
    if (prevFilterSig.current === filterSig) return;

    prevFilterSig.current = filterSig;
    setFilterRefreshing(true);
    setDrawerOpen(false);

    const timer = setTimeout(() => setFilterRefreshing(false), FILTER_REFRESH_MS);
    return () => clearTimeout(timer);
  }, [filterSig]);

  useEffect(() => {
    if (selectedDepartureId && !departures.some((d) => d.id === selectedDepartureId)) {
      setSelectedDepartureId(null);
      setDrawerOpen(false);
    }
  }, [departures, selectedDepartureId]);

  useEffect(() => {
    const resumeId = searchParams.get("resume");
    if (resumeId) setEditingBookingId(resumeId);
  }, [searchParams]);

  useEffect(() => {
    if (!dest || !editingBookingId || resumeAppliedRef.current === editingBookingId) return;
    if (!departures.length) return;

    const booking = getBookingById(editingBookingId);
    if (!booking || booking.destinationId !== dest.id) return;

    resumeAppliedRef.current = editingBookingId;

    setFilters((f) => ({
      ...f,
      start: booking.start,
      end: booking.end,
      guests: booking.guests,
    }));
    setPackageSelections({
      flightId: booking.selections?.flightId,
      hotelId: booking.selections?.hotelId,
      experienceIds: booking.selections?.experienceIds ?? [],
    });

    const match =
      departures.find((d) => d.start === booking.start && d.end === booking.end) ?? departures[0];
    if (match) setSelectedDepartureId(match.id);
    setDrawerOpen(true);
    showToast({ message: "Draft restored — continue customizing your trip.", severity: "info" });

    if (searchParams.get("resume")) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("resume");
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    }
  }, [dest, editingBookingId, departures, getBookingById, showToast, searchParams, setSearchParams]);

  const selectedDeparture = useMemo(
    () => departures.find((d) => d.id === selectedDepartureId) ?? null,
    [departures, selectedDepartureId],
  );

  const tripPackage = useMemo(() => {
    if (!dest || !selectedDeparture) return null;
    return buildTripPackage(dest, selectedDeparture, {
      guests: filters.guests,
      budget: filters.budget,
      travelClass: filters.travelClass,
      directOnly: filters.directOnly,
      smart: filters.smart,
      luxuryOnly: filters.smart.luxuryOnly,
    });
  }, [dest, selectedDeparture, filters]);

  const handlePackageChange = useCallback((quote, selections) => {
    setLivePackageQuote(quote);
    setPackageSelections(selections);
  }, []);

  const syncUrl = useCallback(
    (next) => {
      const merged = { ...filters, ...next };
      setSearchParams(
        tripParamsToSearchParams({
          start: merged.start,
          end: merged.end,
          guests: merged.guests,
          budget: merged.budget,
        }),
        { replace: true, preventScrollReset: true },
      );
    },
    [filters, setSearchParams],
  );

  function handleFiltersChange(next) {
    setFilters(next);
    syncUrl(next);
  }

  const buildConfiguratorPayload = useCallback(() => {
    if (!dest || !tripPackage || !selectedDeparture || !packageSelections) return null;
    return {
      destination: dest,
      tripPackage,
      departure: selectedDeparture,
      selections: packageSelections,
      liveQuote: livePackageQuote,
    };
  }, [dest, tripPackage, selectedDeparture, packageSelections, livePackageQuote]);

  function handleSaveDraft() {
    const payload = buildConfiguratorPayload();
    if (!payload) return;
    const booking = saveDraftFromConfigurator(payload, editingBookingId ?? undefined);
    setEditingBookingId(booking.id);
    showToast({ message: "Trip saved to your drafts.", severity: "success" });
    setDrawerOpen(false);
  }

  function handleContinueBooking() {
    const payload = buildConfiguratorPayload();
    if (!payload) return;
    const booking = continueBookingFromConfigurator(payload, editingBookingId ?? undefined);
    setEditingBookingId(booking.id);
    setDrawerOpen(false);
    navigate(`/bookings/${booking.id}`);
  }

  function handleCloseDrawer() {
    const payload = buildConfiguratorPayload();
    if (payload) {
      const booking = saveDraftFromConfigurator(payload, editingBookingId ?? undefined);
      setEditingBookingId(booking.id);
      showToast({ message: "Your trip was saved automatically.", severity: "info" });
    }
    setDrawerOpen(false);
    setLivePackageQuote(null);
    setPackageSelections(null);
  }

  function handleDepartureSelect(departure) {
    const prev = lastPrice;
    if (prev != null && departure.pricePerPerson < prev) {
      setComparison({
        previousPrice: prev,
        newPrice: departure.pricePerPerson,
        savings: prev - departure.pricePerPerson,
      });
    } else {
      setComparison(null);
    }
    setLastPrice(departure.pricePerPerson);
    setCompareDeparture(selectedDeparture);
    setSelectedDepartureId(departure.id);
    setFilters((f) => ({
      ...f,
      start: departure.start,
      end: departure.end,
      guests: departure.suggestedGuests,
      budget: String(departure.suggestedBudget),
    }));
    syncUrl({
      start: departure.start,
      end: departure.end,
      guests: departure.suggestedGuests,
      budget: String(departure.suggestedBudget),
    });

    setSearching(true);
    setDrawerOpen(false);
    setTimeout(() => {
      setSearching(false);
      setDrawerOpen(true);
    }, SEARCH_DELAY_MS);
  }

  if (!dest) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5">Destination not found</Typography>
        <Button component={RouterLink} to="/search" sx={{ mt: 2 }}>
          Explore destinations
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: selectedDepartureId ? 14 : 6 }}>
      <DestinationExploreHero destination={dest} heroMeta={heroMeta} />

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Stack spacing={3}>
          <AiSummaryBar summary={summary} />

          <StickyExploreFilters filters={filters} onChange={handleFiltersChange} />

          {comparison?.savings > 0 ? (
            <Typography
              variant="body2"
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "success.dark",
                color: "success.contrastText",
                fontWeight: 600,
              }}
            >
              Previous €{comparison.previousPrice.toLocaleString()} → New €{comparison.newPrice.toLocaleString()} · You
              save €{comparison.savings.toLocaleString()}
            </Typography>
          ) : null}

          <CuratedDeparturesRow
            departures={departures}
            selectedId={selectedDepartureId}
            onSelect={handleDepartureSelect}
            destinationImage={dest.image}
            loading={searching}
            filterRefreshing={filterRefreshing}
            activeFilters={activeFilterLabels}
            resultsKey={filterSig}
          />

          <Button component={RouterLink} to="/search" variant="text" startIcon={<ExploreRounded />}>
            Back to explore
          </Button>
        </Stack>
      </Container>

      <SmartTripDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        destination={dest}
        tripPackage={tripPackage}
        onPackageChange={handlePackageChange}
        onSaveDraft={handleSaveDraft}
        onContinueBooking={handleContinueBooking}
        onGenerateItinerary={() => setItineraryOpen(true)}
        onCompare={() => {
          if (compareDeparture && selectedDeparture) {
            showToast({
              message: `Comparing ${compareDeparture.label} vs ${selectedDeparture.label} — see savings in the summary bar.`,
              severity: "info",
            });
          }
        }}
      />

      <ItineraryGeneratorDialog
        open={itineraryOpen}
        onClose={() => setItineraryOpen(false)}
        destination={dest}
        itinerary={tripPackage?.itinerary}
      />

      <AiTripChatFab />

      <StickyTripSummary
        visible={Boolean(selectedDeparture && tripPackage)}
        destination={dest}
        start={filters.start}
        end={filters.end}
        guests={filters.guests}
        pricePerPerson={
          livePackageQuote?.perPerson ??
          selectedDeparture?.pricePerPerson
        }
        total={livePackageQuote?.total ?? tripPackage?.quote?.total}
        comparison={comparison}
        tripParams={{
          start: filters.start,
          end: filters.end,
          guests: filters.guests,
          budget: filters.budget,
          hotel: packageSelections?.hotelId,
          flight: packageSelections?.flightId,
          activities: packageSelections?.experienceIds?.join(","),
          total: livePackageQuote?.total,
        }}
        hotelTierId={packageSelections?.hotelId ?? "boutique"}
      />
    </Box>
  );
}
