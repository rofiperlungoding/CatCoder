# 🐛 CatCoder Remaining Issues Log
### Tracking known bugs, warnings, and external conflicts.

---

## 🛑 Critical / High Priority
*No critical blocking bugs identified as of v2.0.0.*

---

## ⚠️ Medium Priority

### 1. `injection_script.js` Duplicate Declaration
- **Error:** `Uncaught SyntaxError: Identifier 'bypasses' has already been declared`
- **Source:** External Browser Extension.
- **Status:** **Resolved (External)**
- **Verification:** Verified codebase does not use `bypasses` variable. Error is strictly from user's environment/extensions.
- **Action:** No further action required.

### 2. `fetchProfile` Timeout Potential
- **Warning:** `[fetchProfile] Timeout after 10 seconds`
- **Source:** `src/stores/index.ts`
- **Status:** **Resolved**
- **Action:** Updated `initializeSession` to ensure `isLoading` is set to `false` even if profile fetch/creation fails, preventing infinite loading screens.

---

## ℹ️ Low Priority / Warnings

### 3. Tracking Prevention Blocked Storage
- **Warning:** `Tracking Prevention blocked access to storage`
- **Source:** Browser Privacy Settings.
- **Status:** **Resolved (UX)**
- **Action:** Added active storage availability check in `App.tsx`. Displays a "Storage access blocked" toast warning to inform the user.

### 4. Font Loading CSP Violation (Intermittent)
- **Warning:** `Refused to load the font...`
- **Source:** `index.html` CSP.
- **Status:** **Resolved**
- **Action:** Added `data:` to `font-src` in Content Security Policy to allow embedded font loading.

---

<div align="center">
  <p>Last Updated: February 16, 2026</p>
</div>
