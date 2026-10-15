
import { Image } from "imagescript";

import type { StoredUser } from "./auth";
import { KVGet, KVAdd } from "./kvservics";

const REQUIRED_STEAM_ID = "76561198621681642";

interface SteamPlayer {
  steamid: string;
  personaname: string;
  avatarfull: string;
}

interface SteamResponse {
  response: {
    players: SteamPlayer[];
  };
}

// Normalize images to 184x184 pixels
async function normalizeToPixels(
  buffer: ArrayBuffer
): Promise<Uint8Array> {
  const img = await Image.decode(buffer);

  const resized = img.resize(184, 184);

  const bitmap = resized.bitmap;

  for (let i = 0; i < bitmap.length; i += 4) {
    bitmap[i + 3] = 255;
  }

  return new Uint8Array(bitmap.buffer);
}

// Compare images using percentage tolerance
function compareWithTolerance(
  a: Uint8Array,
  b: Uint8Array,
  tolerancePercent = 2
): boolean {
  if (a.length !== b.length) return false;

  let diffCount = 0;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      diffCount++;
    }
  }

  const diffPercent = (diffCount / a.length) * 100;

  return diffPercent <= tolerancePercent;
}

// Retrieve Steam profile
async function getSteamPlayer(
  steamID: string,
  env: Env
): Promise<SteamPlayer | null> {
  const url = new URL(
    "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/"
  );

  url.searchParams.set("key", env.STEAM_API);
  url.searchParams.set("steamids", steamID);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Steam API request failed");
  }

  const data = await response.json() as SteamResponse;

  return data.response.players?.[0] ?? null;
}

// Main verification handler
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
      {
        verified: false,
        error: "Invalid SteamID64"
      },
      { status: 400 }
    );
  }

  try {
    const [player, botPlayer] = await Promise.all([
      getSteamPlayer(steamID, env),
      getSteamPlayer(REQUIRED_STEAM_ID, env)
    ]);

    if (!player) {
      return Response.json(
        {
          verified: false,
          error: "Steam user not found"
        },
        { status: 404 }
      );
    }

    if (!botPlayer) {
      return Response.json(
        {
          verified: false,
          error: "Required profile unavailable"
        },
        { status: 502 }
      );
    }

    // Fetch profile pictures
    const [requirementRes, avatarRes] = await Promise.all([
      fetch(botPlayer.avatarfull),
      fetch(player.avatarfull)
    ]);

    if (!requirementRes.ok || !avatarRes.ok) {
      throw new Error("Unable to retrieve Steam avatars");
    }

    const [requirementBuffer, avatarBuffer] = await Promise.all([
      requirementRes.arrayBuffer(),
      avatarRes.arrayBuffer()
    ]);

    // Normalize images
    const [requirementPixels, avatarPixels] = await Promise.all([
      normalizeToPixels(requirementBuffer),
      normalizeToPixels(avatarBuffer)
    ]);

    // Compare avatars
    const equal = compareWithTolerance(
      requirementPixels,
      avatarPixels,
      2
    );

    // Retrieve the latest stored user record
    const key = `user:${authenticatedUser.id}`;

    const storedUser = await KVGet<StoredUser>(key);

    if (!storedUser) {
      return Response.json(
        {
          verified: false,
          error: "Authenticated user record not found"
        },
        { status: 404 }
      );
    }

    // Save SteamID and verification result
    storedUser.steamID = player.steamid;
    storedUser.verified = equal;

    await KVAdd(key, storedUser);

    // Return verification result
    return Response.json({
      verified: true,
      user: {
        id: player.steamid,
        name: player.personaname,
        avatar: player.avatarfull,
        isEqual: equal
      }
    });

  } catch (error) {
    console.error("Steam verification error:", error);

    return Response.json(
      {
        verified: false,
        error: "Steam verification service unavailable"
      },
      { status: 502 }
    );
  }
}
