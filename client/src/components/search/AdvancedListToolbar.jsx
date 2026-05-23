import { SearchRounded } from "../../ui/icons.jsx";
import {
  Box,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { designTokens } from "../../theme/theme.js";

/**
 * Reusable advanced search bar: full-text query + sort + optional status filter.
 */
export default function AdvancedListToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  sortOptions = [],
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  resultCount,
  placeholder = "Full-text search…",
  accent = "gold",
}) {
  const borderColor =
    accent === "admin" ? alpha("#d4af6a", 0.25) : alpha(designTokens.brand.gold, 0.22);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2.5,
        border: `1px solid ${borderColor}`,
        bgcolor: alpha(designTokens.brand.charcoal, accent === "admin" ? 0.35 : 0.45),
      }}
    >
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <TextField
            size="small"
            fullWidth
            placeholder={placeholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          {sortOptions.length > 0 ? (
            <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 200 } }}>
              <InputLabel>Sort</InputLabel>
              <Select label="Sort" value={sort} onChange={(e) => onSortChange(e.target.value)}>
                {sortOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          {statusOptions?.length > 0 && onStatusFilterChange ? (
            <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 160 } }}>
              <InputLabel>Filter</InputLabel>
              <Select label="Filter" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
                {statusOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Typography variant="caption" color="text.secondary">
            {typeof resultCount === "number"
              ? `${resultCount} result${resultCount !== 1 ? "s" : ""} · tokenized full-text search`
              : "Advanced search active"}
          </Typography>
          {query ? (
            <Chip size="small" label="Clear search" onClick={() => onQueryChange("")} variant="outlined" />
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}
