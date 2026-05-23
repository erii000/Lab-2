import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useMemo, useState } from "react";
import AdvancedListToolbar from "../../components/search/AdvancedListToolbar.jsx";
import AdminTopBar from "../../components/admin/AdminTopBar.jsx";
import BookingDetailDrawer from "../../components/admin/BookingDetailDrawer.jsx";
import BookingStatusSelect from "../../components/admin/BookingStatusSelect.jsx";
import CancelBookingModal from "../../components/admin/CancelBookingModal.jsx";
import RefundBookingModal from "../../components/admin/RefundBookingModal.jsx";
import {
  adminPanelSx,
  adminTableHeadSx,
  adminTableRowSx,
  adminColors,
} from "../../components/admin/adminStyles.js";
import { normalizeStatusKey, useAdminBookingsStore } from "../../store/adminBookingsStore.js";
import { useToast } from "../../context/ToastContext.jsx";
import {
  ADMIN_BOOKING_SORT_OPTIONS,
  applyAdvancedListQuery,
} from "../../utils/advancedSearch.js";

export default function AdminBookingsPage() {
  const { showToast } = useToast();
  const bookings = useAdminBookingsStore((s) => s.bookings);
  const updateBookingStatus = useAdminBookingsStore((s) => s.updateBookingStatus);
  const approveBooking = useAdminBookingsStore((s) => s.approveBooking);
  const cancelBooking = useAdminBookingsStore((s) => s.cancelBooking);
  const refundBooking = useAdminBookingsStore((s) => s.refundBooking);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("id-desc");
  const [selectedId, setSelectedId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);

  const selected = useMemo(
    () => (selectedId ? bookings.find((b) => b.id === selectedId) : null),
    [bookings, selectedId],
  );

  const filtered = useMemo(() => {
    const base = bookings.filter((b) => {
      const statusKey = normalizeStatusKey(b.status);
      return statusFilter === "all" || statusKey === statusFilter;
    });
    return applyAdvancedListQuery({
      items: base,
      query,
      getSearchableText: (b) =>
        `${b.id} ${b.user} ${b.email ?? ""} ${b.destination} ${b.travelDates} ${b.status} ${b.invoice ?? ""}`,
      sortKey,
      sortDir: sortKey.includes("desc") ? "desc" : "asc",
      getSortValue: (b, key) => {
        if (key === "amount-desc") return b.amount;
        if (key === "user-asc") return b.user;
        if (key === "destination-asc") return b.destination;
        return b.id;
      },
    });
  }, [bookings, query, statusFilter, sortKey]);

  function handleStatusChange(bookingId, statusKey) {
    if (statusKey === "cancelled" || statusKey === "refunded") {
      const booking = bookings.find((b) => b.id === bookingId);
      if (statusKey === "cancelled") setCancelTarget(booking);
      else setRefundTarget(booking);
      return;
    }
    updateBookingStatus(bookingId, statusKey);
    showToast({ message: "Booking status updated.", severity: "success" });
  }

  function handleApprove(booking) {
    approveBooking(booking.id);
    showToast({ message: "Booking approved. Traveler notified.", severity: "success" });
  }

  function handleCancelConfirm(payload) {
    if (!cancelTarget) return;
    cancelBooking(cancelTarget.id, payload);
    setCancelTarget(null);
    showToast({
      message: payload.issueRefund
        ? "Booking cancelled and refund issued. Traveler notified."
        : "Booking cancelled. Traveler notified.",
      severity: "success",
    });
  }

  function handleRefundConfirm(payload) {
    if (!refundTarget) return;
    refundBooking(refundTarget.id, payload);
    setRefundTarget(null);
    showToast({
      message:
        payload.refundType === "full"
          ? "Full refund confirmed. Traveler notified."
          : "Partial refund confirmed. Traveler notified.",
      severity: "success",
    });
  }

  return (
    <Box>
      <AdminTopBar title="Bookings" />

      <AdvancedListToolbar
        accent="admin"
        query={query}
        onQueryChange={setQuery}
        sort={sortKey}
        onSortChange={setSortKey}
        sortOptions={ADMIN_BOOKING_SORT_OPTIONS}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={[
          { value: "all", label: "All statuses" },
          { value: "paid", label: "Paid" },
          { value: "pending", label: "Pending" },
          { value: "cancelled", label: "Cancelled" },
          { value: "refunded", label: "Refunded" },
          { value: "partially_refunded", label: "Partially refunded" },
        ]}
        resultCount={filtered.length}
        placeholder="Full-text search bookings…"
      />

      <Paper sx={{ ...adminPanelSx, overflow: "hidden" }}>
        <Table>
          <TableHead sx={adminTableHeadSx}>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>Traveler</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Travel dates</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id} sx={adminTableRowSx} onClick={() => setSelectedId(row.id)}>
                <TableCell sx={{ color: adminColors.textMuted, fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {row.id}
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>{row.user}</TableCell>
                <TableCell sx={{ color: adminColors.textMuted }}>{row.destination}</TableCell>
                <TableCell sx={{ color: adminColors.textMuted, fontSize: "0.85rem" }}>{row.travelDates}</TableCell>
                <TableCell align="right" sx={{ color: adminColors.gold, fontWeight: 700 }}>
                  €{row.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <BookingStatusSelect
                    bookingId={row.id}
                    status={row.status}
                    onChange={handleStatusChange}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <BookingDetailDrawer
        booking={selected}
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        onApprove={handleApprove}
        onRequestCancel={setCancelTarget}
        onRequestRefund={setRefundTarget}
      />

      <CancelBookingModal
        open={Boolean(cancelTarget)}
        booking={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
      />

      <RefundBookingModal
        open={Boolean(refundTarget)}
        booking={refundTarget}
        onClose={() => setRefundTarget(null)}
        onConfirm={handleRefundConfirm}
      />
    </Box>
  );
}
