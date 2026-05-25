import { CssBaseline, ThemeProvider } from "@mui/material";
import { useEffect } from "react";
import { LoadingProvider } from "./context/LoadingContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { useCatalogStore } from "./store/catalogStore.js";
import { appTheme } from "./theme/theme.js";

export default function AppProviders({ children }) {
  useEffect(() => {
    useCatalogStore.getState().hydrate();
  }, []);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <ToastProvider>
        <LoadingProvider>{children}</LoadingProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
