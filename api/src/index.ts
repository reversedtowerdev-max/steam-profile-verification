import verifyUserExistence from "./services/verifyUserExistence";

export async function withCors(response: Response): Promise<Response> {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  const body = await response.text();
  console.log("Returning headers:", Array.from(headers.entries()));
  return new Response(body, {
    status: response.status,
    headers,
  });
}


export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "https://steam-profile-verification-web.reversedtower-dev.workers.dev",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (url.pathname === "/api/verifyuser" && request.method === "POST") {
      const response = await verifyUserExistence(request, env);
      return await withCors(response);
    }

    if (url.pathname === "/api/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return withCors(Response.json({ success: false, error: "Missing code" }, { status: 400 }));
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

      const tokens = await tokenResponse.json() as { access_token: string };

      // Fetch user info
      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const user = await userResponse.json() as { id: string; username: string };

      return withCors(Response.json({ success: true, user: { id: user.id, username: user.username } }));
    }

    return withCors(Response.json({ error: "Not found" }, { status: 404 }));
  },
} satisfies ExportedHandler<Env>;
