/**
 * AI Client (Proxy)
 *
 * The OpenAI key is NEVER shipped to the browser. All requests are routed
 * through a server-side proxy (Supabase Edge Function `ai-proxy` by default)
 * which holds the secret, applies per-user rate limiting, and returns only
 * the assistant message content.
 *
 * Configuration:
 *   - VITE_AI_ENABLED          : "true" to enable AI features (default: false)
 *   - VITE_AI_PROXY_URL        : full URL to the proxy (overrides Supabase default)
 *   - VITE_OPENAI_MODEL        : model identifier forwarded to the proxy
 *   - VITE_SUPABASE_URL        : used to derive the default proxy URL
 *   - VITE_SUPABASE_ANON_KEY   : forwarded as `apikey` header so the function
 *                                can run with row-level-security context
 */

import { supabase } from '../../lib/supabase';
import { AIServiceError } from './types';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatCompletionOptions {
    model?: string;
    max_tokens?: number;
    temperature?: number;
    response_format?: { type: 'text' | 'json_object' };
}

interface ProxyResponseSuccess {
    content: string;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

interface ProxyResponseError {
    error: string;
    code?: string;
    status?: number;
}

class AIProxyClient {
    private static instance: AIProxyClient;

    // Session-local soft cap to keep an obviously runaway page from spamming
    // the backend.  The authoritative rate-limit lives on the server.
    private requestCount = 0;
    private readonly MAX_REQUESTS_PER_SESSION = 100;

    private constructor() { /* singleton */ }

    public static getInstance(): AIProxyClient {
        if (!AIProxyClient.instance) {
            AIProxyClient.instance = new AIProxyClient();
        }
        return AIProxyClient.instance;
    }

    public isEnabled(): boolean {
        const flag = import.meta.env.VITE_AI_ENABLED === 'true';
        return flag && !!this.resolveProxyUrl();
    }

    public getRequestCount(): number {
        return this.requestCount;
    }

    public getRemainingRequests(): number {
        return Math.max(0, this.MAX_REQUESTS_PER_SESSION - this.requestCount);
    }

    private resolveProxyUrl(): string | null {
        const explicit = import.meta.env.VITE_AI_PROXY_URL as string | undefined;
        if (explicit) return explicit.replace(/\/+$/, '');

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
        if (
            supabaseUrl &&
            supabaseUrl !== 'https://placeholder.supabase.co'
        ) {
            return `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/ai-proxy`;
        }
        return null;
    }

    async generateCompletion(
        messages: ChatMessage[],
        options?: ChatCompletionOptions
    ): Promise<string> {
        const proxyUrl = this.resolveProxyUrl();
        if (!proxyUrl) {
            throw new AIServiceError(
                'AI proxy is not configured. Set VITE_AI_PROXY_URL or VITE_SUPABASE_URL.',
                'CONFIG_MISSING'
            );
        }

        if (this.requestCount >= this.MAX_REQUESTS_PER_SESSION) {
            throw new AIServiceError(
                'Session request limit exceeded. Please refresh or try again later.',
                'LIMIT_EXCEEDED'
            );
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
        if (anonKey) headers['apikey'] = anonKey;

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData.session?.access_token;
            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            } else if (anonKey) {
                headers['Authorization'] = `Bearer ${anonKey}`;
            }
        } catch {
            // Supabase session unreachable — proxy will reject if it requires auth.
        }

        const body = {
            model: options?.model ?? import.meta.env.VITE_OPENAI_MODEL ?? 'gpt-4o-mini',
            messages,
            max_tokens: options?.max_tokens,
            temperature: options?.temperature,
            response_format: options?.response_format,
        };

        let response: Response;
        try {
            this.requestCount++;
            response = await fetch(proxyUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
        } catch (err) {
            throw new AIServiceError(
                `Network error talking to AI proxy: ${(err as Error).message}`,
                'NETWORK'
            );
        }

        let payload: ProxyResponseSuccess | ProxyResponseError;
        try {
            payload = (await response.json()) as ProxyResponseSuccess | ProxyResponseError;
        } catch {
            throw new AIServiceError(
                `AI proxy returned non-JSON response (HTTP ${response.status}).`,
                'BAD_RESPONSE'
            );
        }

        if (!response.ok || 'error' in payload) {
            const errPayload = payload as ProxyResponseError;
            const code =
                response.status === 401 || response.status === 403
                    ? 'AUTH_FAILED'
                    : errPayload.code;
            throw new AIServiceError(
                errPayload.error || `AI proxy request failed (HTTP ${response.status}).`,
                code
            );
        }

        const success = payload as ProxyResponseSuccess;
        if (!success.content) {
            throw new AIServiceError('Empty response from AI', 'EMPTY_RESPONSE');
        }
        return success.content;
    }
}

export const openaiClient = AIProxyClient.getInstance();
