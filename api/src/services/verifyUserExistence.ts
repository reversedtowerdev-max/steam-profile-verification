// services/verifyUserExistence.ts
export default async function verifyUserExistence(request: Request, env: any): Promise<Response> {
  const { steamID } = (await request.json()) as { steamID: string };

  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${env.STEAM_API_KEY}&steamids=${steamID}`
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
    return Response.json({
      verified: true,
      user: {
        id: player.steamid,
        name: player.personaname,
        avatar: player.avatarfull,
      },
    });
  } else {
    return Response.json({ verified: false, error: "User not found" }, { status: 404 });
  }
}
