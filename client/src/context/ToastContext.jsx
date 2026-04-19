import { createContext, useContext, useMemo, useState } from "react";
import AppToast from "../components/common/AppToast.jsx";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
    autoHideDuration: 3200,
  });

  const showToast = ({
    message,
    severity = "success",
    autoHideDuration = 3200,
  }) => {
    setToast({
      open: true,
      message,
      severity,
      autoHideDuration,
    });
  };

  const closeToast = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToast((current) => ({ ...current, open: false }));
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AppToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        autoHideDuration={toast.autoHideDuration}
        onClose={closeToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }
  return context;
}
