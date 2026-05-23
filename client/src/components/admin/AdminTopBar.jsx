import { SearchRounded } from "../../ui/icons.jsx";
import {
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import AdminNotificationsMenu from "./AdminNotificationsMenu.jsx";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { adminColors } from "./adminStyles.js";
import { useAuthStore } from "../../store/authStore.js";

export default function AdminTopBar({ title, actions }) {
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const [anchor, setAnchor] = useState(null);

  const initials =
    session?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AD";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
        flexWrap: "wrap",
      }}
    >
      <Typography variant="h5" fontWeight={800} sx={{ color: "#fff", letterSpacing: "-0.02em" }}>
        {title}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: { xs: "1 1 100%", md: "0 0 auto" }, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {actions ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mr: { md: 0.5 } }}>{actions}</Box>
        ) : null}
        <TextField
          placeholder="Search…"
          size="small"
          sx={{
            width: { xs: "100%", sm: 220 },
            "& .MuiOutlinedInput-root": {
              bgcolor: alpha("#fff", 0.04),
              borderRadius: 2.5,
              "& fieldset": { borderColor: adminColors.border },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ fontSize: 18, color: adminColors.textMuted }} />
              </InputAdornment>
            ),
          }}
        />
        <AdminNotificationsMenu />
        <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.25 }}>
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: alpha(adminColors.gold, 0.2),
              color: adminColors.gold,
              fontSize: 13,
              fontWeight: 800,
              border: `1px solid ${alpha(adminColors.gold, 0.4)}`,
            }}
          >
            {initials}
          </Avatar>
        </IconButton>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <MenuItem disabled sx={{ opacity: "1 !important" }}>
            <Typography variant="body2" fontWeight={700}>
              {session?.name}
            </Typography>
          </MenuItem>
          <MenuItem component={RouterLink} to="/" onClick={() => setAnchor(null)}>
            View site
          </MenuItem>
          <MenuItem
            onClick={() => {
              logout();
              setAnchor(null);
            }}
          >
            Sign out
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
