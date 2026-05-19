import { CssBaseline, ThemeProvider } from "@mui/material";
import { RouterProvider } from "react-router-dom";
import { LoadingProvider } from "./context/LoadingContext.jsx";
import { NotificationsProvider } from "./context/NotificationsContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { router } from "./router.jsx";
import { appTheme } from "./theme/theme.js";

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <ToastProvider>
        <LoadingProvider>
          <NotificationsProvider>
            <RouterProvider router={router} />
          </NotificationsProvider>
        </LoadingProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
