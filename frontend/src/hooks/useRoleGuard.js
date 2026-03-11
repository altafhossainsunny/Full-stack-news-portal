import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export function useRoleGuard(...allowedRoles) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth/login", { replace: true });
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      navigate("/unauthorized", { replace: true });
    }
  }, [user, loading]);

  return { user, loading };
}
