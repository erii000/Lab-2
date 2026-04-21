import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from "@mui/material";

const permissions = [
    {
        id: 1,
        name: "Manage Users",
        module: "Users",
        assignedTo: "Admin, Manager",
        status: "Active",
    },
    {
        id: 2,
        name: "Edit Roles",
        module: "Roles",
        assignedTo: "Admin",
        status: "Active",
    },
    {
        id: 3,
        name: "View Audit Logs",
        module: "Audit Logs",
        assignedTo: "Admin, Manager",
        status: "Active",
    },
    {
        id: 4,
        name: "Manage Recommendations",
        module: "Recommendations",
        assignedTo: "Admin, Editor",
        status: "Active",
    },
];

export default function PermissionsManagementPage() {
    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    Permissions Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage access permissions for different modules.
                </Typography>
            </Box>

            <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #e2e8f0" }}>
                <CardContent>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        spacing={2}
                        sx={{ mb: 3 }}
                    >
                        <Typography variant="h6" fontWeight={700}>
                            Existing Permissions
                        </Typography>

                        <Button variant="contained" sx={{ borderRadius: 3 }}>
                            Add Permission
                        </Button>
                    </Stack>

                    <Box sx={{ overflowX: "auto" }}>
                        <Box
                            sx={{
                                minWidth: 820,
                                display: "grid",
                                gridTemplateColumns: "80px 1.5fr 1.2fr 1.8fr 1fr 1fr",
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                overflow: "hidden",
                            }}
                        >
                            {["ID", "Permission Name", "Module", "Assigned To", "Status", "Actions"].map((head) => (
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

                            {permissions.map((permission) => (
                                <Box key={permission.id} sx={{ display: "contents" }}>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{permission.id}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>
                                        {permission.name}
                                    </Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
                                        {permission.module}
                                    </Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
                                        {permission.assignedTo}
                                    </Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
                                        <Chip label={permission.status} color="success" size="small" />
                                    </Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
                                        <Stack direction="row" spacing={1}>
                                            <Button size="small" variant="outlined">
                                                Edit
                                            </Button>
                                            <Button size="small" color="error" variant="outlined">
                                                Delete
                                            </Button>
                                        </Stack>
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