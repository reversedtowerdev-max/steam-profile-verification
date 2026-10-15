import { KVAdd, KVGet } from "./kvservics";

export interface DiscordUser {
  id: string;
  username: string;
  avatar?: string | null;
}

export interface StoredUser {
  id: string;
  username: string;
  avatar: string | null;
  steamID: string | null;
  createdAt: number;
  verified: boolean;
}

export async function updateSteamID(
  discordId: string,
  steamId: string
) {
  const key = `user:${discordId}`;

  const user = await KVGet<StoredUser>(key);

  if (!user) {
    throw new Error("User not found");
  }

  user.steamID = steamId;

  await KVAdd(key, user);

  return user;
}

export async function authenticateUser(discordUser: DiscordUser) {
  const key = `user:${discordUser.id}`;

  const existingUser = await KVGet<StoredUser>(key);

  if (existingUser) {
    return {
      isNewUser: false,
      user: existingUser
    };
  }

  const newUser: StoredUser = {
    id: discordUser.id,
    username: discordUser.username,
    avatar: discordUser.avatar ?? null,
    steamID: null,
    createdAt: Date.now(),
    verified: false
  };

  await KVAdd(key, newUser);

  return {
    isNewUser: true,
    user: newUser
  };
}