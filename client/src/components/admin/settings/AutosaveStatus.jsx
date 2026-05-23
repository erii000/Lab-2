import { VerifiedRounded } from "../../../ui/icons.jsx";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { adminColors } from "../adminStyles.js";

function formatSavedAt(ts) {
  if (!ts) return null;
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 10) return "Saved just now";
  if (sec < 60) return `Saved ${sec}s ago`;
  return `Saved ${Math.floor(sec / 60)}m ago`;
}

export default function AutosaveStatus({ saving, lastSavedAt }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      {saving ? (
        <>
          <CircularProgress size={14} sx={{ color: adminColors.gold }} />
          <Typography variant="caption" sx={{ color: adminColors.textMuted }}>Saving…</Typography>
        </>
      ) : lastSavedAt ? (
        <>
          <VerifiedRounded sx={{ fontSize: 16, color: adminColors.gold }} />
          <Typography variant="caption" sx={{ color: adminColors.gold, fontWeight: 600 }}>
            {formatSavedAt(lastSavedAt)}
          </Typography>
        </>
      ) : (
        <Typography variant="caption" sx={{ color: adminColors.textMuted }}>Changes autosave</Typography>
      )}
    </Stack>
  );
}
