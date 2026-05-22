import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AssistantBudgetSummary from "../components/assistant/AssistantBudgetSummary.jsx";
import AssistantItineraryAccordion from "../components/assistant/AssistantItineraryAccordion.jsx";
import AssistantResultCard from "../components/assistant/AssistantResultCard.jsx";
import { buildTripPlan, suggestionChips } from "../components/assistant/assistantData.js";
import { designTokens } from "../theme/theme.js";

const CONTENT_MAX = 680;

export default function AiAssistantPage() {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState(null);
  const [sending, setSending] = useState(false);
  const [expandedDay, setExpandedDay] = useState(false);
  const [toast, setToast] = useState("");

  async function generateTrip(text) {
    const q = (text ?? query).trim();
    if (!q || sending) return;

    setSending(true);
    setPlan(null);
    setExpandedDay(false);
    await new Promise((r) => setTimeout(r, 800));
    setPlan(buildTripPlan(q));
    setSending(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    generateTrip();
  }

  function handleChip(chip) {
    setQuery(chip.query);
    generateTrip(chip.query);
  }

  function handleRegenerate() {
    generateTrip(query);
  }

  function handleEdit() {
    inputRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSave() {
    setToast("Trip saved to your itinerary.");
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: plan?.title, text: plan?.summary }).catch(() => {});
    } else {
      setToast("Link copied to clipboard.");
      navigator.clipboard?.writeText(window.location.href);
    }
  }

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        py: { xs: 5, md: 8 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ maxWidth: CONTENT_MAX, mx: "auto" }}>
        {/* Top — title, input, chips only */}
        <Stack spacing={1} sx={{ mb: 5 }}>
          <Typography variant="h4" component="h1" fontWeight={800} sx={{ letterSpacing: "-0.02em" }}>
            Your AI Travel Assistant
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "1.05rem" }}>
            Plan smarter trips in seconds.
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            placeholder="Describe your trip — where, when, budget, who's traveling…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={sending}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "1.05rem",
                py: 1.5,
                borderRadius: 3,
                bgcolor: alpha(designTokens.brand.charcoal, 0.6),
                border: `1px solid ${alpha(designTokens.brand.gold, 0.12)}`,
                "& fieldset": { border: "none" },
                "&:hover": { bgcolor: alpha(designTokens.brand.charcoal, 0.75) },
                "&.Mui-focused": {
                  bgcolor: alpha(designTokens.brand.charcoal, 0.8),
                  boxShadow: `0 0 0 1px ${alpha(designTokens.brand.gold, 0.35)}`,
                },
              },
            }}
          />

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 3 }}>
            {suggestionChips.map((chip) => (
              <Chip
                key={chip.label}
                label={chip.label}
                onClick={() => handleChip(chip)}
                disabled={sending}
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  borderColor: alpha(designTokens.brand.gold, 0.2),
                  "&:hover": { bgcolor: alpha(designTokens.brand.gold, 0.08) },
                }}
              />
            ))}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={sending || !query.trim()}
              sx={{ fontWeight: 800, px: 4, py: 1.25, borderRadius: 2.5 }}
            >
              {sending ? "Generating…" : "Generate Trip"}
            </Button>
            {sending ? <CircularProgress size={22} color="secondary" /> : null}
          </Stack>
        </Box>

        {/* Middle — result, itinerary, budget */}
        {sending && !plan ? (
          <Stack alignItems="center" sx={{ mt: 8, py: 6 }}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Building your trip…
            </Typography>
          </Stack>
        ) : null}

        {plan ? (
          <Box sx={{ pb: 10 }}>
            <AssistantResultCard
              plan={plan}
              onRegenerate={handleRegenerate}
              onEdit={handleEdit}
              onSave={handleSave}
              onShare={handleShare}
            />

            <AssistantItineraryAccordion
              days={plan.days}
              expanded={expandedDay}
              onExpandedChange={setExpandedDay}
            />

            <AssistantBudgetSummary budgetTotal={plan.budgetTotal} budgetLines={plan.budgetLines} />

            <Button
              component={RouterLink}
              to="/booking"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                mt: 6,
                py: 1.75,
                fontWeight: 800,
                borderRadius: 2.5,
                maxWidth: CONTENT_MAX,
              }}
            >
              Book trip
            </Button>
          </Box>
        ) : null}

        {toast ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 2 }}>
            {toast}
          </Typography>
        ) : null}
      </Container>
    </Box>
  );
}
