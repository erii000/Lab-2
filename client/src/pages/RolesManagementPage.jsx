import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from "@mui/material";

const roles = [
    {
        id: 1,
        name: "Admin",
        description: "Full access to all modules and settings",
        users: 3,
        status: "Active",
    },
    {
        id: 2,
        name: "Manager",
        description: "Can manage bookings, destinations, and reports",
        users: 5,
        status: "Active",
    },
    {
        id: 3,
        name: "Editor",
        description: "Can edit content and destination information",
        users: 4,
        status: "Active",
    },
    {
        id: 4,
        name: "User",
        description: "Standard platform access",
        users: 120,
        status: "Active",
    },
];

export default function RolesManagementPage() {
    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    Roles Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Create and manage user roles in the platform.
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
                            Existing Roles
                        </Typography>

                        <Button variant="contained" sx={{ borderRadius: 3 }}>
                            Add Role
                        </Button>
                    </Stack>

                    <Box sx={{ overflowX: "auto" }}>
                        <Box
                            sx={{
                                minWidth: 760,
                                display: "grid",
                                gridTemplateColumns: "80px 1.3fr 2fr 1fr 1fr 1fr",
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                overflow: "hidden",
                            }}
                        >
                            {["ID", "Role Name", "Description", "Users", "Status", "Actions"].map((head) => (
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

                            {roles.map((role) => (
                                <Box key={role.id} sx={{ display: "contents" }}>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{role.id}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>
                                        {role.name}
                                    </Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
                                        {role.description}
                                    </Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{role.users}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
                                        <Chip label={role.status} color="success" size="small" />
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