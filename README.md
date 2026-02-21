# CATCODER(1) User Manual

## NAME
CatCoder — AI-accelerated learning platform for software development

## SYNOPSIS
npm run dev
npm run build
npm run storybook

## DESCRIPTION
CatCoder is a curriculum-driven platform designed to modernize the acquisition of software engineering skills. It combines structured learning paths with hands-on practice, gamification, and integrated artificial intelligence to provide a comprehensive educational environment.

The platform is architected to be accessible, open-source, and performance-optimized, supporting real-time code execution and personalized learning insights.

## VISUAL INTERFACE REPRESENTATION
The following sequence provides a technical overview of the platform's primary user interfaces and workflow cycles:

![Screenshot 1](public/ss%20catcoder/1.png)
![Screenshot 2](public/ss%20catcoder/2.png)
![Screenshot 3](public/ss%20catcoder/3.png)
![Screenshot 4](public/ss%20catcoder/4.png)
![Screenshot 5](public/ss%20catcoder/5.png)
![Screenshot 6](public/ss%20catcoder/6.png)
![Screenshot 7](public/ss%20catcoder/7.png)

## ARCHITECTURE
CatCoder utilizes a modern, performance-centric stack for optimal developer and user experience:

- UI Framework: React 19 with Vite.
- Styling: Tailwind CSS 4 using the Emerald design system.
- State Management: Zustand with persistence capabilities.
- Backend/Infrastructure: Supabase (PostgreSQL, Authentication, Row-Level Security).
- Code Execution Engine: Pyodide for WebAssembly-based Python execution and native JavaScript execution.
- Intelligence: OpenAI integration for personalized progress analysis and real-time mentorship.
- Deployment: Progressive Web App (PWA) with offline-first capabilities via Vite PWA.

## CORE MODULES

### AI-Powered Mentorship
- Integrated assistant providing context-aware hints and explanations.
- Insights panel offering personalized XP analysis and skill recommendations.
- Dynamic challenge suggestions based on historical performance metrics.

### Interactive Pedagogy
- Structured curriculum for Python, JavaScript, and C++.
- Browser-resident code execution for immediate feedback loops.
- Hands-on challenges with automated validation.

### Practice and Competition
- Curated repository of algorithmic challenges across three difficulty tiers.
- Global leaderboards and league-based progression (Bronze to Diamond).
- Daily challenges designed to encourage consistent practice and retention.

### Platform Resilience
- Full Progressive Web App (PWA) support for installability.
- Service-worker based caching for offline functionality.
- Performance monitoring via Web Vitals.

## SYSTEM REQUIREMENTS
- Node.js version 18.0.0 or higher.
- npm version 9.0.0 or higher.
- OpenAI API credentials (for mentorship features).
- Supabase Project credentials.

## INSTALLATION AND SETUP

### 1. Clone the Environment
```bash
git clone https://github.com/rofiperlungoding/CatCoder.git
cd CatCoder
```

### 2. Dependency Installation
```bash
npm install
```

### 3. Configuration
Initialize the environment configuration by creating a `.env` file based on the provided `.env.example`. Ensure the following keys are specified:
- Supabase URL and Anon Key.
- OpenAI API Key.

### 4. Development Execution
Launch the local development environment:
```bash
npm run dev
```

### 5. Specialized Tooling
To view the UI component library:
```bash
npm run storybook
```

## DOCUMENTATION
Technical documentation and component specifications are maintained through Storybook interfaces for high visibility into the design system.

## SECURITY
Data access is enforced through Supabase Row-Level Security (RLS) policies, ensuring that student data remains isolated and secure.

## LICENSE
Copyright (c) 2026 CatCoder Project. Distributed under the MIT License.
