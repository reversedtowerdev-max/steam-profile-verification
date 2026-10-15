import verifyUserExistence from "./services/verifyUserExistence";
import { KVAdd, KVGet, KVRemove, KVList } from "./services/kvservics"
import { authenticateUser, type DiscordUser } from "./services/auth";
import {
  createSession,
  getSessionUser,
  deleteSession,
  SESSION_MAX_AGE
} from "./services/session";

const FRONTEND_URL =
  "https://steam-profile-verification-web.reversedtower-dev.workers.dev";

export function withCors(response: Response): Response {
  const headers = new Headers(response.headers);

  headers.set("Access-Control-Allow-Origin", FRONTEND_URL);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  headers.set("Vary", "Origin");

  return new Response(response.body, {
    status: response.status,
    headers
  });
}

interface KVRequest {
  key: string,
  value?: unknown
}


export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, {
        status: 204
      }));
    }

    if (url.pathname === "/api/verifyuser" && request.method === "POST") {
      const response = await verifyUserExistence(request, env);
      return await withCors(response);
    }

    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const user = await getSessionUser(request);

      if (!user) {
        return withCors(Response.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        ));
      }

      return withCors(Response.json({
        success: true,
        user
      }));
    }

    if (url.pathname === "/api/auth/logout" && request.method === "POST") {
      await deleteSession(request);

      return withCors(new Response(
        JSON.stringify({ success: true }),
        {
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie":
              "session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
          }
        }
      ));
    }

    if (url.pathname === "/api/callback" && request.method === "GET") {
    const code = url.searchParams.get("code");

    if (!code) {
      return withCors(Response.json(
        { success: false, error: "Missing code" },
        { status: 400 }
      ));
    }

    const tokenResponse = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: env.DISCORD_CLIENT_ID,
          client_secret: env.DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: "https://steam-profile-verification-web.reversedtower-dev.workers.dev/api/callback"
        })
      }
    );

    if (!tokenResponse.ok) {
        return withCors(Response.json(
          { success: false, error: "Discord authentication failed" },
          { status: 401 }
        ));
      }

      const tokens = await tokenResponse.json() as {
        access_token: string;
      };

      const userResponse = await fetch(
        "https://discord.com/api/users/@me",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`
          }
        }
      );

      if (!userResponse.ok) {
        return withCors(Response.json(
          { success: false, error: "Failed to retrieve Discord user" },
          { status: 502 }
        ));
      }

      const discordUser = await userResponse.json() as DiscordUser;

      const auth = await authenticateUser(discordUser);

      const sessionId = await createSession(auth.user.id);

      return withCors(new Response(
        JSON.stringify({
          success: true,
          isNewUser: auth.isNewUser,
          user: auth.user
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie":
              `session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE}`
          }
        }
      ));
    }

    return withCors(Response.json({ error: "Not found" }, { status: 404 }));
  },
} satisfies ExportedHandler<Env>;
