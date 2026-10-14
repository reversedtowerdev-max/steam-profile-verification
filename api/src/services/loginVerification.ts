export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return Response.json({ success: false, error: "Missing code" }, { status: 400 });
      }

      const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.VITE_DISCORD_CLIENT_ID,
          client_secret: env.DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: "https://steam-profile-verification-web.reversedtower-dev.workers.dev/callback",
        }),
      });

      const tokens = await tokenResponse.json();
      return Response.json(tokens);
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
