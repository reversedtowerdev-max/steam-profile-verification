import { useState } from "react";

type VerifyResult =
  | { verified: true; user: { id: string; name: string; avatar: string; isEqual: boolean } }
  | { verified: false; error?: string };

function SubmitSteamID() {
    const [steamID, setSteamID] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VerifyResult | null>(null);
    

    async function handleSubmission() {
        if (!steamID) return;
        setLoading(true);
        try {
            const res = await fetch('https://api.reversedtower-dev.workers.dev/api/verifyuser', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ steamID}),
            });

            const data = await res.json();
            setResult(data);    
        } catch (err) {
            setResult({ verified: false, error: "Request failed"});
        } finally {
            setLoading(false);
        }
    }
    return { steamID, setSteamID, handleSubmission, loading, result};
}

export default function SteamIdForm() {
  const { steamID, setSteamID, handleSubmission, loading, result } = SubmitSteamID();

  return (
    <div>
      <label htmlFor="steamId">Enter your Steam ID:</label>
      <input
        id="steamId"
        type="text"
        value={steamID}
        onChange={(e) => setSteamID(e.target.value)}
        placeholder="e.g. 76561198000000000"
      />
      <button onClick={handleSubmission} disabled={loading}>
        {loading ? "Verifying..." : "Submit"}
      </button>

      {result && (
        <div>
          {result.verified ? (
            <div>
              <p style={{ color: "green" }}>✅ Profile picture verified!</p>
              <p><strong>Steam ID:</strong> {result.user.id}</p>
              <p><strong>Name:</strong> {result.user.name}</p>
              <img
                src={result.user.avatar}
                alt={`${result.user.name}'s avatar`}
                style={{ width: "100px", borderRadius: "8px" }}
              />
              {result.user.isEqual ? (
                <p>✅The user is using the required image!</p>
              ) : (
                <p>❌The user isn't using the required image!</p>
              )}
            </div>
          ) : (
            <p style={{ color: "red" }}>
              ❌ Verification failed {result.error ? `(${result.error})` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

