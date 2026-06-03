import { Outlet, Navigate } from "react-router";
import { useAuth } from "~/hooks/auth";

const ALLOWED_ROLES = ["admin", "superAdmin", "employee"];

export default function ProtectedRoute() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-400 text-sm animate-pulse">Verificando sesión...</span>
      </div>
    );
  }

  if (!isAuthenticated || !ALLOWED_ROLES.includes(user?.role ?? "")) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />
}