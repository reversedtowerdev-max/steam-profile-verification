
import { Image } from "imagescript";

export const REQUIRED_STEAM_ID = "76561198621681642";

export interface SteamPlayer {
  steamid: string;
  personaname: string;
  avatarfull: string;
}

interface SteamResponse {
  response: {
    players: SteamPlayer[];
  };
}

export interface VerificationResult {
  player: SteamPlayer;
  isEqual: boolean;
}

export async function getSteamPlayer(
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
    throw new Error(`Steam API returned ${response.status}`);
  }

  const data = await response.json() as SteamResponse;

  return data.response.players?.[0] ?? null;
}

export async function normalizeToPixels(
  buffer: ArrayBuffer
): Promise<Uint8Array> {
  const image = await Image.decode(buffer);
  const resized = image.resize(184, 184);
  const bitmap = resized.bitmap;

  for (let i = 0; i < bitmap.length; i += 4) {
    bitmap[i + 3] = 255;
  }

  return new Uint8Array(bitmap);
}

export function compareWithTolerance(
  a: Uint8Array,
  b: Uint8Array,
  tolerancePercent = 2
): boolean {
  if (a.length !== b.length) return false;

  let differences = 0;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) differences++;
  }

  return (differences / a.length) * 100 <= tolerancePercent;
}

export async function getAvatarPixels(
  avatarURL: string
): Promise<Uint8Array> {
  const response = await fetch(avatarURL);

  if (!response.ok) {
    throw new Error(`Avatar download failed: ${response.status}`);
  }

  return normalizeToPixels(await response.arrayBuffer());
}

// Fetch this once at the start of each scheduled run.
export async function getRequiredAvatarPixels(
  env: Env
): Promise<Uint8Array> {
  const bot = await getSteamPlayer(REQUIRED_STEAM_ID, env);

  if (!bot) {
    throw new Error("Required Steam profile unavailable");
  }

  return getAvatarPixels(bot.avatarfull);
}

export async function verifySteamProfile(
  steamID: string,
  env: Env,
  requiredPixels?: Uint8Array
): Promise<VerificationResult | null> {
  const player = await getSteamPlayer(steamID, env);

  if (!player) return null;

  const reference =
    requiredPixels ?? await getRequiredAvatarPixels(env);

  const avatarPixels = await getAvatarPixels(player.avatarfull);

  return {
    player,
    isEqual: compareWithTolerance(
      reference,
      avatarPixels,
      2
    )
  };
}
