import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import AdminTopBar from "../../components/admin/AdminTopBar.jsx";
import { adminColors, adminPanelSx } from "../../components/admin/adminStyles.js";
import AutosaveStatus from "../../components/admin/settings/AutosaveStatus.jsx";
import SettingsField from "../../components/admin/settings/SettingsField.jsx";
import SettingsLayout from "../../components/admin/settings/SettingsLayout.jsx";
import { settingsInputSx } from "../../components/admin/settings/settingsStyles.js";
import { useAdminSettingsStore } from "../../store/adminSettingsStore.js";
import { CURRENCIES, LANGUAGES } from "../../utils/adminSettings.js";

function SettingsCard({ children }) {
  return <Box sx={{ ...adminPanelSx, p: 3 }}>{children}</Box>;
}

export default function AdminSettingsPage() {
  const settings = useAdminSettingsStore((s) => s.settings);
  const saving = useAdminSettingsStore((s) => s.saving);
  const lastSavedAt = useAdminSettingsStore((s) => s.lastSavedAt);
  const updateSection = useAdminSettingsStore((s) => s.updateSection);

  const [section, setSection] = useState("general");
  const { general, payments, preferences } = settings;

  const descriptions = {
    general: "Platform identity and brand essentials.",
    payments: "Enable providers and set your default currency.",
    preferences: "Language and notifications.",
  };

  return (
    <Box sx={{ pb: 4 }}>
      <AdminTopBar title="Settings" />

      <SettingsLayout
        activeSection={section}
        onSectionChange={setSection}
        saving={saving}
        lastSavedAt={lastSavedAt}
        description={descriptions[section]}
      >
        {section === "general" ? (
          <SettingsCard>
            <SettingsField
              label="App name"
              helper="Used across the platform and emails"
              value={general.appName}
              onChange={(e) => updateSection("general", { appName: e.target.value })}
            />
            <SettingsField
              label="Tagline"
              helper="Short phrase on marketing surfaces"
              value={general.tagline}
              onChange={(e) => updateSection("general", { tagline: e.target.value })}
            />
            <SettingsField
              label="Logo"
              helper="URL or path to your logo image"
              value={general.logo}
              onChange={(e) => updateSection("general", { logo: e.target.value })}
            />
            {general.logo ? (
              <Box
                component="img"
                src={general.logo}
                alt=""
                sx={{ height: 40, mb: 2, objectFit: "contain" }}
              />
            ) : null}
            <SettingsField label="Brand color" helper="Primary accent across the admin and app">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: general.brandColor,
                    border: `1px solid ${adminColors.border}`,
                    flexShrink: 0,
                  }}
                />
                <TextField
                  fullWidth
                  value={general.brandColor}
                  onChange={(e) => updateSection("general", { brandColor: e.target.value })}
                  sx={settingsInputSx}
                />
              </Stack>
            </SettingsField>
          </SettingsCard>
        ) : null}

        {section === "payments" ? (
          <SettingsCard>
            <FormControlLabel
              control={
                <Switch
                  checked={payments.stripeEnabled}
                  onChange={(e) => updateSection("payments", { stripeEnabled: e.target.checked })}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ color: "#fff" }}>
                    Stripe
                  </Typography>
                  <Typography variant="caption" sx={{ color: adminColors.textMuted }}>
                    Accept card payments
                  </Typography>
                </Box>
              }
              sx={{ m: 0, mb: 2, width: "100%", justifyContent: "space-between" }}
              labelPlacement="start"
            />
            <Box sx={{ borderBottom: `1px solid ${adminColors.border}`, mb: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={payments.paypalEnabled}
                  onChange={(e) => updateSection("payments", { paypalEnabled: e.target.checked })}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ color: "#fff" }}>
                    PayPal
                  </Typography>
                  <Typography variant="caption" sx={{ color: adminColors.textMuted }}>
                    Accept PayPal checkout
                  </Typography>
                </Box>
              }
              sx={{ m: 0, mb: 3, width: "100%", justifyContent: "space-between" }}
              labelPlacement="start"
            />
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#fff", mb: 1 }}>
              Default currency
            </Typography>
            <Typography variant="caption" sx={{ color: adminColors.textMuted, display: "block", mb: 1.5 }}>
              Shown at checkout and in reports
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {CURRENCIES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  onClick={() => updateSection("payments", { defaultCurrency: c })}
                  color={payments.defaultCurrency === c ? "primary" : "default"}
                  variant={payments.defaultCurrency === c ? "filled" : "outlined"}
                  sx={payments.defaultCurrency !== c ? { borderColor: adminColors.border } : undefined}
                />
              ))}
            </Stack>
          </SettingsCard>
        ) : null}

        {section === "preferences" ? (
          <SettingsCard>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#fff", mb: 0.5 }}>
              Language
            </Typography>
            <Typography variant="caption" sx={{ color: adminColors.textMuted, display: "block", mb: 1.5 }}>
              Default language for the admin workspace
            </Typography>
            <FormControl fullWidth sx={{ mb: 3, ...settingsInputSx }}>
              <InputLabel shrink>Language</InputLabel>
              <Select
                value={preferences.language}
                label="Language"
                onChange={(e) => updateSection("preferences", { language: e.target.value })}
              >
                {LANGUAGES.map((l) => (
                  <MenuItem key={l.code} value={l.code}>
                    {l.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={preferences.notifications}
                  onChange={(e) => updateSection("preferences", { notifications: e.target.checked })}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ color: "#fff" }}>
                    Notifications
                  </Typography>
                  <Typography variant="caption" sx={{ color: adminColors.textMuted }}>
                    Email alerts for bookings and updates
                  </Typography>
                </Box>
              }
              sx={{ m: 0, width: "100%", justifyContent: "space-between" }}
              labelPlacement="start"
            />
          </SettingsCard>
        ) : null}
      </SettingsLayout>
    </Box>
  );
}
