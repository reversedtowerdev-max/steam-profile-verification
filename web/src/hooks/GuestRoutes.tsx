import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

export default function GuestRoutes() {
  const { isAuthenticated, loading } = useAuth();

  // Wait until the session check finishes.
  if (loading) {
    return (
      <div className="page">
        <div className="spinner" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Logged-in users go directly to their dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the requested guest page.
  return <Outlet />;
}