export default {
	
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);


    // Only handle /api/callback
    if (url.pathname === "/api/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return Response.json({ success: false, error: "Missing code" }, { status: 400 });
      }

      // Exchange code for token
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

      const tokens = await tokenResponse.json() as { access_token: string };

      // FAULTY CODE CHECK LATER SOMETHING IS WRONG BUT I DONT KNOW WHAT

    //   // Check guild membership
    //   const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
    //     headers: { Authorization: `Bearer ${tokens.access_token}` },
    //   });
    //   const guilds = await guildsResponse.json() as { id: string }[];

    //   const allowedGuildId = env.VITE_DISCORD_SERVER_ID;
    //   const isMember = guilds.some((g: any) => g.id === allowedGuildId);

    //   if (!isMember) {
    //     return Response.json({ success: false, error: "Not authorized" }, { status: 403 });
    //   }

      // Fetch user info
      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const user = await userResponse.json() as { id: string; username: string };

      return Response.json({ success: true, user: { id: user.id, username: user.username } });
    }

    // Default fallback
    return Response.json({ error: "Not found" }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;

