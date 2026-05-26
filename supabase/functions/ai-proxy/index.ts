/**
 * Supabase Edge Function: ai-proxy
 *
 * Server-side proxy that holds the real OpenAI API key. The browser must
 * never see it. The function:
 *   1. Authenticates the caller via the supplied Supabase JWT.
 *   2. Forwards a sanitized chat-completion request to OpenAI.
 *   3. Returns only the assistant message content + usage stats.
 *
 * Deploy:
 *   supabase functions deploy ai-proxy --no-verify-jwt=false
 *
 * Required secrets (set via `supabase secrets set`):
 *   OPENAI_API_KEY      -- the real key (NEVER prefix with VITE_ on the client)
 *   OPENAI_DEFAULT_MODEL (optional, default "gpt-4o-mini")
 */

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const ALLOWED_MODELS = new Set([
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4.1-mini',
    'gpt-4.1',
    'o4-mini',
]);

const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatRequest {
    model?: string;
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
    max_tokens?: number;
    temperature?: number;
    response_format?: { type: 'text' | 'json_object' };
}

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...cors },
    });
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: cors });
    }
    if (req.method !== 'POST') {
        return json({ error: 'Method Not Allowed' }, 405);
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
        return json({ error: 'OPENAI_API_KEY not configured on the server.' }, 500);
    }

    // Authenticate the caller via the Supabase project JWT.
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const auth = req.headers.get('Authorization') ?? '';
    if (!supabaseUrl || !supabaseAnon) {
        return json({ error: 'Supabase environment is not configured.' }, 500);
    }
    const supabase = createClient(supabaseUrl, supabaseAnon, {
        global: { headers: { Authorization: auth } },
    });
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
        return json({ error: 'Unauthorized.', code: 'AUTH_REQUIRED' }, 401);
    }

    let body: ChatRequest;
    try {
        body = (await req.json()) as ChatRequest;
    } catch {
        return json({ error: 'Invalid JSON body.' }, 400);
    }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
        return json({ error: '`messages` is required and must be a non-empty array.' }, 400);
    }
    if (body.messages.length > 32) {
        return json({ error: 'Too many messages (max 32).' }, 400);
    }

    const defaultModel = Deno.env.get('OPENAI_DEFAULT_MODEL') ?? 'gpt-4o-mini';
    const model = body.model && ALLOWED_MODELS.has(body.model) ? body.model : defaultModel;

    const upstream = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages: body.messages,
            max_tokens: body.max_tokens,
            temperature: body.temperature,
            response_format: body.response_format,
        }),
    });

    if (!upstream.ok) {
        const errText = await upstream.text();
        return json(
            {
                error: 'Upstream OpenAI request failed.',
                status: upstream.status,
                detail: errText.slice(0, 500),
            },
            upstream.status === 401 || upstream.status === 403 ? upstream.status : 502
        );
    }

    const data = (await upstream.json()) as any;
    const content = data?.choices?.[0]?.message?.content ?? '';
    return json({
        content,
        usage: data?.usage ?? null,
    });
});
