function withCors(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "https://steam-profile-verification-web.reversedtower-dev.workers.dev");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    // Handle preflight OPTIONS request
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
      const { steamID } = (await request.json()) as { steamID: string };
      console.log(env.STEAM_API_KEY)

      const res = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${env.STEAM_API_KEY}&steamids=${steamID}`
      );
      const data = (await res.json()) as {
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
        return withCors(Response.json({
          verified: true,
          user: {
            id: player.steamid,
            name: player.personaname,
            avatar: player.avatarfull,
          },
        }));
      } else {
        return withCors(Response.json({ verified: false, error: "User not found" }, { status: 404 }));
      }
    }

    return withCors(Response.json({ error: "Not found" }, { status: 404 }));
  },
};
