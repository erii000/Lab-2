import { AutoAwesomeRounded } from "../../ui/icons.jsx";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { designTokens } from "../../theme/theme.js";

export default function ExploreAiBlock({ insight, discoveryGroups, onDiscoveryClick, recentSearches }) {
  return (
    <Stack spacing={5} sx={{ mt: 8 }}>
      {insight ? (
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(designTokens.brand.gold, 0.12)}`,
            bgcolor: alpha(designTokens.brand.navy, 0.15),
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <AutoAwesomeRounded color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={800}>
              AI suggests
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
            {insight}
          </Typography>
        </Box>
      ) : null}

      {discoveryGroups?.length ? (
        <Box>
          <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 2, letterSpacing: "0.06em" }}>
            SUGGESTED ALTERNATIVES
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
            {discoveryGroups.map((g) => (
              <Chip
                key={g.id}
                label={g.label}
                onClick={() => onDiscoveryClick?.(g)}
                variant="outlined"
                sx={{ fontWeight: 600, cursor: "pointer" }}
              />
            ))}
          </Stack>
        </Box>
      ) : null}

      {recentSearches?.length ? (
        <Box>
          <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 1.5, letterSpacing: "0.06em" }}>
            RECENT SEARCHES
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
            {recentSearches.map((r) => (
              <Chip
                key={r.label}
                label={r.label}
                size="small"
                onClick={() => onDiscoveryClick?.({ criteria: r.criteria })}
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
}
