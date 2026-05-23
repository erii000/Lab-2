import { Box, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { SETTINGS_NAV } from "../../../utils/adminSettings.js";
import { adminColors, adminPanelSx } from "../adminStyles.js";
import AutosaveStatus from "./AutosaveStatus.jsx";

export default function SettingsLayout({ activeSection, onSectionChange, saving, lastSavedAt, title, description, children }) {
  const active = SETTINGS_NAV.find((n) => n.id === activeSection);

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, alignItems: "flex-start" }}>
      <Box
        sx={{
          ...adminPanelSx,
          width: { xs: "100%", md: 240 },
          flexShrink: 0,
          p: 1.5,
          position: { md: "sticky" },
          top: 16,
        }}
      >
        <Typography variant="overline" sx={{ color: adminColors.textMuted, fontWeight: 700, px: 1.5, display: "block", mb: 1 }}>
          Settings
        </Typography>
        <List dense disablePadding>
          {SETTINGS_NAV.map((item) => (
            <ListItemButton
              key={item.id}
              selected={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
              sx={{
                borderRadius: 2,
                mb: 0.25,
                "&.Mui-selected": {
                  bgcolor: alpha(adminColors.gold, 0.12),
                  "& .MuiListItemText-primary": { color: adminColors.gold, fontWeight: 700 },
                },
              }}
            >
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: "0.875rem" }} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, maxWidth: 720 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: "#fff" }}>
              {title ?? active?.label}
            </Typography>
            {description ? (
              <Typography variant="body2" sx={{ color: adminColors.textMuted, mt: 0.5, lineHeight: 1.6 }}>
                {description}
              </Typography>
            ) : null}
          </Box>
          <AutosaveStatus saving={saving} lastSavedAt={lastSavedAt} />
        </Box>
        {children}
      </Box>
    </Box>
  );
}
