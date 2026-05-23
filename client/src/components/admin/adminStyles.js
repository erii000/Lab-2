import { alpha } from "@mui/material/styles";
import { designTokens } from "../../theme/theme.js";

export const adminColors = {
  bg: designTokens.brand.obsidian,
  surface: designTokens.brand.charcoal,
  surfaceRaised: designTokens.brand.graphite,
  border: alpha(designTokens.brand.gold, 0.12),
  borderHover: alpha(designTokens.brand.gold, 0.28),
  gold: designTokens.brand.gold,
  textMuted: "#8b95a8",
};

export const adminPanelSx = {
  borderRadius: 3,
  bgcolor: alpha(adminColors.surface, 0.85),
  border: `1px solid ${adminColors.border}`,
  backdropFilter: "blur(12px)",
};

export const adminTableHeadSx = {
  "& th": {
    fontWeight: 700,
    fontSize: "0.72rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: adminColors.textMuted,
    borderBottom: `1px solid ${adminColors.border}`,
    py: 1.5,
  },
};

export const adminTableRowSx = {
  "& td": {
    borderBottom: `1px solid ${alpha("#fff", 0.04)}`,
    py: 1.75,
  },
  "&:hover": { bgcolor: alpha(designTokens.brand.gold, 0.04) },
  cursor: "pointer",
};

export const adminChartSegmentColors = [
  adminColors.gold,
  alpha(adminColors.gold, 0.65),
  alpha(adminColors.gold, 0.45),
  alpha(adminColors.gold, 0.3),
  alpha(adminColors.gold, 0.2),
];

export const adminToggleSx = {
  "& .MuiToggleButton-root": {
    py: 0.35,
    px: 1.25,
    fontSize: "0.7rem",
    fontWeight: 600,
    color: adminColors.textMuted,
    borderColor: adminColors.border,
    textTransform: "none",
    "&.Mui-selected": {
      color: adminColors.gold,
      bgcolor: alpha(adminColors.gold, 0.12),
      borderColor: alpha(adminColors.gold, 0.4),
    },
  },
};
