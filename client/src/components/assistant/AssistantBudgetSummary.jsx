import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { designTokens } from "../../theme/theme.js";

export default function AssistantBudgetSummary({ budgetTotal, budgetLines }) {
  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 2, letterSpacing: "0.04em" }}>
        BUDGET
      </Typography>
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: alpha(designTokens.brand.charcoal, 0.5),
          border: `1px solid ${alpha(designTokens.brand.gold, 0.1)}`,
        }}
      >
        <Stack spacing={1.5}>
          {budgetLines.map((line) => (
            <Stack key={line.label} direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {line.label}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                €{line.amount}
              </Typography>
            </Stack>
          ))}
          <Box sx={{ pt: 1.5, borderTop: `1px solid ${alpha(designTokens.brand.gold, 0.12)}` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography fontWeight={700}>Estimated total</Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                €{budgetTotal.toLocaleString()}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
