import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { useToast } from "../../context/ToastContext.jsx";
import {
  filterAdminVisibleBookings,
  useAdminBookingsStore,
} from "../../store/adminBookingsStore.js";
import { useAdminTripsStore } from "../../store/adminTripsStore.js";
import { useAdminUsersStore } from "../../store/adminUsersStore.js";
import {
  buildReportRows,
  downloadCsv,
  openPrintReport,
  REPORT_TYPES,
} from "../../utils/reportGenerator.js";
import { adminColors, adminPanelSx } from "./adminStyles.js";

const STATUS_BY_TYPE = {
  bookings: [
    { value: "all", label: "All statuses" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "cancelled", label: "Cancelled" },
  ],
  users: [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
  ],
  trips: [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" },
  ],
};

export default function AdminReportsBuilder() {
  const { showToast } = useToast();
  const bookings = useAdminBookingsStore((s) => s.bookings);
  const visibleBookings = useMemo(() => filterAdminVisibleBookings(bookings), [bookings]);
  const trips = useAdminTripsStore((s) => s.trips);
  const users = useAdminUsersStore((s) => s.users);

  const [reportType, setReportType] = useState("bookings");
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-12-31");
  const [status, setStatus] = useState("all");

  const criteria = useMemo(
    () => ({ dateFrom, dateTo, status, reportType }),
    [dateFrom, dateTo, status, reportType],
  );

  const rows = useMemo(
    () => buildReportRows(reportType, { bookings: visibleBookings, trips, users }, criteria),
    [reportType, visibleBookings, trips, users, criteria],
  );

  const meta = REPORT_TYPES.find((r) => r.id === reportType);

  function exportCsv() {
    if (!rows.length) {
      showToast({ message: "No rows match your criteria.", severity: "warning" });
      return;
    }
    downloadCsv(`smart-travel-${reportType}-${Date.now()}.csv`, rows);
    showToast({ message: `Exported ${rows.length} rows to CSV.`, severity: "success" });
  }

  function exportPdf() {
    if (!rows.length) {
      showToast({ message: "No rows to print.", severity: "warning" });
      return;
    }
    const ok = openPrintReport(meta?.label ?? "Report", rows, criteria);
    if (!ok) showToast({ message: "Allow pop-ups to print / save as PDF.", severity: "info" });
  }

  return (
    <Paper sx={{ ...adminPanelSx, p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>
        Dynamic report builder
      </Typography>
      <Typography variant="body2" sx={{ color: adminColors.textMuted, mb: 3 }}>
        Filter by date range and status, preview row counts, then export to CSV or print-ready PDF.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Report type</InputLabel>
            <Select label="Report type" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              {REPORT_TYPES.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" sx={{ color: adminColors.textMuted, mt: 0.75, display: "block" }}>
            {meta?.description}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            label="From"
            type="date"
            size="small"
            fullWidth
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            label="To"
            type="date"
            size="small"
            fullWidth
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        {STATUS_BY_TYPE[reportType] ? (
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_BY_TYPE[reportType].map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ) : null}
      </Grid>

      <Box
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          bgcolor: alpha(adminColors.gold, 0.06),
          border: `1px solid ${alpha(adminColors.gold, 0.2)}`,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: adminColors.gold }}>
          Preview · {rows.length} rows
        </Typography>
        {rows.slice(0, 3).map((row, i) => (
          <Typography key={i} variant="caption" sx={{ color: adminColors.textMuted, display: "block" }}>
            {JSON.stringify(row)}
          </Typography>
        ))}
        {rows.length > 3 ? (
          <Typography variant="caption" sx={{ color: adminColors.textMuted }}>
            …and {rows.length - 3} more
          </Typography>
        ) : null}
      </Box>

      <Stack direction="row" spacing={1.5} flexWrap="wrap">
        <Button
          variant="contained"
          startIcon={<DownloadRoundedIcon />}
          onClick={exportCsv}
          sx={{ fontWeight: 800 }}
        >
          Export CSV
        </Button>
        <Button
          variant="outlined"
          startIcon={<PictureAsPdfRoundedIcon />}
          onClick={exportPdf}
          sx={{ fontWeight: 700 }}
        >
          Print / PDF
        </Button>
      </Stack>
    </Paper>
  );
}
