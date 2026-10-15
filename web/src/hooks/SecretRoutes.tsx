import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

export default function SecretRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  if (!user) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}