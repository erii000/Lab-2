import ImportExportRoundedIcon from "@mui/icons-material/ImportExportRounded";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import AdminDataExchangeBar from "../../components/admin/AdminDataExchangeBar.jsx";
import AdminTopBar from "../../components/admin/AdminTopBar.jsx";
import { adminColors } from "../../components/admin/adminStyles.js";
import { DATA_EXCHANGE_RESOURCES } from "../../api/dataExchangeApi.js";
import { useAuthStore } from "../../store/authStore.js";
import { useAdminBookingsStore } from "../../store/adminBookingsStore.js";
import { useAdminNotificationsStore } from "../../store/adminNotificationsStore.js";
import { useAdminTripsStore } from "../../store/adminTripsStore.js";
import { useAdminUsersStore } from "../../store/adminUsersStore.js";

export default function AdminDataExchangePage() {
  const [tab, setTab] = useState(0);
  const ensureAccessToken = useAuthStore((s) => s.ensureAccessToken);
  const resource = DATA_EXCHANGE_RESOURCES[tab]?.id ?? "users";

  async function refreshAdminStores() {
    const token = await ensureAccessToken();
    if (!token) return;
    await Promise.all([
      useAdminUsersStore.getState().hydrateFromApi(token),
      useAdminBookingsStore.getState().hydrateFromApi(token),
      useAdminTripsStore.getState().hydrateFromApi(token),
      useAdminNotificationsStore.getState().hydrateFromApi(token),
    ]);
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960 }}>
      <AdminTopBar title="Data exchange" />
      <Typography variant="body2" sx={{ color: adminColors.textMuted, mb: 2 }}>
        Export and import the five admin lists (JSON, CSV, Excel). Imports accept JSON arrays via the API.
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          minHeight: 40,
          "& .MuiTab-root": { color: alpha("#fff", 0.55), textTransform: "none", fontWeight: 600, minHeight: 40 },
          "& .Mui-selected": { color: adminColors.gold },
          "& .MuiTabs-indicator": { bgcolor: adminColors.gold },
        }}
      >
        {DATA_EXCHANGE_RESOURCES.map((r) => (
          <Tab key={r.id} icon={<ImportExportRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={r.label} />
        ))}
      </Tabs>

      {DATA_EXCHANGE_RESOURCES[tab] ? (
        <Typography variant="caption" sx={{ color: adminColors.textMuted, display: "block", mb: 1.5 }}>
          {DATA_EXCHANGE_RESOURCES[tab].description}
        </Typography>
      ) : null}

      <AdminDataExchangeBar resource={resource} onImported={refreshAdminStores} />
    </Box>
  );
}
