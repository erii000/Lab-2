import { Outlet } from "react-router-dom";
import DeferredScrollToTop from "../components/common/DeferredScrollToTop.jsx";

export default function RootLayout() {
  return (
    <>
      <DeferredScrollToTop />
      <Outlet />
    </>
  );
}
