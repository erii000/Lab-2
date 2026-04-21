import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    AppBar,
    Avatar,
    Badge,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import RecommendRoundedIcon from "@mui/icons-material/RecommendRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";

const drawerWidth = 260;

const menuItems = [
    { label: "Dashboard", icon: <DashboardRoundedIcon />, path: "/admin" },
    { label: "Users", icon: <GroupRoundedIcon />, path: "/admin/users" },
    { label: "Roles", icon: <AdminPanelSettingsRoundedIcon />, path: "/admin/roles" },
    { label: "Permissions", icon: <SecurityRoundedIcon />, path: "/admin/permissions" },
    { label: "Audit Logs", icon: <HistoryRoundedIcon />, path: "/admin/audit-logs" },
    { label: "Recommendations", icon: <RecommendRoundedIcon />, path: "/admin/recommendations" },
    { label: "Import Results", icon: <UploadFileRoundedIcon />, path: "/admin/import-results" },
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
            <CssBaseline />

            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    bgcolor: "#ffffff",
                    color: "#0f172a",
                    borderBottom: "1px solid #e2e8f0",
                }}
            >
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            Admin Dashboard
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage platform settings and internal modules
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <IconButton>
                            <Badge badgeContent={3} color="error">
                                <NotificationsNoneRoundedIcon />
                            </Badge>
                        </IconButton>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                            <Avatar sx={{ bgcolor: "primary.main", width: 38, height: 38 }}>
                                EA
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight={700}>
                                    Eljesa Azemi
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Administrator
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        bgcolor: "#0f172a",
                        color: "#fff",
                        borderRight: "none",
                    },
                }}
            >
                <Toolbar>
                    <Box>
                        <Typography variant="h6" fontWeight={800}>
                            SmartTravel
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.75 }}>
                            Admin Panel
                        </Typography>
                    </Box>
                </Toolbar>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

                <List sx={{ p: 1.5 }}>
                    {menuItems.map((item) => {
                        const active = location.pathname === item.path;
                        return (
                            <ListItemButton
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    mb: 0.75,
                                    borderRadius: 2.5,
                                    bgcolor: active ? "rgba(255,255,255,0.12)" : "transparent",
                                    "&:hover": {
                                        bgcolor: "rgba(255,255,255,0.08)",
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: "#fff", minWidth: 42 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: 14,
                                        fontWeight: active ? 700 : 500,
                                    }}
                                />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    p: 3,
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}