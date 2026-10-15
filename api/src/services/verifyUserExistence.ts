import { Image } from "imagescript";

async function normalizeToPixels(buffer: ArrayBuffer): Promise<Uint8Array> {
  const img = await Image.decode(buffer);

  const resized = img.resize(184, 184);

  const bitmap = resized.bitmap;
  for (let i = 0; i < bitmap.length; i += 4) {
    bitmap[i + 3] = 255;
  }

  return new Uint8Array(bitmap.buffer);
}


function compareWithTolerance(a: Uint8Array, b: Uint8Array, tolerancePercent = 2): boolean {
  if (a.length !== b.length) return false;

  let diffCount = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diffCount++;
  }

  const diffPercent = (diffCount / a.length) * 100;
  return diffPercent <= tolerancePercent;
}

export default async function verifyUserExistence(request: Request, env: any): Promise<Response> {
  const { steamID } = await request.json() as { steamID: string };

  // Fetch user profile
  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${env.VITE_STEAM_API}&steamids=${steamID}`
  );
  const data = await res.json() as {
    response: {
      players: Array<{
        steamid: string;
        personaname: string;
        avatarfull: string;
      }>;
    };
  };
  const players = data.response.players;

  if (players && players.length > 0) {
    const player = players[0];

    const botRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${env.VITE_STEAM_API}&steamids=76561198621681642`
    );
    const botData = await botRes.json() as {
    response: {
      players: Array<{
        steamid: string;
        personaname: string;
        avatarfull: string;
      }>;
    };
  };
    const botPlayer = botData.response.players[0];

    // Fetch both avatars
    const requirementRes = await fetch(botPlayer.avatarfull);
    const requirementBuffer = await requirementRes.arrayBuffer();

    const avatarRes = await fetch(player.avatarfull);
    const avatarBuffer = await avatarRes.arrayBuffer();

    // Normalize both to pixel arrays
    const requirementPixels = await normalizeToPixels(requirementBuffer);
    const avatarPixels = await normalizeToPixels(avatarBuffer);

    // Compare with tolerance
    const equal = compareWithTolerance(requirementPixels, avatarPixels, 2);

    return Response.json({
      verified: true,
      user: {
        id: player.steamid,
        name: player.personaname,
        avatar: player.avatarfull,
        isEqual: equal
      },
    });
  } else {
    return Response.json({ verified: false, error: "User not found" }, { status: 404 });
  }
}
