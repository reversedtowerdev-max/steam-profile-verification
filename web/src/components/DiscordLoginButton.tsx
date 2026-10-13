function DiscordLoginButton() {
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${
    import.meta.env.VITE_DISCORD_CLIENT_ID
  }&redirect_uri=${encodeURIComponent('https://steam-profile-verification-web.reversedtower-dev.workers.dev/callback')}&response_type=code&scope=identify%20guilds`;

  return (
    <button onClick={() => (window.location.href = discordAuthUrl)}>
      Continue to Discord
    </button>
  );
}

export default DiscordLoginButton;
