import {
    Box,
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
    Chip,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

const stats = [
    {
        title: "Total Users",
        value: "1,248",
        note: "+12 this week",
        icon: <GroupRoundedIcon />,
    },
    {
        title: "Roles",
        value: "8",
        note: "System roles active",
        icon: <AdminPanelSettingsRoundedIcon />,
    },
    {
        title: "Permissions",
        value: "24",
        note: "Mapped to roles",
        icon: <SecurityRoundedIcon />,
    },
    {
        title: "Audit Events",
        value: "326",
        note: "Last 24 hours",
        icon: <HistoryRoundedIcon />,
    },
];

const recentActivities = [
    "New user registered from Travel Explorer module",
    "Admin updated booking approval permissions",
    "Role “Content Manager” was edited",
    "Import completed with 12 successful rows",
];

export default function AdminDashboardPage() {
    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    Welcome back, Eljesa
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Here you can monitor users, permissions, roles, audit activity, and recommendations.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {stats.map((item) => (
                    <Grid key={item.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                border: "1px solid #e2e8f0",
                                height: "100%",
                            }}
                        >
                            <CardContent>
                                <Stack
                                    direction="row"
                                    alignItems="flex-start"
                                    justifyContent="space-between"
                                    spacing={2}
                                >
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="h4" fontWeight={800}>
                                            {item.value}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1, color: "success.main" }}>
                                            {item.note}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 3,
                                            display: "grid",
                                            placeItems: "center",
                                            bgcolor: "primary.light",
                                            color: "primary.main",
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Platform Overview
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                The admin area centralizes user management, access control, audit tracking,
                                and recommendation-related workflows for the Smart Travel Assistant platform.
                            </Typography>

                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                <Chip label="User Management" color="primary" variant="outlined" />
                                <Chip label="Access Control" color="primary" variant="outlined" />
                                <Chip label="Audit Logs" color="primary" variant="outlined" />
                                <Chip label="Recommendations" color="primary" variant="outlined" />
                                <Chip label="Import Results" color="primary" variant="outlined" />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            border: "1px solid #e2e8f0",
                            height: "100%",
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Recent Activity
                            </Typography>

                            <List disablePadding>
                                {recentActivities.map((activity, index) => (
                                    <ListItem
                                        key={index}
                                        disableGutters
                                        sx={{
                                            py: 1.2,
                                            borderBottom:
                                                index !== recentActivities.length - 1
                                                    ? "1px solid #eef2f7"
                                                    : "none",
                                        }}
                                    >
                                        <ListItemText
                                            primary={activity}
                                            primaryTypographyProps={{
                                                fontSize: 14,
                                                color: "text.primary",
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Stack>
    );
}