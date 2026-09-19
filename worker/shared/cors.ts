export function corsHeaders(origin: string): Record<string, string> {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
    };
}

export function handleOptions(origin: string): Response {
    return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
    });
}
