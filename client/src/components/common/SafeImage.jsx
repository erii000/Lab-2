import { Box } from "@mui/material";
import { useEffect, useState } from "react";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80";

/**
 * Image with fallback when URL fails to load (broken Unsplash links, etc.).
 */
export default function SafeImage({ src, alt = "", sx, ...props }) {
  const [current, setCurrent] = useState(src || PLACEHOLDER);

  useEffect(() => {
    setCurrent(src || PLACEHOLDER);
  }, [src]);

  return (
    <Box
      component="img"
      src={current}
      alt={alt}
      onError={() => {
        if (current !== PLACEHOLDER) setCurrent(PLACEHOLDER);
      }}
      sx={sx}
      {...props}
    />
  );
}
