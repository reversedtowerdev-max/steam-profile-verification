
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const API_URL = "https://api.reversedtower-dev.workers.dev";

function Callback() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    // Prevent duplicate execution under React StrictMode
    if (started.current) return;
    started.current = true;

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");

      if (!code || !state) {
        navigate("/unauthorized", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/callback`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ code, state })
        });

        if (!response.ok) {
          throw new Error("Discord authentication failed");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error("Authentication unsuccessful");
        }

        // Retrieve user from the newly created session
        const authenticated = await refreshAuth();

        navigate(
          authenticated ? "/verify" : "/unauthorized",
          { replace: true }
        );

      } catch (error) {
        console.error("Login failed:", error);
        navigate("/unauthorized", { replace: true });
      }
    }

    void handleCallback();

  }, [navigate, refreshAuth]);

  return <p>Logging you in...</p>;
}

export default Callback;
