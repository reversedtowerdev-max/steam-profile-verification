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

const API_URL =
  "https://api.reversedtower-dev.workers.dev";

const REDIRECT_URI = `${API_URL}/api/callback`;

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
      const user = await getSessionUser(request);

      if (!user) {
        return withCors(Response.json(
          {
            verified: false,
            error: "Unauthorized"
          },
          { status: 401 }
        ));
      }
      
      const response = await verifyUserExistence(
        request,
        env,
        user
      );

      return withCors(response);
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
              "session=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0"
          }
        }
      ));
    }

    if (url.pathname === "/api/auth/login" && request.method === "GET") {
      const state = crypto.randomUUID();

      const discordUrl = new URL(
        "https://discord.com/oauth2/authorize"
      );

      discordUrl.searchParams.set("client_id", env.DISCORD_CLIENT_ID);
      discordUrl.searchParams.set("redirect_uri", REDIRECT_URI);
      discordUrl.searchParams.set("response_type", "code");
      discordUrl.searchParams.set("scope", "identify guilds");
      discordUrl.searchParams.set("state", state);

      return new Response(null, {
        status: 302,
        headers: {
          Location: discordUrl.toString(),
          "Set-Cookie": [
            `oauth_state=${state}`,
            "HttpOnly",
            "Secure",
            "SameSite=Lax",
            "Path=/api",
            "Max-Age=600"
          ].join("; ")
        }
      });
    }

    if (url.pathname === "/api/callback" && request.method === "GET") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");

      const cookies = request.headers.get("Cookie") ?? "";

      const savedState = cookies
        .split(";")
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith("oauth_state="))
        ?.slice("oauth_state=".length);

      const clearStateCookie =
        "oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0";

      if (!code || !state || !savedState || state !== savedState) {
        return new Response("Invalid OAuth state", {
          status: 400,
          headers: {
            "Set-Cookie": clearStateCookie
          }
        });
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
            redirect_uri: REDIRECT_URI
          })
        }
      );

      if (!tokenResponse.ok) {
        return new Response("Discord authentication failed", {
          status: 401,
          headers: {
            "Set-Cookie": clearStateCookie
          }
        });
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
        return new Response("Failed to retrieve Discord user", {
          status: 502,
          headers: {
            "Set-Cookie": clearStateCookie
          }
        });
      }

      const discordUser =
        await userResponse.json() as DiscordUser;

      // Find existing user or register a new one
      const auth = await authenticateUser(discordUser);

      // Create their login session
      const sessionId = await createSession(auth.user.id);

      const headers = new Headers();

      headers.set("Location", `${FRONTEND_URL}/dashboard`);

      headers.append("Set-Cookie", [
        `session=${sessionId}`,
        "HttpOnly",
        "Secure",
        "SameSite=None",
        "Path=/",
        `Max-Age=${SESSION_MAX_AGE}`
      ].join("; "));

      headers.append("Set-Cookie", clearStateCookie);

      return new Response(null, {
        status: 302,
        headers
      });
    }

    return withCors(Response.json({ error: "Not found" }, { status: 404 }));
  },
} satisfies ExportedHandler<Env>;
