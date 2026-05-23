import { MoreVertRounded } from "../../../ui/icons.jsx";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import BookingStatusSelect from "../BookingStatusSelect.jsx";
import { adminColors, adminPanelSx, adminTableHeadSx, adminTableRowSx } from "../adminStyles.js";

export default function DashboardRecentBookings({ bookings, onStatusChange, onView, onEdit, onDelete }) {
  const [menu, setMenu] = useState({ anchor: null, row: null });

  if (!bookings.length) {
    return (
      <Paper sx={{ ...adminPanelSx, p: 3, textAlign: "center" }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: adminColors.gold, mb: 0.5 }}>
          No bookings yet
        </Typography>
        <Typography variant="body2" sx={{ color: adminColors.textMuted, mb: 1.5 }}>
          New reservations will appear here in real time.
        </Typography>
        <Typography
          component={RouterLink}
          to="/admin/bookings"
          variant="body2"
          sx={{ color: adminColors.gold, textDecoration: "none", fontWeight: 600 }}
        >
          Go to bookings →
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ ...adminPanelSx, overflow: "hidden" }}>
      <Box sx={{ px: 2, pt: 2, pb: 0.5 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: adminColors.gold }}>
          Recent bookings
        </Typography>
        <Typography variant="caption" sx={{ color: adminColors.textMuted }}>
          Synced with Bookings
        </Typography>
      </Box>
      <Table size="small">
        <TableHead sx={adminTableHeadSx}>
          <TableRow>
            <TableCell>Traveler</TableCell>
            <TableCell>Destination</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell padding="checkbox" />
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((row) => (
            <TableRow key={row.id} sx={adminTableRowSx} onClick={() => onView?.(row)}>
              <TableCell sx={{ fontWeight: 600 }}>{row.user}</TableCell>
              <TableCell sx={{ color: adminColors.textMuted }}>{row.destination}</TableCell>
              <TableCell align="right" sx={{ color: adminColors.gold, fontWeight: 700 }}>
                €{row.amount?.toLocaleString()}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <BookingStatusSelect bookingId={row.id} status={row.status} onChange={onStatusChange} />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <IconButton
                  size="small"
                  onClick={(e) => setMenu({ anchor: e.currentTarget, row })}
                  sx={{ color: adminColors.textMuted }}
                >
                  <MoreVertRounded fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Menu anchorEl={menu.anchor} open={Boolean(menu.anchor)} onClose={() => setMenu({ anchor: null, row: null })}>
        <MenuItem onClick={() => { onView?.(menu.row); setMenu({ anchor: null, row: null }); }}>View</MenuItem>
        <MenuItem onClick={() => { onEdit?.(menu.row); setMenu({ anchor: null, row: null }); }}>Edit</MenuItem>
        <MenuItem component={RouterLink} to="/admin/bookings" onClick={() => setMenu({ anchor: null, row: null })}>
          Open in bookings
        </MenuItem>
        <MenuItem onClick={() => { onDelete?.(menu.row); setMenu({ anchor: null, row: null }); }} sx={{ color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
}
