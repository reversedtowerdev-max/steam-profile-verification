const API_URL = "https://api.reversedtower-dev.workers.dev";

function DiscordLoginButton() {
  function handleLogin() {
    window.location.href = `${API_URL}/api/auth/login`;
  }

  return (
    <button onClick={handleLogin}>
      Continue to Discord
    </button>
  );
}

export default DiscordLoginButton;