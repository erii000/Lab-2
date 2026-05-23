import { AutoAwesomeRounded, CloseRounded } from "../../ui/icons.jsx";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { aiAssistOptions } from "../../utils/itineraryPlanner.js";
import { designTokens } from "../../theme/theme.js";

export default function AiAssistDrawer({ open, onClose, onSelect }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 380 },
          bgcolor: designTokens.brand.charcoal,
          borderLeft: `1px solid ${alpha(designTokens.brand.gold, 0.12)}`,
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AutoAwesomeRounded color="primary" />
          <Typography variant="h6" fontWeight={800}>
            AI Assist
          </Typography>
        </Stack>
        <IconButton onClick={onClose} aria-label="Close">
          <CloseRounded />
        </IconButton>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ px: 2.5, pb: 2 }}>
        Refine your trip with one tap — suggestions apply to your timeline instantly.
      </Typography>
      <List disablePadding>
        {aiAssistOptions.map((opt) => (
          <ListItemButton
            key={opt.id}
            onClick={() => {
              onSelect(opt.id);
              onClose();
            }}
            sx={{ px: 2.5, py: 1.25, borderBottom: `1px solid ${alpha(designTokens.brand.gold, 0.06)}` }}
          >
            <ListItemText
              primary={opt.label}
              secondary={opt.detail}
              primaryTypographyProps={{ fontWeight: 700, fontSize: "0.9rem" }}
              secondaryTypographyProps={{ fontSize: "0.8rem", lineHeight: 1.5 }}
            />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2.5, mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Powered by your travel profile and live destination data.
        </Typography>
      </Box>
    </Drawer>
  );
}
