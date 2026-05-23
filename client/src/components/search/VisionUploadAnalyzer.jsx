import { AutoAwesomeRounded } from "../../ui/icons.jsx";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext.jsx";
import { analyzeTravelImage } from "../../utils/mlVision.js";
import { buildExploreUrl } from "../../utils/exploreSearch.js";
import { designTokens } from "../../theme/theme.js";

export default function VisionUploadAnalyzer() {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  async function handleFile(file) {
    if (!file?.type?.startsWith("image/")) {
      showToast({ message: "Please upload an image file.", severity: "warning" });
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      const analysis = await analyzeTravelImage(file);
      setResult(analysis);
      showToast({ message: "Image analyzed — recommendations ready.", severity: "success" });
    } catch {
      showToast({ message: "Vision analysis failed.", severity: "error" });
    } finally {
      setAnalyzing(false);
    }
  }

  function applyToExplore() {
    if (!result) return;
    navigate(
      buildExploreUrl({
        destination: result.suggestedQuery,
        experience: result.suggestedFilters?.experience,
      }),
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 2.5,
        border: `1px dashed ${alpha(designTokens.brand.gold, 0.35)}`,
        bgcolor: alpha(designTokens.brand.charcoal, 0.4),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <AutoAwesomeRounded fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight={800}>
          AI image recognition
        </Typography>
        <Chip size="small" label="Vision ML" variant="outlined" sx={{ ml: "auto", fontWeight: 600 }} />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload a travel photo — our model detects scene type and suggests destinations (simulated on-device model).
      </Typography>

      <input
        ref={inputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <Button
        variant="outlined"
        startIcon={analyzing ? <CircularProgress size={18} /> : <CloudUploadRoundedIcon />}
        onClick={() => inputRef.current?.click()}
        disabled={analyzing}
        sx={{ fontWeight: 700 }}
      >
        {analyzing ? "Analyzing…" : "Upload & analyze"}
      </Button>

      {result ? (
        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: alpha(designTokens.brand.navy, 0.25) }}>
          <Typography variant="caption" color="text.secondary">
            {result.model}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {result.caption}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
            {result.labels.map((l) => (
              <Chip
                key={l.label}
                size="small"
                label={`${l.label} ${Math.round(l.confidence * 100)}%`}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>
          <Button size="small" variant="contained" onClick={applyToExplore} sx={{ mt: 2, fontWeight: 700 }}>
            Search suggested trips
          </Button>
        </Box>
      ) : null}
    </Paper>
  );
}
