import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useRef, useState } from "react";
import {
  DATA_EXCHANGE_RESOURCES,
  downloadResourceExport,
  importResourceRows,
} from "../../api/dataExchangeApi.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuthStore } from "../../store/authStore.js";
import {
  formatImportResultMessage,
  getResourceMeta,
  parseImportJsonFile,
  triggerBlobDownload,
} from "../../utils/dataExchangeClient.js";
import { adminColors, adminPanelSx } from "./adminStyles.js";

/**
 * @param {object} props
 * @param {import('../../api/dataExchangeApi.js').DataExchangeResource} props.resource
 * @param {string} [props.title]
 * @param {() => void | Promise<void>} [props.onImported]
 * @param {boolean} [props.compact]
 */
export default function AdminDataExchangeBar({ resource, title, onImported, compact = false }) {
  const { showToast } = useToast();
  const ensureAccessToken = useAuthStore((s) => s.ensureAccessToken);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(null);

  const meta = getResourceMeta(resource, DATA_EXCHANGE_RESOURCES);
  const heading = title ?? meta?.label ?? resource;

  async function runExport(format) {
    setBusy(`export-${format}`);
    try {
      const token = await ensureAccessToken();
      if (!token) throw new Error("Session expired. Sign in again.");
      const { blob, filename } = await downloadResourceExport(token, resource, format);
      triggerBlobDownload(blob, filename);
      showToast({ message: `Exported ${heading} as ${format.toUpperCase()}.`, severity: "success" });
    } catch (err) {
      showToast({ message: err?.message ?? "Export failed.", severity: "error" });
    } finally {
      setBusy(null);
    }
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy("import");
    try {
      const token = await ensureAccessToken();
      if (!token) throw new Error("Session expired. Sign in again.");

      const rows = await parseImportJsonFile(file);
      if (!rows.length) throw new Error("Import file has no rows.");

      const body = await importResourceRows(token, resource, rows);
      showToast({
        message: formatImportResultMessage(body),
        severity: "success",
      });
      await onImported?.();
    } catch (err) {
      const detail =
        err?.body?.errors?.length > 0
          ? `${err.message} (${err.body.errors.length} validation error(s))`
          : err?.message ?? "Import failed.";
      showToast({ message: detail, severity: "error" });
    } finally {
      setBusy(null);
    }
  }

  function downloadSample() {
    if (!meta?.sample) return;
    const blob = new Blob([JSON.stringify(meta.sample, null, 2)], { type: "application/json" });
    triggerBlobDownload(blob, `${resource}-import-sample.json`);
  }

  return (
    <Paper
      elevation={0}
      sx={{
        ...adminPanelSx,
        p: compact ? 1.5 : 2,
        mb: 2,
        border: `1px solid ${alpha(adminColors.gold, 0.2)}`,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ md: "center" }}
        justifyContent="space-between"
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#fff" }}>
            {heading} — export / import
          </Typography>
          {!compact && meta?.importHint ? (
            <Typography variant="caption" sx={{ color: adminColors.textMuted, display: "block", mt: 0.25 }}>
              {meta.importHint}
            </Typography>
          ) : null}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <ButtonGroup size="small" variant="outlined" disabled={!!busy}>
            {["json", "csv", "xlsx"].map((format) => (
              <Button
                key={format}
                onClick={() => runExport(format)}
                startIcon={
                  busy === `export-${format}` ? <CircularProgress size={14} color="inherit" /> : <DownloadRoundedIcon />
                }
                sx={{
                  borderColor: alpha(adminColors.gold, 0.35),
                  color: adminColors.gold,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {format.toUpperCase()}
              </Button>
            ))}
          </ButtonGroup>

          <Button
            size="small"
            variant="contained"
            disabled={!!busy}
            startIcon={
              busy === "import" ? <CircularProgress size={14} color="inherit" /> : <FileUploadRoundedIcon />
            }
            onClick={() => fileRef.current?.click()}
            sx={{ fontWeight: 700, textTransform: "none" }}
          >
            Import JSON
          </Button>

          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={handleImportFile}
          />

          <Tooltip title="Download sample import JSON">
            <IconButton size="small" onClick={downloadSample} sx={{ color: alpha("#fff", 0.55) }}>
              <HelpOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}
