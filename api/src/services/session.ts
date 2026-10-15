
import { env } from "cloudflare:workers";
import type { StoredUser } from "./auth";

const SESSION_DURATION = 60 * 60 * 24 * 7;

interface Session {
  discordId: string;
  createdAt: number;
}

export async function createSession(discordId: string) {
  const sessionId = crypto.randomUUID();

  const session: Session = {
    discordId,
    createdAt: Date.now()
  };

  await env.USER_KV.put(
    `session:${sessionId}`,
    JSON.stringify(session),
    { expirationTtl: SESSION_DURATION }
  );

  return sessionId;
}

export async function getSessionUser(
  request: Request
): Promise<StoredUser | null> {
  const cookies = request.headers.get("Cookie") ?? "";

  const sessionId = cookies
    .split(";")
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith("session="))
    ?.slice("session=".length);

  if (!sessionId) return null;

  const session = await env.USER_KV.get<Session>(
    `session:${sessionId}`,
    "json"
  );

  if (!session) return null;

  return await env.USER_KV.get<StoredUser>(
    `user:${session.discordId}`,
    "json"
  );
}

export async function deleteSession(request: Request) {
  const cookies = request.headers.get("Cookie") ?? "";

  const sessionId = cookies
    .split(";")
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith("session="))
    ?.slice("session=".length);

  if (sessionId) {
    await env.USER_KV.delete(`session:${sessionId}`);
  }
}

export const SESSION_MAX_AGE = SESSION_DURATION;
