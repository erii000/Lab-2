import { alpha } from "@mui/material/styles";
import { designTokens } from "../../theme/theme.js";

export const authFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    bgcolor: alpha("#fff", 0.045),
    fontSize: "0.9375rem",
    minHeight: 52,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    "& fieldset": { borderColor: alpha("#fff", 0.1) },
    "&:hover fieldset": { borderColor: alpha(designTokens.brand.gold, 0.4) },
    "&.Mui-focused fieldset": {
      borderColor: designTokens.brand.gold,
      boxShadow: `0 0 0 3px ${alpha(designTokens.brand.gold, 0.14)}`,
    },
  },
  "& .MuiInputLabel-root": {
    color: alpha("#fff", 0.55),
    fontSize: "0.875rem",
    "&.Mui-focused": { color: designTokens.brand.gold },
  },
  "& .MuiFormHelperText-root": {
    fontSize: "0.75rem",
    mx: 0,
    mt: 0.75,
  },
};

export const authPrimaryButtonSx = {
  mt: 1,
  py: 1.35,
  minHeight: 52,
  fontWeight: 700,
  fontSize: "0.9375rem",
  borderRadius: 2.5,
  boxShadow: `0 10px 28px ${alpha(designTokens.brand.gold, 0.22)}`,
};

export const authCardSx = {
  borderRadius: 4,
  overflow: "hidden",
  border: `1px solid ${alpha(designTokens.brand.gold, 0.2)}`,
  bgcolor: designTokens.brand.charcoal,
  boxShadow: `
    0 0 0 1px ${alpha("#fff", 0.04)} inset,
    0 28px 56px -20px rgba(0, 0, 0, 0.65)
  `,
};
