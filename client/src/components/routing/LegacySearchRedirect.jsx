import { Navigate, useLocation } from "react-router-dom";

export default function LegacySearchRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/explore${search}`} replace />;
}
