import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { designTokens } from "../../../theme/theme.js";

const hideNativeScrollbarSx = {
  overflowX: "auto",
  overflowY: "hidden",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": { display: "none" },
};

const MIN_THUMB_WIDTH = 56;

function getMetrics(el) {
  const { scrollWidth, clientWidth, scrollLeft } = el;
  if (scrollWidth <= clientWidth + 2) {
    return null;
  }

  const trackWidth = clientWidth;
  const thumbWidth = Math.max(trackWidth * (clientWidth / scrollWidth), MIN_THUMB_WIDTH);
  const maxThumbLeft = trackWidth - thumbWidth;
  const maxScroll = scrollWidth - clientWidth;
  const scrollRatio = maxScroll > 0 ? scrollLeft / maxScroll : 0;

  return {
    trackWidth,
    thumbWidth,
    maxThumbLeft,
    maxScroll,
    thumbLeft: maxThumbLeft * scrollRatio,
  };
}

export default function NavyHorizontalScroll({ children, sx, className }) {
  const scrollRef = useRef(null);
  const trackRef = useRef(null);
  const dragRef = useRef(null);
  const [thumb, setThumb] = useState({ width: 0, left: 0, percent: 0, visible: false });
  const [dragging, setDragging] = useState(false);

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const metrics = getMetrics(el);
    if (!metrics) {
      setThumb({ visible: false, width: 0, left: 0, percent: 0 });
      return;
    }

    const percent =
      metrics.maxThumbLeft > 0 ? Math.round((metrics.thumbLeft / metrics.maxThumbLeft) * 100) : 0;

    setThumb({
      visible: true,
      width: metrics.thumbWidth,
      left: metrics.thumbLeft,
      percent,
    });
  }, []);

  const scrollFromThumbLeft = useCallback((thumbLeft) => {
    const el = scrollRef.current;
    if (!el) return;

    const metrics = getMetrics(el);
    if (!metrics) return;

    const clamped = Math.max(0, Math.min(thumbLeft, metrics.maxThumbLeft));
    const ratio = metrics.maxThumbLeft > 0 ? clamped / metrics.maxThumbLeft : 0;
    el.scrollLeft = ratio * metrics.maxScroll;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateThumb();
    el.addEventListener("scroll", updateThumb, { passive: true });
    window.addEventListener("resize", updateThumb);

    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", updateThumb);
      ro.disconnect();
    };
  }, [updateThumb, children]);

  useEffect(() => {
    if (!dragging) return;

    const handlePointerMove = (event) => {
      const drag = dragRef.current;
      const el = scrollRef.current;
      if (!drag?.active || !el) return;

      const deltaX = event.clientX - drag.startX;
      scrollFromThumbLeft(drag.startThumbLeft + deltaX);
    };

    const endDrag = () => {
      dragRef.current = null;
      setDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [dragging, scrollFromThumbLeft]);

  const handleTrackClick = (event) => {
    if (event.target !== event.currentTarget) return;

    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const metrics = getMetrics(el);
    if (!metrics) return;

    const rect = track.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const targetLeft = Math.max(0, Math.min(clickX - metrics.thumbWidth / 2, metrics.maxThumbLeft));
    scrollFromThumbLeft(targetLeft);
  };

  const handleThumbPointerDown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const el = scrollRef.current;
    if (!el) return;

    const metrics = getMetrics(el);
    if (!metrics) return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startThumbLeft: metrics.thumbLeft,
    };
    setDragging(true);
  };

  return (
    <Box className={className}>
      <Box ref={scrollRef} sx={{ ...hideNativeScrollbarSx, ...sx }}>
        {children}
      </Box>
      {thumb.visible ? (
        <Box
          ref={trackRef}
          role="scrollbar"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={thumb.percent}
          onClick={handleTrackClick}
          sx={{
            mt: 1.25,
            height: 10,
            borderRadius: 5,
            bgcolor: designTokens.brand.charcoal,
            border: `1px solid ${designTokens.brand.graphite}`,
            position: "relative",
            cursor: "pointer",
            touchAction: "none",
            userSelect: "none",
          }}
        >
          <Box
            role="slider"
            tabIndex={0}
            aria-label="Scroll cards horizontally"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={thumb.percent}
            onPointerDown={handleThumbPointerDown}
            onKeyDown={(event) => {
              const el = scrollRef.current;
              if (!el) return;
              const step = el.clientWidth * 0.35;
              if (event.key === "ArrowRight") {
                event.preventDefault();
                el.scrollLeft += step;
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                el.scrollLeft -= step;
              }
            }}
            sx={{
              position: "absolute",
              top: 0,
              left: thumb.left,
              width: thumb.width,
              height: "100%",
              borderRadius: 5,
              bgcolor: designTokens.brand.navy,
              cursor: dragging ? "grabbing" : "grab",
              transition: dragging ? "none" : "background-color 150ms ease, box-shadow 150ms ease",
              boxShadow: dragging ? `0 0 0 2px ${designTokens.brand.navyDark}` : "none",
              "&:hover": { bgcolor: designTokens.brand.navyDark },
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
}
