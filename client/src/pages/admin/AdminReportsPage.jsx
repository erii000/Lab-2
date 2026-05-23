import { Box, Typography } from "@mui/material";
import AdminReportsBuilder from "../../components/admin/AdminReportsBuilder.jsx";
import AdminTopBar from "../../components/admin/AdminTopBar.jsx";
import { adminColors } from "../../components/admin/adminStyles.js";

export default function AdminReportsPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100 }}>
      <AdminTopBar title="Reports" />
      <Typography variant="body2" sx={{ color: adminColors.textMuted, mb: 3 }}>
        Generate customized operational reports from live admin data.
      </Typography>
      <AdminReportsBuilder />
    </Box>
  );
}
