import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

export default function GuestRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page">
        <div className="spinner" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}