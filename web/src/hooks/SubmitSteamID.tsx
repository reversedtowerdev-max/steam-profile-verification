import { useState } from "react";

function SubmitSteamID() {
    const [steamID, setSteamID] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ verified: boolean; error?: string } | null>(null);

    async function handleSubmission() {
        if (!steamID) return;
        setLoading(true);
        try {
            const res = await fetch('https://api.reversedtower-dev.workers.dev/api/verifyuser' {
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
            <p style={{ color: "green" }}>✅ Profile picture verified!</p>
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

