import { useEffect, useState } from "react";
import { fetchAdminUsers } from "../services/adminDataSync.js";
import { useAuthStore } from "../store/authStore.js";

export function useAdminUsers() {
  const token = useAuthStore((s) => s.session?.accessToken);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setUsers([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAdminUsers(token)
      .then((items) => {
        if (cancelled) return;
        setUsers(items);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load users");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { users, loading, error };
}
