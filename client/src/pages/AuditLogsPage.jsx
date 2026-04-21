import {
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

const logs = [
    {
        id: 1,
        user: "Eljesa Azemi",
        action: "Updated user role",
        module: "Users",
        date: "2026-04-21 10:30",
        status: "Success",
    },
    {
        id: 2,
        user: "Arber Krasniqi",
        action: "Created new permission",
        module: "Permissions",
        date: "2026-04-21 11:15",
        status: "Success",
    },
    {
        id: 3,
        user: "Sara Berisha",
        action: "Deleted import entry",
        module: "Import Results",
        date: "2026-04-21 12:05",
        status: "Warning",
    },
    {
        id: 4,
        user: "Blend Dema",
        action: "Viewed audit logs",
        module: "Audit Logs",
        date: "2026-04-21 12:40",
        status: "Info",
    },
];

const getChipColor = (status) => {
    if (status === "Success") return "success";
    if (status === "Warning") return "warning";
    return "info";
};

export default function AuditLogsPage() {
    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    Audit Logs
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Track user actions and system activity across the platform.
                </Typography>
            </Box>

            <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #e2e8f0" }}>
                <CardContent>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        justifyContent="space-between"
                        sx={{ mb: 3 }}
                    >
                        <TextField
                            label="Search logs"
                            placeholder="Search by user, action, or module"
                            size="small"
                            sx={{ minWidth: { xs: "100%", md: 320 } }}
                        />
                    </Stack>

                    <Box sx={{ overflowX: "auto" }}>
                        <Box
                            sx={{
                                minWidth: 900,
                                display: "grid",
                                gridTemplateColumns: "80px 1.3fr 1.8fr 1.2fr 1.4fr 1fr",
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                overflow: "hidden",
                            }}
                        >
                            {["ID", "User", "Action", "Module", "Date", "Status"].map((head) => (
                                <Box
                                    key={head}
                                    sx={{
                                        p: 2,
                                        fontWeight: 700,
                                        bgcolor: "#f8fafc",
                                        borderBottom: "1px solid #e2e8f0",
                                    }}
                                >
                                    {head}
                                </Box>
                            ))}

                            {logs.map((log) => (
                                <Box key={log.id} sx={{ display: "contents" }}>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{log.id}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>
                                        {log.user}
                                    </Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{log.action}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{log.module}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{log.date}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
                                        <Chip label={log.status} color={getChipColor(log.status)} size="small" />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Stack>
    );
}