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
            console.warn('OpenAI API Key missing. Returning MOCK response for demo purposes.');
            return this.generateMockResponse(messages, options);
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

            // Fallback to mock if authentication fails (401) or forbidden (403)
            if (error instanceof OpenAI.APIError && (error.status === 401 || error.status === 403)) {
                console.warn('Invalid or Expired OpenAI API Key. Falling back to MOCK response.');
                return this.generateMockResponse(messages, options);
            }

            if (error instanceof AIServiceError) throw error;
            throw new AIServiceError((error as Error).message || 'Unknown AI error', (error as { code?: string }).code);
        }
    }

    private generateMockResponse(
        messages: OpenAI.Chat.ChatCompletionMessageParam[],
        options?: Partial<OpenAI.Chat.ChatCompletionCreateParamsNonStreaming>
    ): Promise<string> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const lastMessage = ((messages[messages.length - 1].content as string) || '').toLowerCase();
                const expectsJson = options?.response_format?.type === 'json_object';

                // 1. Check for explicit JSON requests first (Recommendations, Insights, Skills)
                if (lastMessage.includes('recommend') || lastMessage.includes('challenge')) {
                    resolve(JSON.stringify({
                        challengeId: 'intro-python',
                        reason: 'This is a mock recommendation (Demo Mode). Start with the basics.',
                        confidence: 0.85,
                        estimatedDifficulty: 'Easy',
                        estimatedTime: '10 mins'
                    }));
                    return;
                }

                if (lastMessage.includes('skill') || lastMessage.includes('assess')) {
                    resolve(JSON.stringify([
                        { skill: 'Python Syntax', level: 'Beginner', confidence: 0.8 },
                        { skill: 'Loops', level: 'Novice', confidence: 0.6 }
                    ]));
                    return;
                }

                if (lastMessage.includes('progress') || lastMessage.includes('analyze')) {
                    resolve(JSON.stringify([
                        { type: 'strength', title: 'Consistent Coder', description: 'You are coding every day!', priority: 1 },
                        { type: 'tip', title: 'Try Harder Challenges', description: 'You are aceing easy tasks.', priority: 2 }
                    ]));
                    return;
                }

                if (lastMessage.includes('review') || lastMessage.includes('clean code')) {
                    resolve(JSON.stringify({
                        rating: 4,
                        strengths: [
                            "Code is clean and readable",
                            "Variable naming is descriptive",
                            "Logic appears correct for base cases"
                        ],
                        improvements: [
                            "Consider handling edge case: empty input",
                            "Add comments for complex logic blocks",
                            "Use 'const' instead of 'let' where possible"
                        ],
                        alternatives: [
                            "Try a recursive approach for cleaner syntax",
                            "Use a hash map for O(1) lookups"
                        ],
                        explanation: "This is a simulated AI review (Demo Mode - API Key missing). Your code structure looks good, but consider adding more defensive checks.",
                        tokensUsed: 0,
                        cached: false
                    }));
                    return;
                }

                // 2. Handle Text-based requests (Hints) ONLY if not expecting JSON
                if (!expectsJson && (lastMessage.includes('hint') || lastMessage.includes('help'))) {
                    const hints = [
                        "Have you considered using a hash map to store visited nodes?",
                        "Check your loop termination condition. It might be off by one.",
                        "Remember that sorting the array first might simplify the problem.",
                        "Try breaking the problem down into smaller helper functions."
                    ];
                    resolve(`(Demo Hint) ${hints[Math.floor(Math.random() * hints.length)]}`);
                    return;
                }

                // 3. Fallback
                if (expectsJson) {
                    resolve(JSON.stringify({ error: "Mock AI: Unknown request type, returned generic JSON." }));
                } else {
                    resolve("I am a mock AI assistant. Please configure VITE_OPENAI_API_KEY for real responses.");
                }
            }, 1000); // Simulate network delay
        });
    }
}

export const openaiClient = OpenAIClient.getInstance();
