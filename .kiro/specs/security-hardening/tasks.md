# Implementation Plan: Security Hardening

## Overview

This implementation plan transforms CatCoder from a client-trusted architecture to a hardened security model. Tasks are ordered to address critical vulnerabilities first (code execution, XP manipulation) before implementing defense-in-depth measures.

## Tasks

- [x] 1. Set up project dependencies and testing infrastructure
  - Install crypto-js for AES encryption
  - Install @fingerprintjs/fingerprintjs for device fingerprinting
  - Install fast-check for property-based testing
  - Configure Vitest for security module tests
  - _Requirements: 3.1, 5.5_

- [x] 2. Implement sandboxed code execution
  - [x] 2.1 Create Web Worker sandbox file
    - Create `public/sandbox-worker.js` with safe console implementation
    - Block access to window, document, fetch, XMLHttpRequest, localStorage
    - Implement postMessage communication for output capture
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 2.2 Create secure code runner hook
    - Create `src/hooks/useSecureCodeRunner.ts`
    - Implement 3-second timeout with worker termination
    - Create fresh worker instance for each execution
    - Handle worker errors and output aggregation
    - _Requirements: 1.3, 1.6_

  - [x] 2.3 Write property tests for code runner
    - **Property 1: Console Output Capture**
    - **Property 2: Blocked API Access with Graceful Handling**
    - **Property 3: Worker State Isolation**
    - **Validates: Requirements 1.2, 1.4, 1.5, 1.6**

  - [x] 2.4 Migrate existing useCodeRunner to use sandbox
    - Update `src/hooks/useCodeRunner.ts` to use Web Worker
    - Maintain backward compatibility with existing API
    - Update JavaScript execution path
    - _Requirements: 1.1_

- [x] 3. Checkpoint - Verify sandboxed execution
  - Ensure all code runner tests pass
  - Manually test code execution in browser
  - Ask the user if questions arise

- [x] 4. Implement server-side XP authority
  - [x] 4.1 Create Supabase RLS policies
    - Add SQL migration for RLS on user_progress table
    - Add SQL migration for RLS on profiles table
    - Revoke direct INSERT/UPDATE/DELETE from authenticated users
    - _Requirements: 2.1_

  - [x] 4.2 Create submit_completion RPC function
    - Create SQL function with SECURITY DEFINER
    - Implement server-side XP calculation
    - Add duplicate completion prevention with ON CONFLICT
    - Add helper functions for level/rank calculation
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [x] 4.3 Write property test for duplicate prevention
    - **Property 4: Duplicate XP Prevention**
    - **Validates: Requirements 2.5**

  - [x] 4.4 Update frontend stores to use RPC
    - Modify `useProgressStore.validateAndComplete` to use new RPC
    - Remove client-side XP manipulation from `useUserStore.addXP`
    - Implement profile refresh after completion
    - _Requirements: 2.6_

- [x] 5. Checkpoint - Verify server-side XP
  - Ensure RPC function works correctly
  - Verify RLS blocks direct database writes
  - Ask the user if questions arise

- [x] 6. Implement encrypted local storage
  - [x] 6.1 Create secure storage adapter
    - Create `src/lib/secureStorage.ts`
    - Implement AES encryption for setItem
    - Implement AES decryption for getItem
    - Handle decryption failures gracefully
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 6.2 Write property tests for secure storage
    - **Property 5: Storage Encryption Round-Trip**
    - **Property 6: Corrupted Storage Handling**
    - **Validates: Requirements 3.1, 3.2, 3.4**

  - [x] 6.3 Integrate secure storage with Zustand
    - Update `src/stores/index.ts` to use secureStorage
    - Configure persist middleware with custom storage
    - Test migration from unencrypted to encrypted storage
    - _Requirements: 3.5_

- [x] 7. Implement Content Security Policy
  - [x] 7.1 Add CSP meta tag to index.html
    - Add meta tag with default-src 'none'
    - Configure script-src, style-src, img-src, connect-src
    - Configure worker-src for Web Worker support
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 7.2 Write unit tests for CSP configuration
    - Verify CSP meta tag presence
    - Verify correct directive values
    - **Validates: Requirements 4.1-4.6**

- [x] 8. Checkpoint - Verify storage and CSP
  - Ensure encrypted storage works with existing data
  - Verify CSP doesn't break application functionality
  - Ask the user if questions arise

- [x] 9. Implement request firewall
  - [x] 9.1 Create request firewall module
    - Create `src/lib/requestFirewall.ts`
    - Implement fetch interception
    - Implement XMLHttpRequest interception
    - Configure allowed domains list
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 9.2 Write property tests for firewall
    - **Property 7: Firewall Allowlist Enforcement**
    - **Validates: Requirements 6.2, 6.4, 6.5**

  - [x] 9.3 Initialize firewall in application entry
    - Add firewall initialization to `src/main.tsx`
    - Configure production-only activation
    - _Requirements: 6.1_

- [x] 10. Implement DOM integrity monitoring
  - [x] 10.1 Create DOM monitor module
    - Create `src/lib/domMonitor.ts`
    - Implement MutationObserver for script/iframe detection
    - Implement element removal on detection
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 10.2 Write property tests for DOM monitor
    - **Property 8: DOM Injection Removal**
    - **Validates: Requirements 7.2**

  - [x] 10.3 Initialize DOM monitor in application
    - Add monitor initialization to `src/main.tsx`
    - Configure production-only activation
    - _Requirements: 7.5_

- [x] 11. Implement server time synchronization
  - [x] 11.1 Create server time RPC function
    - Add SQL function to return current server time
    - _Requirements: 8.1_

  - [x] 11.2 Create server time module
    - Create `src/lib/serverTime.ts`
    - Implement time sync with latency compensation
    - Implement getTrueTime and getTrueDate functions
    - Add out-of-sync detection (5 minute threshold)
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [x] 11.3 Write property tests for time sync
    - **Property 9: Server Time Offset Calculation**
    - **Validates: Requirements 8.2**

  - [x] 11.4 Integrate server time with streak system
    - Update streak calculation to use getTrueTime
    - _Requirements: 8.4_

- [x] 12. Implement security event logging
  - [x] 12.1 Create security logs table
    - Add SQL migration for security_logs table
    - Add indexes for efficient querying
    - _Requirements: 9.5_

  - [x] 12.2 Create security logger RPC function
    - Add SQL function for logging security events
    - _Requirements: 9.1_

  - [x] 12.3 Create security logger module
    - Create `src/lib/securityLogger.ts`
    - Implement non-blocking event logging
    - Define security event types
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 12.4 Write property tests for security logger
    - **Property 10: Security Log Structure**
    - **Validates: Requirements 9.2**

  - [x] 12.5 Integrate logger with security modules
    - Add logging to request firewall
    - Add logging to DOM monitor
    - _Requirements: 9.3_

- [x] 13. Checkpoint - Verify defense modules
  - Ensure firewall, DOM monitor, time sync work correctly
  - Ensure security logging captures events
  - Ask the user if questions arise

- [x] 14. Implement device fingerprinting
  - [x] 14.1 Create active sessions table
    - Add SQL migration for active_sessions table
    - _Requirements: 5.2_

  - [x] 14.2 Create fingerprint verification module
    - Create `src/lib/deviceFingerprint.ts`
    - Implement fingerprint generation using FingerprintJS
    - Implement session storage and verification
    - _Requirements: 5.1, 5.3, 5.4_

  - [x] 14.3 Integrate fingerprinting with auth flow
    - Add fingerprint capture on login
    - Add fingerprint verification on sensitive operations
    - _Requirements: 5.1, 5.3_

- [x] 15. Implement honeypot traps
  - [x] 15.1 Create honeypot page component
    - Create `src/pages/Honeypot/index.tsx`
    - Implement fake loading state
    - Implement delayed redirect
    - _Requirements: 10.3, 10.4_

  - [x] 15.2 Add honeypot routes
    - Add routes for /admin, /wp-admin, /administrator, /dashboard/admin
    - Ensure routes are not linked in navigation
    - _Requirements: 10.1, 10.5_

  - [x] 15.3 Add honeypot access logging
    - Log access to honeypot routes as security events
    - _Requirements: 10.2_

- [x] 16. Final checkpoint - Complete security audit
  - Run all property-based tests
  - Run all unit tests
  - Verify all security modules are active in production build
  - Ask the user if questions arise

## Notes

- All tasks including property-based tests are required for comprehensive security coverage
- Critical security fixes (Tasks 2, 4, 6) should be prioritized
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases

