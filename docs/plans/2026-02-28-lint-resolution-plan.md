# Implementation Plan - Lint Resolution & Security Patch

**Objective**: Resolve all 21 linting errors to ensure CI/CD pipeline integrity and address the "still failing" report.

## Proposed Changes

### 1. Fix Layout & UI Linting (2 errors)
- **Sidebar.tsx**: Define proper types for `navItems` icons to avoid `any`.
- **useCodeRunner.ts**: Remove unused `_codeStr` parameter in `executeJsFallback`.

### 2. Fix Testing Infrastructure (7 errors)
- **test-worker.ts**: 
    - Remove unused `reject` from the Promise in `runSandbox`.
    - Replace `any` types with `unknown[]` in `safeConsole` methods and `any` in catch block.

### 3. Fix Security Pentest Suite (12 errors)
- **security-pentest.test.ts**:
    - Clean up unused imports/variables (`vi`, `afterEach`, `initializeFirewall`, etc.).
    - Convert `require()` calls to dynamic imports or standard imports if possible, or disable the lint rule if strictly necessary for testing reasons (though standardizing is preferred).

### 4. Environment Configuration
- Review if the provided `sbp_...` secret needs to be integrated into `.env` (likely as a Supabase DB password or management key).

## Verification Plan

### Automated Tests
- Run `npm run lint` and verify "0 problems".
- Run `npm run build` locally to ensure no regressions.
- Run `npx vitest run --config vitest.pentest.config.ts` to verify the security suite still passes after cleanup.

### Manual Verification
- Check the sidebar rendering to ensure icons still appear correctly.
- Verify code execution in the "Practice" tab still works as expected.
