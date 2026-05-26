import { AddRounded, CloseRounded, DeleteOutlineRounded, EditRounded, MoreVertRounded } from "../../../ui/icons.jsx";
import {
  Box,
  Button,
  Chip,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import SafeImage from "../../common/SafeImage.jsx";
import { mediaUrlsFromTrip } from "../../../utils/destinationGallery.js";
import { getTripStatusMeta, TRIP_STATUSES, TRIP_STYLE_OPTIONS } from "../../../utils/adminTrips.js";
import { adminColors } from "../adminStyles.js";

function Section({ title, children }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="overline" sx={{ color: adminColors.textMuted, fontWeight: 700, letterSpacing: "0.08em", mb: 1.5, display: "block" }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function TripWorkspaceDrawer({
  trip,
  open,
  onClose,
  onUpdate,
  onPublish,
  onMenuAction,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (trip) {
      const copy = JSON.parse(JSON.stringify(trip));
      const urls = mediaUrlsFromTrip(copy);
      copy.image = urls[0] ?? copy.image ?? "";
      copy.gallery = urls;
      setDraft(copy);
    }
    setEditing(false);
    setSnapshot(null);
    setNewImageUrl("");
  }, [trip]);

  if (!trip || !draft) return null;

  const statusMeta = getTripStatusMeta(draft.status);
  const mediaUrls = mediaUrlsFromTrip(draft);

  function startEdit() {
    setSnapshot(JSON.parse(JSON.stringify(draft)));
    setEditing(true);
  }

  function cancelEdit() {
    if (snapshot) setDraft(snapshot);
    setEditing(false);
    setSnapshot(null);
    setNewImageUrl("");
  }

  function save() {
    const urls = mediaUrlsFromTrip(draft);
    const payload = {
      ...draft,
      image: urls[0] ?? draft.image,
      gallery: urls,
    };
    onUpdate?.(payload);
    setEditing(false);
    setSnapshot(null);
    setNewImageUrl("");
  }

  function addImageUrl() {
    const url = newImageUrl.trim();
    if (!url) return;
    const urls = mediaUrlsFromTrip(draft);
    if (!urls.includes(url)) {
      setDraft({ ...draft, gallery: [...urls, url], image: draft.image || url });
    }
    setNewImageUrl("");
  }

  function removeImage(url) {
    const urls = mediaUrlsFromTrip(draft).filter((u) => u !== url);
    setDraft({
      ...draft,
      gallery: urls,
      image: urls[0] ?? "",
    });
  }

  function setAsCover(url) {
    const urls = mediaUrlsFromTrip(draft).filter((u) => u !== url);
    setDraft({ ...draft, image: url, gallery: [url, ...urls] });
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 440 }, bgcolor: adminColors.bg, borderLeft: `1px solid ${adminColors.border}` },
      }}
    >
      <Stack sx={{ height: "100%" }}>
        <SafeImage
          src={draft.image}
          alt=""
          sx={{ width: "100%", height: 160, objectFit: "cover" }}
        />
        <Stack sx={{ flex: 1, overflow: "auto", px: 2.5, py: 2, pb: editing ? 10 : 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {editing ? (
                <TextField fullWidth size="small" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} sx={{ mb: 1 }} label="Trip title" InputLabelProps={{ shrink: true }} />
              ) : (
                <Typography variant="h5" fontWeight={800} sx={{ color: "#fff" }}>{draft.title}</Typography>
              )}
              <Typography variant="body2" sx={{ color: adminColors.textMuted }}>{draft.country}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label={statusMeta.label} size="small" color={statusMeta.color} sx={{ fontWeight: 700 }} />
              </Stack>
            </Box>
            <Stack direction="row">
              {!editing ? (
                <IconButton size="small" onClick={startEdit} sx={{ color: adminColors.gold }} aria-label="Edit trip">
                  <EditRounded fontSize="small" />
                </IconButton>
              ) : null}
              <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: adminColors.textMuted }}>
                <MoreVertRounded fontSize="small" />
              </IconButton>
              <IconButton onClick={onClose} sx={{ color: adminColors.textMuted }}><CloseRounded /></IconButton>
            </Stack>
          </Stack>

          <Typography variant="caption" sx={{ color: adminColors.textMuted, display: "block", mt: 1, mb: 1.5, lineHeight: 1.5 }}>
            Catalog package — saved images appear on the public destination page gallery.
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button size="small" variant="contained" onClick={() => onPublish?.(draft)} sx={{ fontWeight: 700 }} disabled={editing}>Publish</Button>
            <Button size="small" variant="outlined" onClick={() => window.open(`/destination/${draft.id}`, "_blank")} sx={{ borderColor: adminColors.border }}>
              Preview
            </Button>
          </Stack>

          <Section title="Overview">
            {editing ? (
              <Stack spacing={1.5}>
                <TextField fullWidth size="small" label="Country" value={draft.country ?? ""} onChange={(e) => setDraft({ ...draft, country: e.target.value })} InputLabelProps={{ shrink: true }} />
                <TextField fullWidth size="small" label="Subtitle" value={draft.subtitle ?? ""} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} InputLabelProps={{ shrink: true }} />
                <TextField fullWidth size="small" type="number" label="Price from (€)" value={draft.priceFrom ?? 0} onChange={(e) => setDraft({ ...draft, priceFrom: Number(e.target.value) })} InputLabelProps={{ shrink: true }} />
                <TextField fullWidth size="small" type="number" label="Duration (days)" value={draft.days ?? 4} onChange={(e) => setDraft({ ...draft, days: Number(e.target.value) })} InputLabelProps={{ shrink: true }} />
                <TextField fullWidth size="small" type="number" label="Capacity" value={draft.capacity ?? 24} onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })} InputLabelProps={{ shrink: true }} />
                <FormControl fullWidth size="small">
                  <InputLabel shrink>Style</InputLabel>
                  <Select value={draft.style ?? "luxury"} label="Style" onChange={(e) => setDraft({ ...draft, style: e.target.value })} notched>
                    {TRIP_STYLE_OPTIONS.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel shrink>Status</InputLabel>
                  <Select value={draft.status ?? "draft"} label="Status" onChange={(e) => setDraft({ ...draft, status: e.target.value })} notched>
                    {TRIP_STATUSES.map((s) => (
                      <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Row label="Pricing" value={`€${draft.priceFrom?.toLocaleString()}`} />
                <Row label="Style" value={draft.style} />
                <Row label="Duration" value={`${draft.days} days`} />
                <Row label="Capacity" value={draft.capacity} />
                <Row label="Bookings" value={draft.bookings} />
              </Stack>
            )}
          </Section>

          <Section title="Experience">
            {editing ? (
              <>
                <TextField fullWidth multiline minRows={3} label="Description" value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} sx={{ mb: 1.5 }} InputLabelProps={{ shrink: true }} />
                <TextField fullWidth label="Highlights (comma-separated)" value={(draft.activities ?? []).map((a) => (typeof a === "string" ? a : a.name)).join(", ")} onChange={(e) => setDraft({ ...draft, activities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} InputLabelProps={{ shrink: true }} />
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ color: adminColors.textMuted, lineHeight: 1.65, mb: 1.5 }}>{draft.description || "No description yet."}</Typography>
                <Typography variant="caption" sx={{ color: adminColors.textMuted }}>Itinerary · {draft.days ?? 0} days · {(draft.activities ?? []).length} highlights</Typography>
              </>
            )}
          </Section>

          <Section title="Media">
            {editing ? (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={0.5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Paste image URL (https://…)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addImageUrl()}
                    InputLabelProps={{ shrink: true }}
                  />
                  <IconButton color="primary" onClick={addImageUrl} aria-label="Add image">
                    <AddRounded />
                  </IconButton>
                </Stack>
                <Stack spacing={1}>
                  {mediaUrls.map((url) => (
                    <Stack key={url} direction="row" spacing={1} alignItems="center">
                      <SafeImage src={url} alt="" sx={{ width: 72, height: 72, borderRadius: 1.5, objectFit: "cover", flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: adminColors.textMuted, wordBreak: "break-all", display: "block" }}>
                          {url.length > 48 ? `${url.slice(0, 48)}…` : url}
                        </Typography>
                        {draft.image === url ? (
                          <Chip label="Cover" size="small" sx={{ mt: 0.5, height: 20, fontSize: "0.65rem" }} color="primary" />
                        ) : (
                          <Button size="small" sx={{ mt: 0.25, p: 0, minWidth: 0, fontSize: "0.7rem" }} onClick={() => setAsCover(url)}>
                            Set as cover
                          </Button>
                        )}
                      </Box>
                      <IconButton size="small" onClick={() => removeImage(url)} aria-label="Remove image" sx={{ color: "error.main" }}>
                        <DeleteOutlineRounded fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
                {mediaUrls.length === 0 ? (
                  <Typography variant="caption" sx={{ color: adminColors.textMuted }}>Add at least one image URL.</Typography>
                ) : null}
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
                {mediaUrls.map((url) => (
                  <SafeImage key={url} src={url} alt="" sx={{ width: 72, height: 72, borderRadius: 1.5, objectFit: "cover", flexShrink: 0 }} />
                ))}
              </Stack>
            )}
          </Section>
        </Stack>

        {editing ? (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              position: "sticky",
              bottom: 0,
              p: 2,
              borderTop: `1px solid ${adminColors.border}`,
              bgcolor: adminColors.bg,
            }}
          >
            <Button fullWidth variant="outlined" onClick={cancelEdit} sx={{ borderColor: adminColors.border, color: adminColors.textMuted }}>
              Cancel
            </Button>
            <Button fullWidth variant="contained" onClick={save} sx={{ fontWeight: 700 }}>
              Save changes
            </Button>
          </Stack>
        ) : null}
      </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { setMenuAnchor(null); onMenuAction?.("duplicate", trip); }}>Duplicate</MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); onMenuAction?.("archive", trip); }}>Archive</MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); onMenuAction?.("delete", trip); }} sx={{ color: "error.main" }}>Delete</MenuItem>
      </Menu>
    </Drawer>
  );
}

function Row({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" sx={{ color: adminColors.textMuted }}>{label}</Typography>
      <Typography variant="body2" fontWeight={600} sx={{ color: "#fff", textTransform: "capitalize" }}>{value}</Typography>
    </Stack>
  );
}
