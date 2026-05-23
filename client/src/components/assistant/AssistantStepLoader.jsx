import { AutoAwesomeRounded } from "../../ui/icons.jsx";
import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { designTokens } from "../../theme/theme.js";
import { loadingSteps } from "./assistantTheme.js";

export default function AssistantStepLoader() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => Math.min(i + 1, loadingSteps.length - 1));
    }, 650);
    return () => clearInterval(id);
  }, []);

  return (
    <Box
      sx={{
        mt: 6,
        p: 3,
        borderRadius: 3,
        bgcolor: alpha(designTokens.brand.charcoal, 0.75),
        border: `1px solid ${alpha(designTokens.brand.gold, 0.15)}`,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
        <AutoAwesomeRounded sx={{ color: "primary.main", fontSize: 22 }} />
        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
          AI is planning your trip
        </Typography>
      </Stack>
      <Stack spacing={1.5}>
        {loadingSteps.map((step, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;
          return (
            <Stack key={step} direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  bgcolor: done
                    ? alpha("#22c55e", 0.2)
                    : current
                      ? alpha(designTokens.brand.gold, 0.25)
                      : alpha("#fff", 0.06),
                  color: done ? "#4ade80" : current ? "primary.main" : alpha("#fff", 0.35),
                  border: `1px solid ${done ? alpha("#4ade80", 0.5) : current ? alpha(designTokens.brand.gold, 0.5) : alpha("#fff", 0.1)}`,
                  transition: "all 0.35s ease",
                }}
              >
                {done ? "✓" : current ? "…" : ""}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: done || current ? "text.primary" : "text.secondary",
                  fontWeight: current ? 600 : 400,
                }}
              >
                {step}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}
