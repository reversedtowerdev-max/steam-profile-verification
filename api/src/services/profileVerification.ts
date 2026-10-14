// export default {
//   async fetch(request: Request, env: any): Promise<Response> {
//     if (request.method === "POST" && new URL(request.url).pathname === "/api/verify") {
//       const { steamId } = (await request.json()) as { steamId: string };

//       // Load requirement image
//       const requirementRes = await env.ASSETS.fetch("requirement.png");
//       const requirementBuffer = await requirementRes.arrayBuffer();
//       const requirementHash = await crypto.subtle.digest("SHA-256", requirementBuffer);

//       // Fetch Steam avatar
//       const steamRes = await fetch(
//         `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${env.STEAM_API_KEY}&steamids=${steamId}`
//       );
//       const steamData = (await steamRes.json()) as {
//         response: { players: { avatarfull: string }[] };
//       };
//       const avatarUrl = steamData.response.players[0].avatarfull;

//       const avatarRes = await fetch(avatarUrl);
//       const avatarBuffer = await avatarRes.arrayBuffer();
//       const avatarHash = await crypto.subtle.digest("SHA-256", avatarBuffer);

//       // Compare
//       const equal =
//         Buffer.from(requirementHash).toString("hex") === Buffer.from(avatarHash).toString("hex");

//       return Response.json({ verified: equal });
//     }

//     return new Response("Not found", { status: 404 });
//   },
// };
