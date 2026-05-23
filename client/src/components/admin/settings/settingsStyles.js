import { alpha } from "@mui/material/styles";
import { adminColors } from "../adminStyles.js";

export const SETTINGS_SPACING = { section: 3, field: 2, label: 1 };

export const settingsInputSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 48,
    borderRadius: 2,
    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
    "& fieldset": { borderColor: adminColors.border },
    "&:hover fieldset": { borderColor: adminColors.borderHover },
    "&.Mui-focused fieldset": {
      borderColor: adminColors.gold,
      boxShadow: `0 0 0 3px ${alpha(adminColors.gold, 0.15)}`,
    },
  },
};

export const settingsCardSx = {
  borderRadius: 3,
  bgcolor: alpha(adminColors.surface, 0.9),
  border: `1px solid ${alpha(adminColors.gold, 0.1)}`,
  boxShadow: `0 8px 32px ${alpha("#000", 0.25)}`,
  p: 3,
  mb: SETTINGS_SPACING.section,
};
