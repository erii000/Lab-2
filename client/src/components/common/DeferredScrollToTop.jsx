import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/** Scroll to top only when navigating to a different route — not when query params change (e.g. filters). */
export default function DeferredScrollToTop() {
  const { pathname } = useLocation();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    const id = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
