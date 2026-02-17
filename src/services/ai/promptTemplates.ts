import type { AIHintRequest, AICodeReviewRequest } from './types';

export class PromptTemplates {
  private static readonly SYSTEM_PROMPT = `
    You are a patient, encouraging, and highly intelligent coding tutor named "CatCoder AI".
    Your goal is to help students learn without giving away answers immediately unless asked for a solution.
    Always prioritize educational value over just fixing the code.
    Use simple, clear language suitable for beginners.
    Be friendly but professional.
  `;

  static generateHintPrompt(request: AIHintRequest): string {
    const { code, language, hintLevel, previousHints } = request;

    let levelInstruction = '';
    switch (hintLevel) {
      case 'gentle':
        levelInstruction = 'Provide a small, gentle nudge. Ask a leading question. Do NOT write any code.';
        break;
      case 'detailed':
        levelInstruction = 'Provide a detailed explanation of the concept. Explain the logic needed. show pseudo-code if helpful, but avoid giving the exact solution.';
        break;
      case 'solution':
        levelInstruction = 'Provide the complete solution code with a clear explanation of why it works. break it down step-by-step.';
        break;
    }

    const context = previousHints && previousHints.length > 0
      ? `Previous hints given: ${previousHints.join('\n')}`
      : 'No previous hints given.';

    return `
      ${this.SYSTEM_PROMPT}

      Task: Generate a ${hintLevel} hint for the following ${language} code challenge.
      
      User's Code:
      \`\`\`${language}
      ${code}
      \`\`\`

      Instruction: ${levelInstruction}

      Context: ${context}
    `;
  }

  static generateCodeReviewPrompt(request: AICodeReviewRequest): string {
    const { code, language, testResults } = request;
    const testSummary = testResults.map(t =>
      `Test: ${t.passed ? 'PASSED' : 'FAILED'} - ${t.error || t.output}`
    ).join('\n');

    return `
      ${this.SYSTEM_PROMPT}

      Task: Perform a comprehensive code review of the following ${language} submission.
      The user is a beginner learning programming.

      User's Code:
      \`\`\`${language}
      ${code}
      \`\`\`

      Test Results:
      ${testSummary}

      Return a JSON object with the following structure:
      {
        "rating": number (1-5),
        "strengths": ["string", "string"],
        "improvements": ["string", "string"],
        "alternatives": ["string"],
        "explanation": "string"
      }

      Criteria:
      - 5: Perfect, efficient, clean code (all tests passed)
      - 4: Good code, minor style issues (all tests passed)
      - 3: Functional but inefficient or messy (all tests passed)
      - 2: Fails some tests or has logic errors
      - 1: Fails most tests or syntax errors

      Be constructive and encouraging.
    `;
  }

  static generateRecommendationPrompt(userProgress: { level: number; streak: number; recentAttempts: unknown[] }, availableChallenges: { id: string; title: string; difficulty: string }[]): string {
    return `
      ${this.SYSTEM_PROMPT}

      Task: Recommend the next best challenge for the user based on their history.

      User History:
      ${JSON.stringify(userProgress)}

      Available Challenges:
      ${JSON.stringify(availableChallenges.map(c => ({ id: c.id, title: c.title, difficulty: c.difficulty })))}

      Return a JSON object with:
      {
        "challengeId": "string",
        "reason": "string",
        "confidence": number,
        "estimatedDifficulty": "string",
        "estimatedTime": "string"
      }
    `;
  }

  static generateLearningPathPrompt(userContext: any, nextLessons: any[]): string {
    return `
      ${this.SYSTEM_PROMPT}

      Task: Act as a personalized coding mentor. Analyze the user's progress and generate a motivating, actionable learning guide.

      User Context:
      - Current Level: ${userContext.level}
      - XP: ${userContext.xp}
      - Recent Activity: ${JSON.stringify(userContext.recentActivity)}
      - Current Streak: ${userContext.streak} days

      Available Next Lessons (CHOOSE ONE OF THESE):
      ${JSON.stringify(nextLessons.map(l => ({ id: l.id, title: l.title, topic: l.topic })))}

      Output Requirement:
      Return a JSON object with the following structure:
      {
        "message": "A short, encouraging message (max 2 sentences) acknowledging their recent progress or streak.",
        "recommendation": "The exact title of the chosen lesson from the list above.",
        "recommendationId": "The exact 'id' of the chosen lesson from the list above.",
        "reason": "Why this specific lesson is important for their growth (max 1 sentence).",
        "actionLabel": "A short, punchy button label (e.g. 'Start Loops', 'Go to Lesson')."
      }

      CRITICAL:
      - You MUST choose a lesson from the "Available Next Lessons" list.
      - The 'recommendationId' MUST match one of the provided IDs exactly.
      - Make the recommendation title or reasoning SPECIFIC to the programming language (e.g. say 'Python Loops', not just 'Loops').

      Tone: Enthusiastic, professional, concise.
    `;
  }
}
