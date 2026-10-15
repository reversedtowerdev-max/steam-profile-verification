const API_URL = "https://api.reversedtower-dev.workers.dev";

function DiscordLoginButton() {
  function handleLogin() {
    window.location.href = `${API_URL}/api/auth/login`;
  }

  return (
    <button className="btn" onClick={handleLogin}>
      Continue to Discord
    </button>
  );
}

export default DiscordLoginButton;