import { AddRounded, MoreVertRounded } from "../../ui/icons.jsx";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminDataExchangeBar from "../../components/admin/AdminDataExchangeBar.jsx";
import AdvancedListToolbar from "../../components/search/AdvancedListToolbar.jsx";
import AdminNotificationsMenu from "../../components/admin/AdminNotificationsMenu.jsx";
import ConfirmUserActionModal from "../../components/admin/users/ConfirmUserActionModal.jsx";
import InviteUserModal from "../../components/admin/users/InviteUserModal.jsx";
import UserDetailDrawer from "../../components/admin/users/UserDetailDrawer.jsx";
import UsersBulkBar from "../../components/admin/users/UsersBulkBar.jsx";
import {
  adminColors,
  adminPanelSx,
  adminTableHeadSx,
  adminTableRowSx,
} from "../../components/admin/adminStyles.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuthStore } from "../../store/authStore.js";
import { useAdminUsersStore } from "../../store/adminUsersStore.js";
import {
  filterUsers,
  formatUserValue,
  getTravelerStatusMeta,
  USER_FILTER_CHIPS,
} from "../../utils/adminUsers.js";
import { ADMIN_USER_SORT_OPTIONS, applyAdvancedListQuery } from "../../utils/advancedSearch.js";

export default function AdminUsersPage() {
  const location = useLocation();
  const { showToast } = useToast();
  const users = useAdminUsersStore((s) => s.users);
  const updateUser = useAdminUsersStore((s) => s.updateUser);
  const inviteUser = useAdminUsersStore((s) => s.inviteUser);
  const setTravelerStatus = useAdminUsersStore((s) => s.setTravelerStatus);
  const deactivateUser = useAdminUsersStore((s) => s.deactivateUser);
  const suspendUser = useAdminUsersStore((s) => s.suspendUser);
  const deleteUser = useAdminUsersStore((s) => s.deleteUser);
  const bulkSetStatus = useAdminUsersStore((s) => s.bulkSetStatus);
  const bulkDeactivate = useAdminUsersStore((s) => s.bulkDeactivate);
  const bulkDelete = useAdminUsersStore((s) => s.bulkDelete);
  const hydrateFromApi = useAdminUsersStore((s) => s.hydrateFromApi);
  const ensureAccessToken = useAuthStore((s) => s.ensureAccessToken);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("spent-desc");
  const [selectedId, setSelectedId] = useState(null);
  const [checked, setChecked] = useState(new Set());
  const [hoveredId, setHoveredId] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuUser, setMenuUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (location.state?.openInvite) setInviteOpen(true);
  }, [location.state]);

  const filtered = useMemo(() => {
    const base = filterUsers(users, { query: "", statusFilter });
    return applyAdvancedListQuery({
      items: base,
      query,
      getSearchableText: (u) =>
        `${u.name} ${u.email} ${u.favoriteDestination ?? ""} ${(u.preferences ?? []).join(" ")} ${u.travelerStatus} ${u.accountStatus}`,
      sortKey,
      sortDir: sortKey.includes("desc") ? "desc" : "asc",
      getSortValue: (u, key) => {
        if (key === "spent-desc") return u.totalSpent ?? 0;
        if (key === "trips-desc") return u.trips ?? 0;
        if (key === "name-asc") return u.name;
        return u.lastActive ?? "";
      },
    });
  }, [users, query, statusFilter, sortKey]);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedId) ?? null,
    [users, selectedId],
  );

  const showCheckboxes = checked.size > 0 || hoveredId !== null;

  function toggleCheck(id, e) {
    e?.stopPropagation();
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openRowMenu(e, user) {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuUser(user);
  }

  async function handleInvite(data) {
    try {
      await inviteUser(data);
      showToast({ message: `Account created for ${data.email}`, severity: "success" });
    } catch (err) {
      showToast({
        message: err?.message ?? "Could not invite user.",
        severity: "error",
      });
    }
  }

  function handleQuickAction(type, user) {
    if (type === "recommendation") showToast({ message: `Recommendation generated for ${user.name}`, severity: "success" });
    if (type === "offer") showToast({ message: `Offer sent to ${user.email}`, severity: "success" });
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight={800} sx={{ color: "#fff", letterSpacing: "-0.02em" }}>
          Users
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AdminNotificationsMenu />
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddRounded />}
          onClick={() => setInviteOpen(true)}
          sx={{ borderColor: alpha(adminColors.gold, 0.4), color: adminColors.gold, fontWeight: 600 }}
        >
          Invite
        </Button>
        </Stack>
      </Stack>

      <AdminDataExchangeBar
        resource="users"
        compact
        onImported={async () => {
          const token = await ensureAccessToken();
          if (token) await hydrateFromApi(token);
        }}
      />

      <AdvancedListToolbar
        accent="admin"
        query={query}
        onQueryChange={setQuery}
        sort={sortKey}
        onSortChange={setSortKey}
        sortOptions={ADMIN_USER_SORT_OPTIONS}
        resultCount={filtered.length}
        placeholder="Full-text search travelers…"
      />

      <Stack direction="row" spacing={0.75} sx={{ mb: 2.5 }}>
        {USER_FILTER_CHIPS.map((chip) => {
          const active = statusFilter === chip.id;
          return (
            <Chip
              key={chip.id}
              label={chip.label}
              size="small"
              onClick={() => setStatusFilter(chip.id)}
              sx={{
                fontWeight: 600,
                bgcolor: active ? alpha(adminColors.gold, 0.15) : "transparent",
                color: active ? adminColors.gold : adminColors.textMuted,
                border: `1px solid ${active ? alpha(adminColors.gold, 0.4) : adminColors.border}`,
              }}
            />
          );
        })}
      </Stack>

      <UsersBulkBar
        count={checked.size}
        onMarkVip={() => {
          bulkSetStatus([...checked], "vip");
          showToast({ message: "Marked as VIP.", severity: "success" });
          setChecked(new Set());
        }}
        onDeactivate={() => {
          bulkDeactivate([...checked]);
          showToast({ message: "Users deactivated.", severity: "info" });
          setChecked(new Set());
        }}
        onDelete={() => {
          bulkDelete([...checked]);
          showToast({ message: "Users deleted.", severity: "info" });
          setChecked(new Set());
        }}
        onClear={() => setChecked(new Set())}
      />

      <Paper sx={{ ...adminPanelSx, overflow: "hidden" }}>
        <Table size="small">
          <TableHead sx={adminTableHeadSx}>
            <TableRow>
              {showCheckboxes ? <TableCell padding="checkbox" sx={{ width: 48, border: 0 }} /> : null}
              <TableCell>Traveler</TableCell>
              <TableCell>Trips</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell padding="checkbox" sx={{ width: 48, border: 0 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((user) => {
              const meta = getTravelerStatusMeta(user.travelerStatus);
              const isHovered = hoveredId === user.id;
              const isSelected = selectedId === user.id;
              return (
                <TableRow
                  key={user.id}
                  hover
                  selected={isSelected}
                  onMouseEnter={() => setHoveredId(user.id)}
                  onMouseLeave={() => setHoveredId((id) => (id === user.id ? null : id))}
                  onClick={() => setSelectedId(user.id)}
                  sx={{
                    ...adminTableRowSx,
                    bgcolor: isSelected ? alpha(adminColors.gold, 0.06) : isHovered ? alpha("#fff", 0.02) : undefined,
                  }}
                >
                  {showCheckboxes ? (
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()} sx={{ borderColor: adminColors.border }}>
                      <Checkbox
                        size="small"
                        checked={checked.has(user.id)}
                        onChange={(e) => toggleCheck(user.id, e)}
                        sx={{ opacity: isHovered || checked.has(user.id) ? 1 : 0, transition: "opacity 0.2s" }}
                      />
                    </TableCell>
                  ) : null}
                  <TableCell sx={{ borderColor: adminColors.border }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: "#fff" }}>
                      {user.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: adminColors.textMuted, borderColor: adminColors.border }}>{user.trips}</TableCell>
                  <TableCell sx={{ borderColor: adminColors.border }}>
                    <Chip label={meta.label} size="small" color={meta.color} sx={{ height: 22, fontSize: "0.65rem", fontWeight: 700 }} />
                  </TableCell>
                  <TableCell align="right" sx={{ color: adminColors.gold, fontWeight: 700, borderColor: adminColors.border, fontVariantNumeric: "tabular-nums" }}>
                    {formatUserValue(user.totalSpent)}
                  </TableCell>
                  <TableCell sx={{ color: adminColors.textMuted, borderColor: adminColors.border, fontSize: "0.85rem" }}>
                    {user.lastActive}
                  </TableCell>
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()} sx={{ borderColor: adminColors.border }}>
                    <IconButton
                      size="small"
                      onClick={(e) => openRowMenu(e, user)}
                      sx={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.2s", color: adminColors.textMuted }}
                    >
                      <MoreVertRounded fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { deactivateUser(menuUser.id); setMenuAnchor(null); showToast({ message: "User deactivated.", severity: "info" }); }}>
          Deactivate
        </MenuItem>
        <MenuItem onClick={() => { suspendUser(menuUser.id); setMenuAnchor(null); showToast({ message: "User suspended.", severity: "info" }); }}>
          Suspend
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setDeleteTarget(menuUser);
          }}
          sx={{ color: "error.main" }}
        >
          Delete
        </MenuItem>
      </Menu>

      <UserDetailDrawer
        user={selectedUser}
        open={Boolean(selectedUser)}
        onClose={() => setSelectedId(null)}
        onUpdate={(id, patch) => {
          updateUser(id, patch);
          showToast({ message: "User updated.", severity: "success" });
        }}
        onSetStatus={(id, status) => {
          setTravelerStatus(id, status);
          showToast({ message: "Status updated.", severity: "success" });
        }}
        onDeactivate={(id) => {
          deactivateUser(id);
          showToast({ message: "User deactivated.", severity: "info" });
        }}
        onSuspend={(id) => {
          suspendUser(id);
          showToast({ message: "User suspended.", severity: "info" });
        }}
        onDelete={(u) => setDeleteTarget(u)}
        onQuickAction={handleQuickAction}
      />

      <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite} />

      <ConfirmUserActionModal
        open={Boolean(deleteTarget)}
        title="Delete traveler?"
        message={`Remove ${deleteTarget?.name} permanently? This cannot be undone.`}
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteUser(deleteTarget.id);
          if (selectedId === deleteTarget.id) setSelectedId(null);
          setDeleteTarget(null);
          showToast({ message: "User deleted.", severity: "info" });
        }}
      />
    </Box>
  );
}
