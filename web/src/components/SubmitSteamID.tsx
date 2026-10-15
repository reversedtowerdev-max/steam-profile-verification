
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

const API_URL = "https://api.reversedtower-dev.workers.dev";

interface SteamUser {
  id: string;
  name: string;
  avatar: string;
  isEqual: boolean;
}

type VerifyResult =
  | {
      verified: true;
      user: SteamUser;
    }
  | {
      verified: false;
      error?: string;
      user?: SteamUser;
    };

export default function SteamIdForm() {
  const { user, refreshAuth } = useAuth();
  const navigate = useNavigate();

  const [steamID, setSteamID] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  // Load previously saved Steam ID
  useEffect(() => {
    if (user?.steamID) {
      setSteamID(user.steamID);
    }
  }, [user?.steamID]);

  async function handleSubmission(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanedID = steamID.trim();

    if (!/^\d{17}$/.test(cleanedID)) {
      setResult({
        verified: false,
        error: "Please enter a valid 17-digit SteamID64."
      });
      return;
    }

    if (loading) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/verifyuser`, {
        method: "POST",

        // Send authenticated session cookie
        credentials: "include",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          steamID: cleanedID
        })
      });

      // Session expired or invalid
      if (response.status === 401) {
        navigate("/unauthorized", { replace: true });
        return;
      }

      const data = await response.json() as VerifyResult;

      if (!response.ok) {
        setResult({
          verified: false,
          error: data.verified
            ? "Verification request failed"
            : data.error ?? "Unable to verify Steam profile."
        });
        return;
      }

      setResult(data);

      // Update React user data after successful verification
      if (data.verified) {
        await refreshAuth();
      }

    } catch (error) {
      console.error("Steam verification error:", error);

      setResult({
        verified: false,
        error: "Unable to connect to the verification server."
      });

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="steam-verification">
      <h2>Steam Profile Verification</h2>

      <p>
        Enter your SteamID64 to verify your Steam profile
        for the promotion.
      </p>

      <form onSubmit={handleSubmission}>
        <label htmlFor="steamId">
          Steam ID
        </label>

        <input
          id="steamId"
          type="text"
          inputMode="numeric"
          maxLength={17}
          value={steamID}
          onChange={(e) => {
            setSteamID(e.target.value);
            setResult(null);
          }}
          placeholder="76561198000000000"
          disabled={loading}
          required
        />

        <button
          type="submit"
          disabled={loading || !steamID.trim()}
        >
          {loading ? "Verifying..." : "Verify Steam Profile"}
        </button>
      </form>

      {user?.steamID && (
        <p>
          Previously saved Steam ID: {user.steamID}
        </p>
      )}

      {result && (
        <div
          className="verification-result"
          role="status"
          aria-live="polite"
        >
          {result.verified ? (
            <>
              <h3>
                {result.user.isEqual
                  ? "Verification Successful"
                  : "Profile Found — Verification Incomplete"}
              </h3>

              <p>
                <strong>Steam ID:</strong> {result.user.id}
              </p>

              <p>
                <strong>Username:</strong> {result.user.name}
              </p>

              <img
                src={result.user.avatar}
                alt={`${result.user.name}'s Steam avatar`}
                width={100}
                height={100}
                style={{
                  borderRadius: "8px",
                  objectFit: "cover"
                }}
              />

              {result.user.isEqual ? (
                <p style={{ color: "green" }}>
                  ✅ Your Steam profile meets the promotion requirements!
                </p>
              ) : (
                <p style={{ color: "red" }}>
                  ❌ Your Steam profile picture does not match
                  the required promotion image.
                </p>
              )}
            </>
          ) : (
            <p style={{ color: "red" }}>
              ❌ {result.error ?? "Verification failed."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
