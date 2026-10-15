export default async function verifyUserExistence(request: Request, env: any): Promise<Response> {
  const { steamID } = await request.json() as { steamID: string };

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

    // Take the requirement.png
    const requirementRes = await env.ASSESTS.fetch("requirement.png");
    const requirementBuffer = await requirementRes.arrayBuffer();
    

    // Implementing PROFILE COMPARISON
    const avatarUrl = player.avatarfull;
    const avatarRes = await fetch(avatarUrl);
    const avatarBuffer = await avatarRes.arrayBuffer();

    // Turn the avatar and requirement avatar to Hash
    const avatarHash = await crypto.subtle.digest("SHA-256", avatarBuffer);
    const requirementHash = await crypto.subtle.digest("SHA-256", requirementBuffer);

    const equal = Buffer.from(requirementHash).toString("hex") === Buffer.from(avatarHash).toString("hex");

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
