import { AddRounded, AutoAwesomeRounded, ExploreRounded, SavingsRounded, StarRounded, TrendingUpRounded, ViewListRounded } from "../../ui/icons.jsx";
import { Box, Button, Grid, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AdminTopBar from "../../components/admin/AdminTopBar.jsx";
import { adminChartSegmentColors, adminColors } from "../../components/admin/adminStyles.js";
import BookingDetailDrawer from "../../components/admin/BookingDetailDrawer.jsx";
import CancelBookingModal from "../../components/admin/CancelBookingModal.jsx";
import RefundBookingModal from "../../components/admin/RefundBookingModal.jsx";
import DashboardAnalyticsSection from "../../components/admin/dashboard/DashboardAnalyticsSection.jsx";
import DashboardRecentBookings from "../../components/admin/dashboard/DashboardRecentBookings.jsx";
import ExecutiveMetricCard from "../../components/admin/dashboard/ExecutiveMetricCard.jsx";
import RevenueBookingsChart from "../../components/admin/dashboard/RevenueBookingsChart.jsx";
import MlPredictiveInsights from "../../components/admin/MlPredictiveInsights.jsx";
import SmartInsightsPanel from "../../components/admin/dashboard/SmartInsightsPanel.jsx";
import {
  buildChartSeries,
  computeDashboardKpis,
  computeDestinationBreakdown,
  computeStatusBreakdown,
  computeTopTrips,
  forecastNextWeek,
  generateSmartInsights,
} from "../../utils/adminDashboard.js";
import {
  filterAdminVisibleBookings,
  selectRecentBookings,
  useAdminBookingsStore,
} from "../../store/adminBookingsStore.js";
import { useAdminTripsStore } from "../../store/adminTripsStore.js";
import { useAdminUsersStore } from "../../store/adminUsersStore.js";
import { useToast } from "../../context/ToastContext.jsx";

const headerActionSx = {
  fontWeight: 600,
  textTransform: "none",
  whiteSpace: "nowrap",
};

export default function AdminDashboardPage() {
  const { showToast } = useToast();

  const bookings = useAdminBookingsStore((s) => s.bookings);
  const visibleBookings = useMemo(() => filterAdminVisibleBookings(bookings), [bookings]);
  const updateBookingStatus = useAdminBookingsStore((s) => s.updateBookingStatus);
  const approveBooking = useAdminBookingsStore((s) => s.approveBooking);
  const cancelBooking = useAdminBookingsStore((s) => s.cancelBooking);
  const refundBooking = useAdminBookingsStore((s) => s.refundBooking);
  const removeBooking = useAdminBookingsStore((s) => s.removeBooking);

  const trips = useAdminTripsStore((s) => s.trips);
  const users = useAdminUsersStore((s) => s.users);

  const [chartPeriod, setChartPeriod] = useState("daily");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);

  const recentBookings = useMemo(() => selectRecentBookings(visibleBookings), [visibleBookings]);
  const selectedBooking = useMemo(
    () => visibleBookings.find((b) => b.id === selectedBookingId) ?? null,
    [visibleBookings, selectedBookingId],
  );

  const kpis = useMemo(
    () => computeDashboardKpis(visibleBookings, users, trips),
    [visibleBookings, users, trips],
  );
  const chartData = useMemo(() => buildChartSeries(chartPeriod), [chartPeriod]);
  const insights = useMemo(
    () => generateSmartInsights(visibleBookings, trips, users),
    [visibleBookings, trips, users],
  );
  const destBreakdown = useMemo(
    () => computeDestinationBreakdown(visibleBookings),
    [visibleBookings],
  );
  const statusBreakdown = useMemo(
    () => computeStatusBreakdown(visibleBookings),
    [visibleBookings],
  );
  const topTrips = useMemo(() => computeTopTrips(trips), [trips]);
  const forecast = useMemo(() => forecastNextWeek(visibleBookings), [visibleBookings]);

  const recentUsers = useMemo(() => users.slice(0, 4), [users]);
  const flaggedUsers = useMemo(
    () => users.filter((u) => u.accountStatus === "suspended" || u.travelerStatus === "inactive").slice(0, 3),
    [users],
  );

  const destSegments = destBreakdown.length
    ? destBreakdown
    : [{ name: "—", count: 0, pct: 0, color: adminChartSegmentColors[0] }];

  function handleStatusChange(bookingId, statusKey) {
    updateBookingStatus(bookingId, statusKey);
    showToast({ message: "Status updated across dashboard & bookings.", severity: "success" });
  }

  const headerActions = (
    <>
      <Button
        component={RouterLink}
        to="/admin/trips"
        state={{ openCreate: true }}
        variant="contained"
        size="small"
        startIcon={<ExploreRounded />}
        sx={{ ...headerActionSx, fontWeight: 700 }}
      >
        New trip
      </Button>
      <Button
        component={RouterLink}
        to="/admin/bookings"
        variant="outlined"
        size="small"
        startIcon={<ViewListRounded />}
        sx={{
          ...headerActionSx,
          borderColor: alpha(adminColors.gold, 0.4),
          color: adminColors.gold,
        }}
      >
        Bookings
      </Button>
      <Button
        component={RouterLink}
        to="/admin/users"
        state={{ openInvite: true }}
        variant="outlined"
        size="small"
        startIcon={<AddRounded />}
        sx={{
          ...headerActionSx,
          borderColor: alpha(adminColors.gold, 0.4),
          color: adminColors.gold,
        }}
      >
        Invite
      </Button>
    </>
  );

  return (
    <Box sx={{ pb: 4 }}>
      <AdminTopBar title="Dashboard" actions={headerActions} />
      <Typography variant="body2" sx={{ color: adminColors.textMuted, mb: 2, mt: -2 }}>
        Live operations — metrics sync with Trips, Bookings, and Users.
      </Typography>

      <MlPredictiveInsights bookings={bookings} trips={trips} users={users} />

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <ExecutiveMetricCard label="Total bookings" value={kpis.totalBookings.value} delta={kpis.totalBookings.delta} trend={kpis.totalBookings.trend} icon={TrendingUpRounded} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <ExecutiveMetricCard label="Revenue" value={kpis.revenue.value} delta={kpis.revenue.delta} trend={kpis.revenue.trend} icon={SavingsRounded} format="currency" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <ExecutiveMetricCard label="Active users" value={kpis.activeUsers.value} delta={kpis.activeUsers.delta} trend={kpis.activeUsers.trend} icon={StarRounded} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <ExecutiveMetricCard label="AI travel score" value={kpis.aiScore.value} delta={kpis.aiScore.delta} trend={kpis.aiScore.trend} icon={AutoAwesomeRounded} format="score" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <RevenueBookingsChart data={chartData} period={chartPeriod} onPeriodChange={setChartPeriod} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SmartInsightsPanel insights={insights} forecast={forecast} />
        </Grid>
      </Grid>

      <Box sx={{ mb: 2.5 }}>
        <DashboardRecentBookings
          bookings={recentBookings}
          onStatusChange={handleStatusChange}
          onView={(row) => setSelectedBookingId(row.id)}
          onEdit={(row) => setSelectedBookingId(row.id)}
          onDelete={async (row) => {
            await removeBooking(row.id);
            showToast({ message: "Booking removed.", severity: "info" });
          }}
        />
      </Box>

      <DashboardAnalyticsSection
        destSegments={destSegments}
        statusItems={statusBreakdown}
        topTrips={topTrips}
        recentUsers={recentUsers}
        flaggedUsers={flaggedUsers}
      />

      <BookingDetailDrawer
        booking={selectedBooking}
        open={Boolean(selectedBooking)}
        onClose={() => setSelectedBookingId(null)}
        onApprove={(b) => {
          approveBooking(b.id);
          showToast({ message: "Booking approved.", severity: "success" });
        }}
        onRequestCancel={setCancelTarget}
        onRequestRefund={setRefundTarget}
      />

      <CancelBookingModal
        open={Boolean(cancelTarget)}
        booking={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={(payload) => {
          cancelBooking(cancelTarget.id, payload);
          setCancelTarget(null);
          showToast({ message: "Booking cancelled.", severity: "success" });
        }}
      />

      <RefundBookingModal
        open={Boolean(refundTarget)}
        booking={refundTarget}
        onClose={() => setRefundTarget(null)}
        onConfirm={(payload) => {
          refundBooking(refundTarget.id, payload);
          setRefundTarget(null);
          showToast({ message: "Refund processed.", severity: "success" });
        }}
      />
    </Box>
  );
}
