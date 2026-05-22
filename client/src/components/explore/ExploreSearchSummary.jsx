import { EditRounded, FilterListRounded } from "../../ui/icons.jsx";
import { Box, Button, Collapse, Grid, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { formatExploreDateRange } from "../../utils/exploreSearch.js";
import { designTokens } from "../../theme/theme.js";

export default function ExploreSearchSummary({
  criteria,
  onApplySearch,
  onToggleFilters,
  filtersOpen,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(criteria);

  const summaryParts = [
    criteria.destination || "Anywhere",
    criteria.start && criteria.end ? formatExploreDateRange(criteria.start, criteria.end) : null,
    `${criteria.travelers} traveler${criteria.travelers > 1 ? "s" : ""}`,
    criteria.budget != null ? `Budget €${criteria.budget}` : null,
  ].filter(Boolean);

  function openEdit() {
    setDraft(criteria);
    setEditing(true);
  }

  function applyEdit(e) {
    e.preventDefault();
    onApplySearch(draft);
    setEditing(false);
  }

  return (
    <Box
      sx={{
        position: "sticky",
        top: { xs: 62, md: 72 },
        zIndex: 20,
        py: 2,
        mb: 1,
        bgcolor: alpha(designTokens.brand.obsidian, 0.92),
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${alpha(designTokens.brand.gold, 0.1)}`,
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1.5}>
        <Typography variant="body1" fontWeight={600} sx={{ letterSpacing: "-0.01em" }}>
          {summaryParts.join(" · ")}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditRounded sx={{ fontSize: 16 }} />}
            onClick={openEdit}
            sx={{ fontWeight: 600, borderColor: alpha(designTokens.brand.gold, 0.25) }}
          >
            Edit search
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<FilterListRounded sx={{ fontSize: 16 }} />}
            onClick={onToggleFilters}
            sx={{ fontWeight: 600, color: filtersOpen ? "primary.main" : "text.secondary" }}
          >
            Filters
          </Button>
        </Stack>
      </Stack>

      <Collapse in={editing}>
        <Box component="form" onSubmit={applyEdit} sx={{ mt: 2 }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Destination"
                fullWidth
                size="small"
                value={draft.destination}
                onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                type="date"
                label="Check-in"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={draft.start}
                onChange={(e) => setDraft({ ...draft, start: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                type="date"
                label="Check-out"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={draft.end}
                onChange={(e) => setDraft({ ...draft, end: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                type="number"
                label="Travelers"
                fullWidth
                size="small"
                value={draft.travelers}
                inputProps={{ min: 1, max: 12 }}
                onChange={(e) => setDraft({ ...draft, travelers: Number(e.target.value) || 1 })}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                type="number"
                label="Budget €"
                fullWidth
                size="small"
                value={draft.budget ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, budget: e.target.value ? Number(e.target.value) : null })
                }
              />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button type="submit" variant="contained" size="small" sx={{ fontWeight: 700 }}>
              Update search
            </Button>
            <Button type="button" size="small" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}
