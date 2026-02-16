# 🐛 CatCoder Remaining Issues Log
### Tracking known bugs, warnings, and external conflicts.

---

## 🛑 Critical / High Priority
*No critical blocking bugs identified as of v2.0.0.*

---

## ⚠️ Medium Priority
*No medium priority issues.*

---

## ℹ️ Low Priority / Warnings
*No low priority issues.*

---

## ✅ Resolved & Verified History (v2.0.0)

### 1. `injection_script.js` Duplicate Declaration
- **Source:** External Browser Extension.
- **Status:** **Verified External** - No code action required.

### 2. `fetchProfile` Timeout Potential
- **Source:** `src/stores/index.ts`
- **Status:** **Fixed** - `initializeSession` correctly resets `isLoading`.

### 3. Tracking Prevention Blocked Storage
- **Source:** Browser Privacy Settings.
- **Status:** **Fixed** - Added storage check in `App.tsx`.

### 4. Font Loading CSP Violation
- **Source:** `index.html` CSP.
- **Status:** **Fixed** - Added `data:` URI support to `font-src`.

---

<div align="center">
  <p>Last Updated: February 16, 2026</p>
</div>
