# Implementation Plan - Security Workflow & Integrity Fix

**Objective**: Resolve persistent GitHub Actions workflow warnings and fix flaky integrity tests in the security pentest suite.

## Proposed Changes

### 1. Secure Storage Integrity (Logic Fix)
- **src/lib/secureStorage.ts**: 
    - Implement HMAC-SHA256 signature for all encrypted data.
    - Format: `hmac(ciphertext).ciphertext`.
    - Verification in `decrypt()`: Verify HMAC BEFORE attempting decryption.
    - Result: Ensures ANY tampering with the stored data results in an immediate rejection (`null`), fixing the flaky test failure.

### 2. Workflow Warning Resolution (CI/CD Fix)
- **.github/workflows/security-pentest.yml**:
    - Update secrets access to use bracket notation (`secrets['VAR']`).
    - Add explicit `permissions: read-all` block.
    - This should resolve the "Context access might be invalid" warnings by being more explicit and ensuring scope.

### 3. Pentest Suite Maintenance
- **src/lib/__tests__/security-pentest.test.ts**:
    - Verify the "Tampered Ciphertext Rejection" test now passes consistently with the new HMAC-backed `secureStorage`.

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure no new linting issues.
- Run `npx vitest run --config vitest.pentest.config.ts` multiple times (e.g., 5 runs) to ensure the property-based tests are stable and 81/81 pass every time.

### Manual Verification
- Check the IDE's "Problems" tab (if possible) to verify the 3 workflow warnings are gone.
- Inspect `.github/workflows/security-pentest.yml` for syntax correctness.
