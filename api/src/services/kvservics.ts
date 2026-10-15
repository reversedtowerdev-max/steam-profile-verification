import { env } from "cloudflare:workers";

export async function KVAdd(key: string, value: unknown) {
  await env.USER_KV.put(key, JSON.stringify(value));
  return { success: true };
}

export async function KVGet<T = unknown>(
  key: string
): Promise<T | null> {
  const raw = await env.USER_KV.get(key, "json");
  return raw as T | null;
}

export async function KVRemove(key: string) {
  await env.USER_KV.delete(key);
  return { success: true };
}

export async function KVList() {
  const list = await env.USER_KV.list();
  return list.keys.map((k: { name: any; }) => k.name);
}