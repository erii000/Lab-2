import { useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    MenuItem,
    Pagination,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { useAdminUsers } from "../hooks/useAdminUsers.js";

const rowsPerPage = 5;

export default function UsersManagementPage() {
    const { users: usersData, loading, error } = useAdminUsers();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("name-asc");
    const [page, setPage] = useState(1);

    const filteredAndSortedUsers = useMemo(() => {
        let result = [...usersData];

        if (search.trim()) {
            const query = search.toLowerCase();
            result = result.filter(
                (user) =>
                    user.name.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query)
            );
        }

        if (roleFilter !== "All") {
            result = result.filter((user) => user.role === roleFilter);
        }

        if (statusFilter !== "All") {
            result = result.filter((user) => user.status === statusFilter);
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                case "role-asc":
                    return a.role.localeCompare(b.role);
                case "role-desc":
                    return b.role.localeCompare(a.role);
                default:
                    return 0;
            }
        });

        return result;
    }, [usersData, search, roleFilter, statusFilter, sortBy]);

    const totalPages = Math.ceil(filteredAndSortedUsers.length / rowsPerPage);

    const paginatedUsers = filteredAndSortedUsers.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleRoleChange = (e) => {
        setRoleFilter(e.target.value);
        setPage(1);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(1);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setPage(1);
    };

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    Users Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    View, filter, sort, and manage platform users from the shared database.
                </Typography>
                {error && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {error}
                    </Typography>
                )}
            </Box>

            <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #e2e8f0" }}>
                <CardContent>
                    <Stack spacing={2} sx={{ mb: 3 }}>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            justifyContent="space-between"
                        >
                            <TextField
                                label="Search users"
                                placeholder="Search by name or email"
                                size="small"
                                value={search}
                                onChange={handleSearchChange}
                                sx={{ minWidth: { xs: "100%", md: 280 } }}
                            />

                            <Button variant="contained" sx={{ borderRadius: 3 }}>
                                Add User
                            </Button>
                        </Stack>

                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <TextField
                                select
                                label="Filter by role"
                                size="small"
                                value={roleFilter}
                                onChange={handleRoleChange}
                                sx={{ minWidth: 180 }}
                            >
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="Manager">Manager</MenuItem>
                                <MenuItem value="Editor">Editor</MenuItem>
                                <MenuItem value="User">User</MenuItem>
                                <MenuItem value="Traveler">Traveler</MenuItem>
                            </TextField>

                            <TextField
                                select
                                label="Filter by status"
                                size="small"
                                value={statusFilter}
                                onChange={handleStatusChange}
                                sx={{ minWidth: 180 }}
                            >
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                            </TextField>

                            <TextField
                                select
                                label="Sort by"
                                size="small"
                                value={sortBy}
                                onChange={handleSortChange}
                                sx={{ minWidth: 180 }}
                            >
                                <MenuItem value="name-asc">Name A-Z</MenuItem>
                                <MenuItem value="name-desc">Name Z-A</MenuItem>
                                <MenuItem value="role-asc">Role A-Z</MenuItem>
                                <MenuItem value="role-desc">Role Z-A</MenuItem>
                            </TextField>
                        </Stack>
                    </Stack>

                    <Box sx={{ overflowX: "auto" }}>
                        <Box
                            sx={{
                                minWidth: 760,
                                display: "grid",
                                gridTemplateColumns: "80px 1.5fr 2fr 1fr 1fr 1fr",
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                overflow: "hidden",
                            }}
                        >
                            {["ID", "Name", "Email", "Role", "Status", "Actions"].map((head) => (
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

                            {loading ? (
                                <Box
                                    sx={{
                                        gridColumn: "1 / -1",
                                        p: 3,
                                        textAlign: "center",
                                        color: "text.secondary",
                                    }}
                                >
                                    Loading users…
                                </Box>
                            ) : paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <Box key={user.id} sx={{ display: "contents" }}>
                                        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{user.id}</Box>
                                        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{user.name}</Box>
                                        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{user.email}</Box>
                                        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>{user.role}</Box>
                                        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
                                            <Chip
                                                label={user.status}
                                                color={user.status === "Active" ? "success" : "default"}
                                                size="small"
                                            />
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
                                ))
                            ) : (
                                <Box
                                    sx={{
                                        gridColumn: "1 / -1",
                                        p: 3,
                                        textAlign: "center",
                                        color: "text.secondary",
                                    }}
                                >
                                    No users found.
                                </Box>
                            )}
                        </Box>
                    </Box>

                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        spacing={2}
                        sx={{ mt: 3 }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Showing {paginatedUsers.length} of {filteredAndSortedUsers.length} users
                        </Typography>

                        {totalPages > 1 && (
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, value) => setPage(value)}
                                color="primary"
                                shape="rounded"
                            />
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
}