import { EditRounded, RefreshRounded, ShareRounded } from "../../ui/icons.jsx";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { designTokens } from "../../theme/theme.js";

export default function AssistantResultCard({ plan, onRegenerate, onEdit, onSave, onShare }) {
  return (
    <Box
      sx={{
        position: "relative",
        mt: 6,
        p: { xs: 3, sm: 4 },
        borderRadius: 3,
        bgcolor: alpha(designTokens.brand.charcoal, 0.55),
        border: `1px solid ${alpha(designTokens.brand.gold, 0.12)}`,
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
        }}
      >
        <Tooltip title="Regenerate">
          <IconButton size="small" onClick={onRegenerate} sx={{ color: "text.secondary" }}>
            <RefreshRounded fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit prompt">
          <IconButton size="small" onClick={onEdit} sx={{ color: "text.secondary" }}>
            <EditRounded fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Typography variant="h5" fontWeight={800} sx={{ pr: 6, mb: 2 }}>
        {plan.title}
      </Typography>

      <Stack component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }} spacing={0.5}>
        {plan.stops.map((stop) => (
          <Typography key={stop} component="li" variant="body2" sx={{ lineHeight: 1.6 }}>
            {stop}
          </Typography>
        ))}
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
        {plan.summary}
      </Typography>

      <Typography variant="body2" fontWeight={700}>
        Estimated budget:{" "}
        <Box component="span" sx={{ color: "primary.main" }}>
          €{plan.budgetTotal.toLocaleString()}
        </Box>
      </Typography>

      <Typography
        component={RouterLink}
        to="/itinerary"
        variant="body2"
        sx={{
          display: "inline-block",
          mt: 2,
          fontWeight: 600,
          color: "secondary.main",
          textDecoration: "none",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        View itinerary →
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mt: 3, pt: 2, borderTop: `1px solid ${alpha(designTokens.brand.gold, 0.08)}` }}>
        <Typography
          component="button"
          type="button"
          variant="caption"
          onClick={onSave}
          sx={{
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "text.secondary",
            fontWeight: 600,
            p: 0,
            "&:hover": { color: "text.primary" },
          }}
        >
          Save
        </Typography>
        <Typography
          component="button"
          type="button"
          variant="caption"
          onClick={onShare}
          sx={{
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "text.secondary",
            fontWeight: 600,
            p: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            "&:hover": { color: "text.primary" },
          }}
        >
          <ShareRounded sx={{ fontSize: 14 }} /> Share
        </Typography>
        <Typography
          component="button"
          type="button"
          variant="caption"
          onClick={onEdit}
          sx={{
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "text.secondary",
            fontWeight: 600,
            p: 0,
            "&:hover": { color: "text.primary" },
          }}
        >
          Edit
        </Typography>
      </Stack>
    </Box>
  );
}
