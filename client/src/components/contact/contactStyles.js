import { alpha } from "@mui/material/styles";
import { designTokens } from "../../theme/theme.js";

export const glassCard = (theme, { light = false } = {}) => ({
  borderRadius: 3,
  border: `1px solid ${alpha(designTokens.brand.gold, light ? 0.28 : 0.2)}`,
  background: light
    ? `linear-gradient(145deg, ${alpha("#fff", 0.12)} 0%, ${alpha(designTokens.brand.graphite, 0.85)} 100%)`
    : `linear-gradient(145deg, ${alpha("#fff", 0.06)} 0%, ${alpha(designTokens.brand.charcoal, 0.92)} 100%)`,
  backdropFilter: "blur(18px)",
  boxShadow: `0 24px 56px ${alpha("#000", 0.42)}, inset 0 1px 0 ${alpha("#fff", 0.06)}`,
  transition: "transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    borderColor: alpha(designTokens.brand.gold, 0.38),
    boxShadow: `0 32px 64px ${alpha("#000", 0.5)}, inset 0 1px 0 ${alpha("#fff", 0.08)}`,
  },
});

export const heroGradient = `radial-gradient(ellipse 80% 60% at 20% 0%, ${alpha(designTokens.brand.navy, 0.35)} 0%, transparent 55%),
  radial-gradient(ellipse 60% 50% at 90% 20%, ${alpha(designTokens.brand.gold, 0.15)} 0%, transparent 50%),
  ${designTokens.gradients.hero}`;

export const chipGlow = {
  px: 1.5,
  py: 0.35,
  borderRadius: 99,
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  border: `1px solid ${alpha(designTokens.brand.gold, 0.35)}`,
  bgcolor: alpha(designTokens.brand.gold, 0.1),
  color: designTokens.brand.champagne,
};
