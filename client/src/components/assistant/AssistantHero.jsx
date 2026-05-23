import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import FlightRoundedIcon from "@mui/icons-material/FlightRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Box, Button, Chip, Container, InputBase, Stack, Typography } from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import { designTokens } from "../../theme/theme.js";
import { promptChips, rotatingPlaceholders } from "./assistantTheme.js";
import AssistantStepLoader from "./AssistantStepLoader.jsx";

const lift = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
`;

const gold = designTokens.brand.gold;

export default function AssistantHero({
  query,
  onQueryChange,
  onSubmit,
  onChipClick,
  sending,
  showLoader,
  inputRef,
}) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [displayPlaceholder, setDisplayPlaceholder] = useState("");
  const typingRef = useRef(null);

  useEffect(() => {
    const target = rotatingPlaceholders[placeholderIndex];
    let i = 0;
    clearInterval(typingRef.current);
    setDisplayPlaceholder("");
    typingRef.current = setInterval(() => {
      i += 1;
      setDisplayPlaceholder(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(typingRef.current);
        setTimeout(() => {
          setPlaceholderIndex((p) => (p + 1) % rotatingPlaceholders.length);
        }, 2200);
      }
    }, 28);
    return () => clearInterval(typingRef.current);
  }, [placeholderIndex]);

  const showAnimatedPlaceholder = !query && !focused;

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        pt: { xs: 4, md: 6 },
        pb: { xs: 6, md: 8 },
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${alpha(designTokens.brand.navy, 0.22)} 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 5 }}>
          <Chip
            icon={<AutoAwesomeRounded sx={{ fontSize: 16 }} />}
            label="AI travel concierge"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
          <Typography
            component="h1"
            variant="h2"
            fontWeight={800}
            color="text.primary"
            sx={{
              maxWidth: 640,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
            }}
          >
            Plan smarter journeys with AI
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 480,
              fontSize: { xs: "1rem", md: "1.125rem" },
              lineHeight: 1.55,
            }}
          >
            Flights, hotels, budgets, activities and complete itineraries — powered by AI.
          </Typography>
        </Stack>

        <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 720, mx: "auto" }}>
          <Box
            sx={{
              position: "relative",
              p: "1px",
              borderRadius: 3.5,
              background: focused
                ? `linear-gradient(135deg, ${alpha(gold, 0.85)}, ${alpha(gold, 0.45)})`
                : `linear-gradient(135deg, ${alpha("#fff", 0.12)}, ${alpha("#fff", 0.04)})`,
              boxShadow: focused
                ? `0 0 0 3px ${alpha(gold, 0.12)}, 0 16px 40px ${alpha("#000", 0.35)}`
                : `0 12px 32px ${alpha("#000", 0.28)}`,
              transition: "box-shadow 0.35s ease, background 0.35s ease",
            }}
          >
            <Box
              sx={{
                borderRadius: 3.4,
                bgcolor: alpha(designTokens.brand.charcoal, 0.92),
                border: `1px solid ${alpha("#fff", 0.06)}`,
                p: { xs: 1.5, sm: 2 },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <SearchRoundedIcon sx={{ color: "primary.main", mt: 1.25, fontSize: 22 }} />
                <Box sx={{ flex: 1, position: "relative", minHeight: 88 }}>
                  {showAnimatedPlaceholder ? (
                    <Typography
                      aria-hidden
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 0,
                        right: 0,
                        textAlign: "left",
                        color: alpha("#fff", 0.38),
                        fontSize: "1.05rem",
                        lineHeight: 1.5,
                        pointerEvents: "none",
                      }}
                    >
                      {displayPlaceholder}
                      <Box component="span" sx={{ opacity: 0.6, animation: `${lift} 1s ease infinite` }}>
                        |
                      </Box>
                    </Typography>
                  ) : null}
                  <InputBase
                    inputRef={inputRef}
                    multiline
                    minRows={3}
                    maxRows={6}
                    fullWidth
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    disabled={sending}
                    placeholder={focused || query ? "Describe your dream trip…" : ""}
                    sx={{
                      width: "100%",
                      fontSize: "1.05rem",
                      lineHeight: 1.5,
                      color: "text.primary",
                      "& textarea::placeholder": { color: alpha("#fff", 0.35), opacity: 1 },
                    }}
                  />
                </Box>
                <FlightRoundedIcon
                  sx={{ color: alpha(gold, 0.55), mt: 1.25, fontSize: 20, display: { xs: "none", sm: "block" } }}
                />
              </Stack>
            </Box>
          </Box>

          <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1} sx={{ mt: 2 }}>
            {["Tokyo", "Paris", "Bali", "New York"].map((city) => (
              <Chip
                key={city}
                label={city}
                size="small"
                variant="outlined"
                onClick={() => onQueryChange(`${city} trip for 5 days`)}
                sx={{
                  fontWeight: 600,
                  borderColor: alpha(gold, 0.25),
                  "&:hover": { bgcolor: alpha(gold, 0.1), borderColor: alpha(gold, 0.45) },
                }}
              />
            ))}
          </Stack>

          <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1} sx={{ mt: 2.5 }}>
            {promptChips.map((chip) => (
              <Chip
                key={chip.label}
                label={
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </Stack>
                }
                onClick={() => onChipClick(chip)}
                disabled={sending}
                sx={{
                  height: 36,
                  px: 0.5,
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  borderRadius: 999,
                  bgcolor: alpha(designTokens.brand.charcoal, 0.8),
                  border: `1px solid ${alpha(gold, 0.2)}`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 24px ${alpha("#000", 0.3)}`,
                    bgcolor: alpha(gold, 0.12),
                    borderColor: alpha(gold, 0.45),
                  },
                }}
              />
            ))}
          </Stack>

          <Stack alignItems="center" sx={{ mt: 4 }}>
            <Button
              type="submit"
              disabled={sending || !query.trim()}
              variant="contained"
              size="large"
              sx={{
                px: 5,
                py: 1.6,
                fontWeight: 800,
                fontSize: "1rem",
                borderRadius: 999,
                background: `linear-gradient(135deg, ${gold}, ${alpha(gold, 0.88)})`,
                color: designTokens.brand.obsidian,
                boxShadow: `0 12px 32px ${alpha(gold, 0.28)}`,
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                "&:not(:disabled):hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 16px 40px ${alpha(gold, 0.38)}`,
                  background: `linear-gradient(135deg, ${designTokens.brand.champagne}, ${gold})`,
                },
                "&.Mui-disabled": {
                  color: alpha("#fff", 0.35),
                  bgcolor: alpha("#fff", 0.08),
                  background: "none",
                },
              }}
            >
              {sending ? "Planning your journey…" : "Plan My Journey"}
            </Button>
          </Stack>
        </Box>

        {showLoader ? <AssistantStepLoader /> : null}
      </Container>
    </Box>
  );
}
