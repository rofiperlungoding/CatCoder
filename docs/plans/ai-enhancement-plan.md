# AI Enhancement Plan - CatCoder

## 1. Project Overview

Enhancing CatCoder with AI-powered features:
- Smart Hint System
- Code Review AI
- Personalized Learning
- Integration & Polish

## Phase 1: AI Infrastructure Setup

### Task 1.1: Create OpenAI Service Layer
- [ ] Create `src/services/ai/types.ts` defining all TypeScript interfaces for AI features.
- [ ] Create `src/services/ai/openaiClient.ts` as a singleton client wrapper.
- [ ] Create `src/services/ai/promptTemplates.ts` with structured prompt templates.
- [ ] Create `src/services/ai/aiCache.ts` using localStorage for caching.
- [ ] Create `src/services/ai/aiRateLimit.ts` for client-side rate limiting.
- [ ] Implement `generateCompletion`, `getRequestCount`, `getRemainingRequests`, etc.
- [ ] Provide simple console tests to verify functionality.

### Task 1.2: Setup Environment and Install Dependencies
- [ ] Install `openai` package via npm.
- [ ] Create `.env.local` with necessary environment variables (`VITE_OPENAI_API_KEY`, etc.).
- [ ] Update `.gitignore` to include `.env.local`.
- [ ] Verify build works with `npm run build`.
- [ ] Verify environment variables are accessible.

## Phase 2: Smart Hint System

### Task 2.1: Create Hint Generator Service
- [ ] Create `src/services/ai/hintGenerator.ts`.
- [ ] Implement `generateHint` with rate limiting and caching.
- [ ] Implement `getRemainingHints` and `canGenerateHint`.

### Task 2.2: Create React Hook for Hints
- [ ] Create `src/hooks/useAIHint.ts`.
- [ ] Implement `generateHint` function with loading/error handling.
- [ ] Return hint state, loading, error, and remaining hints.

### Task 2.3: Build Hint UI Components
- [ ] Create `src/components/ai/AILoadingState.tsx`.
- [ ] Create `src/components/ai/ProgressiveHint.tsx`.
- [ ] Create `src/components/ai/AIHintPanel.tsx`.
- [ ] Ensure proper styling matching CatCoder aesthetic.

## Phase 3: Code Review AI

### Task 3.1: Create Code Review Service
- [ ] Create `src/services/ai/codeReviewer.ts`.
- [ ] Implement `reviewCode` method with JSON mode support.
- [ ] Implement caching and fallback behavior.

### Task 3.2: Create Review Hook and UI
- [ ] Create `src/hooks/useCodeReview.ts`.
- [ ] Create `src/components/ai/StarRating.tsx`.
- [ ] Create `src/components/ai/AIReviewCard.tsx`.

## Phase 4: Personalization Engine

### Task 4.1: Create Learning Analytics System
- [ ] Create `src/types/analytics.ts`.
- [ ] Create `src/services/ai/learningAnalyzer.ts`.
- [ ] Implement `analyzeProgress`, `recommendNextChallenge`, `assessSkills`.

### Task 4.2: Create Analytics Hook and Dashboard
- [ ] Create `src/hooks/useAIAnalytics.ts`.
- [ ] Create `src/components/ai/SkillProgressBar.tsx`.
- [ ] Create `src/components/ai/InsightCard.tsx`.
- [ ] Create `src/components/ai/AIInsightsPanel.tsx`.

## Phase 5: Integration & Polish

### Task 5.1: Create AI State Management
- [ ] Create `src/store/aiStore.ts` using Zustand.
- [ ] Define state for hints, reviews, and insights.

### Task 5.2: Integrate AI into Challenge Page
- [ ] Modify `src/pages/ChallengePage.tsx`.
- [ ] Add AI Hint/Insights buttons.
- [ ] Integrate hint/review/insight panels.
- [ ] Hook up code submission to review generation.

### Task 5.3: Add AI Settings Panel
- [ ] Create `src/components/settings/AISettings.tsx`.
- [ ] Display AI status and usage stats.

## Testing & Deployment

### Task 6.1: Unit Tests
- [ ] clear all tests.
- [ ] Create unit tests for OpenAI Client, Cache, Rate Limit, Hint Generator, Code Reviewer.

### Task 6.2: Integration Testing
- [ ] Perform manual testing based on checklist (Hints, Reviews, Analytics, Caching, Limiting).

### Task 6.3: Deployment Prep
- [ ] Update `README.md`.
- [ ] Verify build and linting.
- [ ] Create release branch.
