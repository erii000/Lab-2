import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import DeferredScrollToTop from "../components/common/DeferredScrollToTop.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

export default function RootLayout() {
  return (
    <>
      <DeferredScrollToTop />
      <Suspense fallback={<PageLoader label="Loading page" />}>
        <Outlet />
      </Suspense>
    </>
  );
}
