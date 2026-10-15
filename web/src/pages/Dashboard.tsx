
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/AuthContext";

const API_URL = "https://api.reversedtower-dev.workers.dev";

export default function UserDashboard() {
  const { user, refreshAuth } = useAuth();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Refresh the context so it no longer holds the old user.
      await refreshAuth();

      navigate("/", { replace: true });
    } catch {
      setError("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  if (!user) return null;

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : null;

  return (
    <main className="user-dashboard">
      <h1>User Dashboard</h1>

      <section>
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="Discord avatar"
            width={80}
            height={80}
            style={{ borderRadius: "50%" }}
          />
        )}

        <h2>Welcome, {user.username}!</h2>
      </section>

      <section>
        <h3>Steam Verification</h3>

        <p>
          <strong>Steam ID:</strong>{" "}
          {user.steamID ?? "Not submitted"}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {user.verified ? "Verified ✅" : "Not verified ❌"}
        </p>

        <Link to="/verify">
          {user.steamID ? "Check Verification Again" : "Verify Steam Profile"}
        </Link>
      </section>

      <section>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>

        {error && <p role="alert">{error}</p>}
      </section>
    </main>
  );
}
