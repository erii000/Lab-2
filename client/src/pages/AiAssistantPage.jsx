import { Box, Button, Container } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AssistantBudgetSummary from "../components/assistant/AssistantBudgetSummary.jsx";
import AssistantHero from "../components/assistant/AssistantHero.jsx";
import AssistantHowItWorks from "../components/assistant/AssistantHowItWorks.jsx";
import AssistantItineraryAccordion from "../components/assistant/AssistantItineraryAccordion.jsx";
import AssistantResultCard from "../components/assistant/AssistantResultCard.jsx";
import { buildTripPlan } from "../components/assistant/assistantData.js";
import { loadingSteps } from "../components/assistant/assistantTheme.js";
import { useToast } from "../context/ToastContext.jsx";
import { useAssistantStore } from "../store/assistantStore.js";
import { designTokens } from "../theme/theme.js";

const PLAN_DELAY_MS = loadingSteps.length * 700 + 400;

export default function AiAssistantPage() {
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const query = useAssistantStore((s) => s.query);
  const setQuery = useAssistantStore((s) => s.setQuery);
  const plan = useAssistantStore((s) => s.plan);
  const setPlan = useAssistantStore((s) => s.setPlan);
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const [expandedDay, setExpandedDay] = useState(false);

  async function generateTrip(text) {
    const q = (text ?? query).trim();
    if (!q || sending) return;

    setSending(true);
    setPlan(null);
    setExpandedDay(false);
    try {
      await new Promise((r) => setTimeout(r, PLAN_DELAY_MS));
      setPlan(buildTripPlan(q));
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } finally {
      setSending(false);
    }
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
    showToast({ message: "Trip saved to your itinerary.", severity: "success" });
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: plan?.title, text: plan?.summary });
      } catch {
        /* user cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard?.writeText(window.location.href);
      showToast({ message: "Link copied to clipboard.", severity: "info" });
    } catch {
      showToast({ message: "Could not copy link.", severity: "warning" });
    }
  }

  const showLandingSections = !plan && !sending;

  return (
    <Box>
      <AssistantHero
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
        onChipClick={handleChip}
        sending={sending}
        showLoader={sending && !plan}
        inputRef={inputRef}
      />

      {showLandingSections ? (
        <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
          <AssistantHowItWorks />
        </Container>
      ) : null}

      {plan ? (
        <Box ref={resultsRef} sx={{ pb: 8, scrollMarginTop: 96 }}>
          <Container maxWidth="md">
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
                background: `linear-gradient(135deg, ${designTokens.brand.gold}, ${alpha(designTokens.brand.gold, 0.88)})`,
                color: designTokens.brand.obsidian,
                "&:hover": {
                  background: `linear-gradient(135deg, ${designTokens.brand.champagne}, ${designTokens.brand.gold})`,
                },
              }}
            >
              Book trip
            </Button>
          </Container>
        </Box>
      ) : null}
    </Box>
  );
}
