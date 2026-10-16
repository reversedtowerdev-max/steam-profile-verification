
import type { StoredUser } from "./auth";
import { KVGet, KVAdd } from "./kvservics";
import { verifySteamProfile } from "./steamVerification";

export default async function verifyUserExistence(
  request: Request,
  env: Env,
  authenticatedUser: StoredUser
): Promise<Response> {
  let body: { steamID?: unknown };

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { verified: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const steamID = body.steamID;

  if (
    typeof steamID !== "string" ||
    !/^\d{17}$/.test(steamID)
  ) {
    return Response.json(
      { verified: false, error: "Invalid SteamID64" },
      { status: 400 }
    );
  }

  try {
    const result = await verifySteamProfile(steamID, env);

    if (!result) {
      return Response.json(
        { verified: false, error: "Steam user not found" },
        { status: 404 }
      );
    }

    const key = `user:${authenticatedUser.id}`;
    const storedUser = await KVGet<StoredUser>(key);

    if (!storedUser) {
      return Response.json(
        { verified: false, error: "User record not found" },
        { status: 404 }
      );
    }

    storedUser.steamID = result.player.steamid;
    storedUser.verified = result.isEqual;

    await KVAdd(key, storedUser);

    return Response.json({
      verified: true,
      user: {
        id: result.player.steamid,
        name: result.player.personaname,
        avatar: result.player.avatarfull,
        isEqual: result.isEqual
      },
      updatedUser: storedUser
    });

  } catch (error) {
    console.error("Manual verification failed:", error);

    return Response.json(
      {
        verified: false,
        error: "Steam verification service unavailable"
      },
      { status: 502 }
    );
  }
}
