# Requirements Document

## Introduction

This document defines the requirements for implementing comprehensive security hardening for the CatCoder application. The current implementation has critical vulnerabilities including client-side code execution in the main thread, client-side XP manipulation, and unencrypted local storage. This security overhaul will transform the application from a "Glass House" architecture to a hardened "Fort Knox" security model with defense-in-depth strategies.

## Glossary

- **Code_Runner**: The system component responsible for executing user-submitted code
- **Web_Worker**: An isolated browser thread that runs JavaScript separately from the main thread
- **XP_System**: The experience points and leveling system that tracks user progress
- **RLS**: Row Level Security - Supabase database-level access control
- **RPC**: Remote Procedure Call - Server-side functions that execute with elevated privileges
- **CSP**: Content Security Policy - Browser security headers that restrict resource loading
- **Fingerprint**: A unique identifier generated from device hardware characteristics
- **Honeypot**: A decoy resource designed to detect and track malicious actors

## Requirements

### Requirement 1: Sandboxed Code Execution

**User Story:** As a platform operator, I want user code to execute in an isolated sandbox, so that malicious code cannot access sensitive browser APIs or steal user data.

#### Acceptance Criteria

1. WHEN user code is submitted for execution, THE Code_Runner SHALL execute it in a Web Worker thread isolated from the main thread
2. WHEN code executes in the Web Worker, THE Code_Runner SHALL block access to window, document, fetch, XMLHttpRequest, and localStorage APIs by passing null references
3. WHEN code execution exceeds 3 seconds, THE Code_Runner SHALL terminate the Web Worker and return a timeout error
4. WHEN code produces console output, THE Code_Runner SHALL capture it via postMessage and relay it to the main thread
5. IF code attempts to access blocked APIs, THEN THE Code_Runner SHALL prevent the access and continue execution without crashing
6. WHEN a new code execution request is received, THE Code_Runner SHALL create a fresh Web Worker instance to prevent state leakage between executions

### Requirement 2: Server-Side XP Authority

**User Story:** As a platform operator, I want XP awards to be controlled exclusively by the server, so that users cannot manipulate their progress through browser console commands.

#### Acceptance Criteria

1. THE Database SHALL enforce Row Level Security preventing direct INSERT, UPDATE, or DELETE operations on user_progress and profiles tables from authenticated users
2. WHEN a user completes a problem, THE System SHALL call a server-side RPC function to validate and award XP
3. THE RPC_Function SHALL define XP reward amounts server-side, not accepting XP values as input parameters
4. WHEN the RPC function awards XP, THE Database SHALL update the user's profile atomically
5. WHEN a completion is recorded, THE RPC_Function SHALL prevent duplicate XP awards for the same content using ON CONFLICT handling
6. THE Frontend SHALL refresh user profile data from the server after successful completion rather than updating local state directly

### Requirement 3: Encrypted Local Storage

**User Story:** As a platform operator, I want local storage data to be encrypted, so that users cannot easily edit cached data to unlock features or manipulate progress.

#### Acceptance Criteria

1. WHEN the application stores data to localStorage, THE Storage_System SHALL encrypt the data using AES encryption before writing
2. WHEN the application reads data from localStorage, THE Storage_System SHALL decrypt the data using the same encryption key
3. THE Storage_System SHALL use an environment-configured encryption key, falling back to a default key only in development
4. IF decryption fails due to tampering or corruption, THEN THE Storage_System SHALL return null and clear the corrupted entry
5. THE Storage_System SHALL integrate with Zustand's persist middleware transparently

### Requirement 4: Content Security Policy

**User Story:** As a platform operator, I want strict Content Security Policy headers, so that external scripts and resources cannot be injected into the application.

#### Acceptance Criteria

1. THE Application SHALL include a Content Security Policy meta tag in the HTML head
2. THE CSP SHALL restrict script-src to 'self' and 'unsafe-eval' (required for code execution features)
3. THE CSP SHALL restrict connect-src to 'self' and Supabase domains only
4. THE CSP SHALL restrict img-src to 'self', data URIs, and Supabase storage domains
5. THE CSP SHALL allow worker-src for 'self' and blob: to support Web Workers
6. THE CSP SHALL set default-src to 'none' to deny all resources not explicitly allowed

### Requirement 5: Device Fingerprinting

**User Story:** As a platform operator, I want to track device fingerprints for user sessions, so that stolen session tokens cannot be used from different devices.

#### Acceptance Criteria

1. WHEN a user logs in, THE Auth_System SHALL generate a device fingerprint hash using hardware characteristics
2. THE Auth_System SHALL store the device fingerprint hash alongside the user session in the database
3. WHEN a user performs sensitive operations, THE Auth_System SHALL verify the current device fingerprint matches the stored session fingerprint
4. IF the device fingerprint does not match, THEN THE Auth_System SHALL terminate the session and require re-authentication
5. THE Fingerprint_System SHALL use a third-party fingerprinting library for reliable cross-browser identification

### Requirement 6: Client-Side Request Firewall

**User Story:** As a platform operator, I want to restrict outbound network requests, so that injected scripts cannot exfiltrate data to external servers.

#### Acceptance Criteria

1. THE Application SHALL intercept all fetch and XMLHttpRequest calls at startup
2. WHEN an outbound request is made, THE Firewall SHALL check the destination against an allowlist of approved domains
3. THE Allowlist SHALL include Supabase domains, CDN domains for Pyodide, and the application's own domain
4. IF a request targets a non-allowlisted domain, THEN THE Firewall SHALL block the request and log a security warning
5. THE Firewall SHALL not interfere with requests to allowlisted domains

### Requirement 7: DOM Integrity Monitoring

**User Story:** As a platform operator, I want to detect unauthorized DOM modifications, so that browser extensions or injected scripts cannot manipulate the application interface.

#### Acceptance Criteria

1. THE Application SHALL monitor the DOM for unauthorized script and iframe injections using MutationObserver
2. WHEN an unauthorized script or iframe element is detected, THE Monitor SHALL remove it immediately
3. WHEN a DOM integrity violation is detected, THE Monitor SHALL log the event and optionally flag the user session
4. THE Monitor SHALL observe the entire document body with childList and subtree options enabled
5. THE Monitor SHALL only activate in production builds to avoid interfering with development tools

### Requirement 8: Server Time Synchronization

**User Story:** As a platform operator, I want to use server time for all time-sensitive operations, so that users cannot manipulate streaks or timed challenges by changing their system clock.

#### Acceptance Criteria

1. WHEN the application initializes, THE Time_System SHALL fetch the current server time and calculate the offset from local time
2. THE Time_System SHALL provide a getTrueTime function that returns the current time adjusted by the server offset
3. IF the time offset exceeds 5 minutes, THEN THE Time_System SHALL display a warning and optionally restrict time-sensitive features
4. THE Application SHALL use getTrueTime for all streak calculations and timed challenge validations
5. THE Time_System SHALL account for network latency when calculating the time offset

### Requirement 9: Security Event Logging

**User Story:** As a platform operator, I want security events to be logged to the server, so that I can monitor for and investigate suspicious activity.

#### Acceptance Criteria

1. WHEN a security violation is detected, THE Logger SHALL send an event to the server via RPC
2. THE Security_Log SHALL include event type, timestamp, user ID (if authenticated), and relevant metadata
3. THE Logger SHALL capture events for: blocked requests, DOM violations, fingerprint mismatches, and honeypot triggers
4. THE Logger SHALL not block application functionality if logging fails
5. THE Database SHALL store security logs with appropriate retention policies

### Requirement 10: Honeypot Traps

**User Story:** As a platform operator, I want to deploy honeypot endpoints, so that I can detect and track attackers probing for vulnerabilities.

#### Acceptance Criteria

1. THE Application SHALL define routes for common attack targets (/admin, /wp-admin, /administrator, /dashboard/admin)
2. WHEN a honeypot route is accessed, THE System SHALL log the access as a security event with the user's IP and session info
3. THE Honeypot_Page SHALL display a convincing fake loading state to delay the attacker
4. AFTER a delay, THE Honeypot_Page SHALL redirect to a harmless destination
5. THE Honeypot routes SHALL not be linked from any legitimate application navigation

