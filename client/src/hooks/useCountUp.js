import { useEffect, useState } from "react";

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/**
 * Animates from 0 to `end` when `active` becomes true.
 */
export function useCountUp(end, { duration = 1600, active = true } = {}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    let frameId;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(end * easeOutCubic(progress));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [end, duration, active]);

  return value;
}
