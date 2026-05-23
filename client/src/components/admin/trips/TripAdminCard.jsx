import { MoreVertRounded } from "../../../ui/icons.jsx";
import { Box, Card, CardContent, CardMedia, Checkbox, Chip, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { getTripStatusMeta } from "../../../utils/adminTrips.js";
import { adminColors, adminPanelSx } from "../adminStyles.js";

export default function TripAdminCard({
  trip,
  selected,
  showCheckbox,
  hovered,
  onSelect,
  onOpen,
  onMenuAction,
}) {
  const [anchor, setAnchor] = useState(null);
  const statusMeta = getTripStatusMeta(trip.status);

  return (
    <Card
      onClick={() => onOpen?.(trip)}
      sx={{
        ...adminPanelSx,
        cursor: "pointer",
        overflow: "hidden",
        border: selected ? `1px solid ${alpha(adminColors.gold, 0.5)}` : undefined,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 40px ${alpha("#000", 0.4)}, 0 0 0 1px ${alpha(adminColors.gold, 0.18)}`,
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height={200}
          image={trip.image}
          alt={trip.title}
          sx={{ objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent 55%, rgba(8,10,14,0.75) 100%)",
            pointerEvents: "none",
          }}
        />
        {showCheckbox ? (
          <Checkbox
            size="small"
            checked={selected}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onSelect?.(trip.id, e.target.checked)}
            sx={{
              position: "absolute",
              top: 6,
              left: 6,
              opacity: hovered || selected ? 1 : 0,
              transition: "opacity 0.2s",
              bgcolor: alpha("#000", 0.4),
              borderRadius: 1,
            }}
          />
        ) : null}
        <Chip
          label={`AI ${trip.aiScore}`}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            height: 22,
            fontSize: "0.65rem",
            fontWeight: 700,
            bgcolor: alpha("#000", 0.55),
            color: adminColors.textMuted,
            border: `1px solid ${alpha("#fff", 0.08)}`,
          }}
        />
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setAnchor(e.currentTarget);
          }}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s",
            bgcolor: alpha("#000", 0.5),
            color: "#fff",
            mt: 3.5,
          }}
        >
          <MoreVertRounded fontSize="small" />
        </IconButton>
      </Box>
      <CardContent sx={{ pt: 2, pb: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#fff", lineHeight: 1.25 }} noWrap>
          {trip.title}
        </Typography>
        <Typography variant="body2" sx={{ color: adminColors.textMuted, mt: 0.5 }}>
          {trip.country}
        </Typography>
        <Typography variant="caption" sx={{ color: adminColors.textMuted, mt: 1.25, display: "block" }}>
          {statusMeta.label} · AI {trip.aiScore}
        </Typography>
      </CardContent>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { setAnchor(null); onMenuAction?.("duplicate", trip); }}>Duplicate</MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onMenuAction?.("archive", trip); }}>Archive</MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onMenuAction?.("delete", trip); }} sx={{ color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}
