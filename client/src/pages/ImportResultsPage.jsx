import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from "@mui/material";

const importResults = [
    {
        id: 1,
        fileName: "users_import_april.csv",
        importedBy: "Eljesa Azemi",
        date: "2026-04-21 09:15",
        rows: 120,
        result: "Success",
    },
    {
        id: 2,
        fileName: "roles_update.xlsx",
        importedBy: "Arber Krasniqi",
        date: "2026-04-21 10:40",
        rows: 18,
        result: "Success",
    },
    {
        id: 3,
        fileName: "permissions_patch.csv",
        importedBy: "Sara Berisha",
        date: "2026-04-21 11:05",
        rows: 9,
        result: "Warning",
    },
    {
        id: 4,
        fileName: "recommendations_batch.xlsx",
        importedBy: "Blend Dema",
        date: "2026-04-21 12:20",
        rows: 42,
        result: "Failed",
    },
];

const allowedExtensions = [".csv", ".xlsx"];
const maxFileSize = 2 * 1024 * 1024;

const resultColor = (result) => {
    if (result === "Success") return "success";
    if (result === "Warning") return "warning";
    return "error";
};

export default function ImportResultsPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            setSelectedFile(null);
            setFeedback(null);
            return;
        }

        const lowerName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some((ext) =>
            lowerName.endsWith(ext)
        );

        if (!hasValidExtension) {
            setSelectedFile(null);
            setFeedback({
                type: "error",
                message: "Invalid file format. Only .csv and .xlsx files are allowed.",
            });
            return;
        }

        if (file.size > maxFileSize) {
            setSelectedFile(null);
            setFeedback({
                type: "error",
                message: "File is too large. Maximum allowed size is 2 MB.",
            });
            return;
        }

        setSelectedFile(file);
        setFeedback({
            type: "success",
            message: `File "${file.name}" is valid and ready for upload.`,
        });
    };

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    Import Results
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Review uploaded files and their processing results.
                </Typography>
            </Box>

            <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #e2e8f0" }}>
                <CardContent>
                    <Stack spacing={2} sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight={700}>
                            Upload and Validate File
                        </Typography>

                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
                            <Button variant="contained" component="label" sx={{ borderRadius: 3, width: { xs: "100%", md: "fit-content" } }}>
                                Choose File
                                <input hidden type="file" accept=".csv,.xlsx" onChange={handleFileChange} />
                            </Button>

                            <Typography variant="body2" color="text.secondary">
                                Allowed formats: .csv, .xlsx | Max size: 2 MB
                            </Typography>
                        </Stack>

                        {selectedFile && (
                            <Typography variant="body2">
                                Selected file: <strong>{selectedFile.name}</strong>
                            </Typography>
                        )}

                        {feedback && <Alert severity={feedback.type}>{feedback.message}</Alert>}
                    </Stack>

                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        Recent Import Results
                    </Typography>

                    <Box sx={{ overflowX: "auto" }}>
                        <Box
                            sx={{
                                minWidth: 920,
                                display: "grid",
                                gridTemplateColumns: "80px 1.8fr 1.3fr 1.4fr 100px 1fr",
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                overflow: "hidden",
                            }}
                        >
                            {["ID", "File Name", "Imported By", "Date", "Rows", "Result"].map((head) => (
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

                            {importResults.map((item) => (
                                <Box key={item.id} sx={{ display: "contents" }}>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{item.id}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>
                                        {item.fileName}
                                    </Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{item.importedBy}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{item.date}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{item.rows}</Box>
                                    <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
                                        <Chip label={item.result} color={resultColor(item.result)} size="small" />
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