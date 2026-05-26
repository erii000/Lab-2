import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import SafeImage from "../../common/SafeImage.jsx";
import { extraGalleryUrls } from "../../../utils/destinationGallery.js";

export default function DestinationGalleryStrip({ destination }) {
  const extras = extraGalleryUrls(destination);
  if (!extras.length) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.08em", mb: 1.5, display: "block" }}>
        Gallery
      </Typography>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          overflowX: "auto",
          pb: 0.5,
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": { bgcolor: alpha("#fff", 0.15), borderRadius: 3 },
        }}
      >
        {extras.map((url) => (
          <SafeImage
            key={url}
            src={url}
            alt=""
            sx={{
              width: { xs: 200, sm: 260 },
              height: { xs: 130, sm: 160 },
              borderRadius: 2,
              objectFit: "cover",
              flexShrink: 0,
              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
