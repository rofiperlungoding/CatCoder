# Implementation Plan - Unbreakable Bastion (Batch 1: The Python Forge)

**Objective**: Establish the Python-based Secure Core via Pyodide and relocate core platform state into a validated, memory-managed environment.

## Proposed Changes

### Secure Core (Python)
- Create `src/lib/secure_core.py`: The central logic handler.
- Integrate **Pydantic** (in Pyodide) for strict state schema enforcement.
- Implement the `SecureState` model and `dispatch_action` logic.

### Frontend Integration (TypeScript)
- Update `src/hooks/useSecureCore.ts`: A new hook to communicate with the Python engine.
- Configure Pyodide to preload the `secure_core.py` script and required dependencies (pydantic).

#### [TASK 1] The Python Secure Core Logic
- Implementation of `secure_core.py` with:
  - `UserState` Pydantic model (XP, Level, SessionID).
  - XP-to-Level progression algorithms.
  - State immutability guarantees.

#### [TASK 2] Secure Core Hook (TS)
- Loader for `secure_core.py`.
- Bridge to send `Action` objects to Python.
- Effect to listen for state changes from Python and update React.

#### [TASK 3] Migration of State
- Refactor existing XP/Level logic to use `useSecureCore` instead of calculating it in JS or direct database updates without engine verification.

## Verification Plan

### Automated Tests
- Unit tests for `secure_core.py` using a local Python environment.
- Integration tests in Vitest ensuring the TS-Py bridge handles invalid payloads correctly (Fuzzing).

### Manual Verification
- Trigger XP updates and verify the mathematical calculation matches the Python-defined rules in the browser console.
- Test the 15-minute "Scrub" by accelerating time in the Python engine and verifying memory clear.
