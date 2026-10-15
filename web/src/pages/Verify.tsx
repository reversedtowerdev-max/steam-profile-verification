
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../hooks/AuthContext";
import SteamIdForm from "../components/SubmitSteamID";

import "./css/verify.css"

export default function Verify() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  const discordAvatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : null;

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  }

  return (
    <main className="page verify-page">

      {/* Page navigation */}
      <div className="verify-navigation">
        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>

        <button
          type="button"
          className="btn btn-outline"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>

      {/* Page heading */}
      <header className="page-header">
        <span className="eyebrow">
          ACCOUNT VERIFICATION
        </span>

        <h1>Verify Your Steam Profile</h1>

        <p>
          Link your Steam account and verify that your profile
          is using the required promotional image.
        </p>
      </header>

      <div className="verify-layout">

        {/* Left column */}
        <aside className="verify-sidebar">

          {/* Discord profile */}
          <section className="card">
            <h3>Discord Account</h3>

            <div className="verify-discord-profile">
              {discordAvatar ? (
                <img
                  src={discordAvatar}
                  alt={`${user.username}'s Discord avatar`}
                  className="profile-avatar"
                />
              ) : (
                <div className="avatar-placeholder">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <strong>{user.username}</strong>
                <p>Connected with Discord</p>
              </div>
            </div>

            <div className="verify-account-detail">
              <span>Discord ID</span>
              <code>{user.id}</code>
            </div>
          </section>

          {/* Current verification status */}
          <section className="card">
            <h3>Current Status</h3>

            <span
              className={
                user.verified
                  ? "status status-success"
                  : "status status-danger"
              }
            >
              {user.verified ? "Verified" : "Not Verified"}
            </span>

            <div className="verify-account-detail">
              <span>Linked SteamID64</span>

              <strong>
                {user.steamID ?? "Not submitted"}
              </strong>
            </div>

            <p className="verification-description">
              {user.verified
                ? "Your Steam profile currently meets the verification requirements."
                : user.steamID
                  ? "Your Steam account is saved, but its profile picture has not passed verification."
                  : "Submit your SteamID64 below to begin verification."}
            </p>
          </section>

          {/* Instructions */}
          <section className="card">
            <h3>How Verification Works</h3>

            <ol className="verification-steps">
              <li>Sign in using your Discord account.</li>
              <li>Set your Steam avatar to the required image.</li>
              <li>Enter your 17-digit SteamID64.</li>
              <li>Submit your profile for verification.</li>
            </ol>
          </section>

        </aside>

        {/* Right column */}
        <section className="verify-main">

          <div className="card card-highlight">
            <SteamIdForm />
          </div>

          <div className="verification-notice">
            <strong>Already submitted your SteamID?</strong>

            <p>
              You can verify your profile again after changing
              your Steam avatar. Your latest verification
              result will be saved to your account.
            </p>
          </div>

        </section>

      </div>
    </main>
  );
}
