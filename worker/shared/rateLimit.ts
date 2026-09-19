export async function checkRateLimit(
    kv: KVNamespace,
    ip: string,
    limit: number,
    windowSeconds: number
): Promise<boolean> {
    const key = `rl:${ip}`;
    const current = await kv.get(key);
    const count = current ? Number(current) : 0;
    if (count >= limit) return false;
    await kv.put(key, String(count + 1), { expirationTtl: windowSeconds });
    return true;
}
