import { Stack, TextField, Typography } from "@mui/material";
import { adminColors } from "../adminStyles.js";
import { settingsInputSx } from "./settingsStyles.js";

export default function SettingsField({ label, helper, value, onChange, type = "text", children }) {
  return (
    <Stack spacing={0.75} sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#fff" }}>
        {label}
      </Typography>
      {helper ? (
        <Typography variant="caption" sx={{ color: adminColors.textMuted, lineHeight: 1.5 }}>
          {helper}
        </Typography>
      ) : null}
      {children ?? (
        <TextField
          fullWidth
          type={type}
          value={value}
          onChange={onChange}
          InputLabelProps={{ shrink: true }}
          sx={settingsInputSx}
        />
      )}
    </Stack>
  );
}
