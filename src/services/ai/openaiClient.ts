import OpenAI from 'openai';
import { AIServiceError } from './types';

class OpenAIClient {
    private static instance: OpenAIClient;
    private client: OpenAI | null = null;
    private requestCount = 0;
    private readonly MAX_REQUESTS_PER_SESSION = 100;

    private constructor() {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (apiKey) {
            this.client = new OpenAI({
                apiKey,
                dangerouslyAllowBrowser: true,
            });
        }
    }

    public static getInstance(): OpenAIClient {
        if (!OpenAIClient.instance) {
            OpenAIClient.instance = new OpenAIClient();
        }
        return OpenAIClient.instance;
    }

    public isEnabled(): boolean {
        return !!this.client && import.meta.env.VITE_AI_ENABLED === 'true';
    }

    public getRequestCount(): number {
        return this.requestCount;
    }

    public getRemainingRequests(): number {
        return Math.max(0, this.MAX_REQUESTS_PER_SESSION - this.requestCount);
    }

    async generateCompletion(
        messages: OpenAI.Chat.ChatCompletionMessageParam[],
        options?: Partial<OpenAI.Chat.ChatCompletionCreateParamsNonStreaming>
    ): Promise<string> {
        if (!this.client) {
            throw new AIServiceError('OpenAI client not initialized. check API key.');
        }

        if (this.requestCount >= this.MAX_REQUESTS_PER_SESSION) {
            throw new AIServiceError('Session request limit exceeded. Please refresh or try again later.', 'LIMIT_EXCEEDED');
        }

        try {
            this.requestCount++;
            const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

            const response = await this.client.chat.completions.create({
                model,
                messages,
                ...options,
            });

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new AIServiceError('Empty response from AI', 'EMPTY_RESPONSE');
            }

            return content;
        } catch (error: unknown) {
            console.error('AI Service Error:', error);
            if (error instanceof AIServiceError) throw error;
            throw new AIServiceError((error as Error).message || 'Unknown AI error', (error as { code?: string }).code);
        }
    }
}

export const openaiClient = OpenAIClient.getInstance();
