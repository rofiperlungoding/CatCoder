/**
 * Parse the comma-separated ALLOWED_ORIGINS var into a list, e.g.
 * "https://catcoder.online,https://www.catcoder.online".
 */
export function parseOrigins(raw: string | undefined | null): string[] {
    return (raw ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}

/**
 * CORS headers for an API response. The request's Origin is echoed back only
 * when it appears in the allowlist — arbitrary sites get no CORS grant. Falls
 * back to the first allowlisted origin for same-origin or no-Origin calls.
 */
export function corsHeaders(
    allowed: string[],
    requestOrigin: string | null
): Record<string, string> {
    const origin =
        requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : (allowed[0] ?? '');
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
    };
}

export function handleOptions(allowed: string[], requestOrigin: string | null): Response {
    return new Response(null, {
        status: 204,
        headers: corsHeaders(allowed, requestOrigin),
    });
}
