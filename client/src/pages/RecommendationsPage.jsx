import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from "@mui/material";

const recommendations = [
    {
        id: 1,
        title: "Paris City Escape",
        category: "City Break",
        audience: "Couples",
        priority: "High",
        status: "Active",
    },
    {
        id: 2,
        title: "Swiss Alps Adventure",
        category: "Adventure",
        audience: "Families",
        priority: "Medium",
        status: "Active",
    },
    {
        id: 3,
        title: "Istanbul Weekend Deal",
        category: "Budget Travel",
        audience: "Students",
        priority: "High",
        status: "Draft",
    },
    {
        id: 4,
        title: "Dubai Luxury Package",
        category: "Luxury",
        audience: "Professionals",
        priority: "Low",
        status: "Active",
    },
];

const priorityColor = (priority) => {
    if (priority === "High") return "error";
    if (priority === "Medium") return "warning";
    return "default";
};

const statusColor = (status) => {
    if (status === "Active") return "success";
    return "default";
};

export default function RecommendationsPage() {
    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    Recommendations
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage recommended travel offers and personalized suggestions.
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
                            Recommended Items
                        </Typography>

                        <Button variant="contained" sx={{ borderRadius: 3 }}>
                            Add Recommendation
                        </Button>
                    </Stack>

                    <Box sx={{ overflowX: "auto" }}>
                        <Box
                            sx={{
                                minWidth: 900,
                                display: "grid",
                                gridTemplateColumns: "80px 1.8fr 1.2fr 1.3fr 1fr 1fr 1fr",
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                overflow: "hidden",
                            }}
                        >
                            {["ID", "Title", "Category", "Audience", "Priority", "Status", "Actions"].map((head) => (
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

                            {recommendations.map((item) => (
                                <Box key={item.id} sx={{ display: "contents" }}>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{item.id}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>
                                        {item.title}
                                    </Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{item.category}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{item.audience}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
                                        <Chip label={item.priority} color={priorityColor(item.priority)} size="small" />
                                    </Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
                                        <Chip label={item.status} color={statusColor(item.status)} size="small" />
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