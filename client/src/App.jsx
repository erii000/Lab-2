import { CssBaseline, ThemeProvider } from "@mui/material";
import { RouterProvider } from "react-router-dom";
import { LoadingProvider } from "./context/LoadingContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { router } from "./router.jsx";
import { appTheme } from "./theme/theme.js";

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <ToastProvider>
        <LoadingProvider>
          <RouterProvider router={router} />
        </LoadingProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
