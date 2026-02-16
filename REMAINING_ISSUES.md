# 🐛 CatCoder Remaining Issues Log
### Tracking known bugs, warnings, and external conflicts.

---

## 🛑 Critical / High Priority
*No critical blocking bugs identified as of v2.0.0.*

---

## ⚠️ Medium Priority

### 1. `injection_script.js` Duplicate Declaration
- **Error:** `Uncaught SyntaxError: Identifier 'bypasses' has already been declared`
- **Source:** External Browser Extension (confirmed via stack trace inspection).
- **Status:** **Cannot Fix (External)**
- **Impact:** Low. Does not affect CatCoder core logic.
- **Mitigation:** Documented in project reports as an external conflict.

### 2. `fetchProfile` Timeout Potential
- **Warning:** `[fetchProfile] Timeout after 10 seconds` (logged in console).
- **Source:** `src/stores/index.ts`
- **Status:** **Mitigated**
- **Impact:** Prevents UI hangs on slow connections but may show "loading" state indefinitely if Supabase is down.
- **Mitigation:** Increased timeout from 5s to 10s.

---

## ℹ️ Low Priority / Warnings

### 3. Tracking Prevention Blocked Storage
- **Warning:** `Tracking Prevention blocked access to storage for https://jscastdveaypsubntjmc.supabase.co`
- **Source:** Browser Privacy Settings (Brave/Firefox/Safari).
- **Status:** **External Configuration**
- **Impact:** May affect session persistence for users with "Strict" tracking protection.
- **Mitigation:** Advise users to whitelist the site or use "Magic Link" if sessions expire.

### 4. Font Loading CSP Violation (Intermittent)
- **Warning:** `Refused to load the font... because it violates the following Content Security Policy directive`
- **Source:** `index.html` CSP interaction with certain browser extensions.
- **Status:** **Monitoring**
- **Impact:** Very low. System fonts are used as fallback.
- **Mitigation:** CSP already includes `https://fonts.gstatic.com`.

---

<div align="center">
  <p>Last Updated: February 16, 2026</p>
</div>
