/**
 * Best-effort client identity for rate limiting. Cloudflare injects
 * CF-Connecting-IP; the fallback keeps local/non-proxied testing working.
 */
export function clientIp(request: Request): string {
    return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}

/**
 * Sliding-window-ish rate limiter on top of Workers KV.
 *
 * Known limitation: KV is eventually consistent and get+put is not atomic,
 * so concurrent requests can slip past the counter. This is abuse control,
 * not a security boundary — swap for a Durable Object if hard guarantees
 * are ever needed.
 */
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
