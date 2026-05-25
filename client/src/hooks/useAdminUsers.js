import { useEffect, useState } from "react";
import * as usersApi from "../api/usersApi.js";
import { useAuthStore } from "../store/authStore.js";

function mapApiUser(row) {
  const roles = row.roles ?? row.Roles ?? [];
  const primaryRole = roles[0] ?? "Traveler";
  return {
    id: row.id ?? row.Id,
    name: [row.firstName ?? row.FirstName, row.lastName ?? row.LastName].filter(Boolean).join(" "),
    email: row.email ?? row.Email,
    role: primaryRole,
    status: row.isActive === false || row.IsActive === false ? "Inactive" : "Active",
  };
}

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

    usersApi
      .listUsers(token, { pageNumber: 1, pageSize: 500 })
      .then((data) => {
        if (cancelled) return;
        const items = data.items ?? data.Items ?? [];
        setUsers(items.map(mapApiUser));
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
