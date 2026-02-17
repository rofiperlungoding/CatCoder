# 🐛 CatCoder Remaining Issues Log
### Tracking known bugs, warnings, and external conflicts.

---

## 🛑 Critical / High Priority
*No critical blocking bugs identified as of v2.2.0.*

---

## ⚠️ Medium Priority
*No medium priority issues.*

---

## ℹ️ Low Priority / Warnings
*No low priority issues.*

---

## ✅ Resolved & Verified History (v2.2.0)

### 7. AI Panel Header Overlap & Padding Bleed
- **Source:** `src/pages/Learn/LessonCarousel.tsx`
- **Status:** **Fixed** - Moved padding from parent container to children; implemented full-width sticky headers with solid backgrounds to mask scrolling content.

### 6. Output Visibility during Code Execution
- **Source:** `src/pages/Learn/LessonCarousel.tsx`
- **Status:** **Fixed** - Implemented auto-close logic for Hint/Review panels when 'Run Code' is triggered, ensuring the terminal output is immediately visible.

### 5. Hint Panel Typography Inconsistency
- **Source:** `src/components/ai/AIHintPanel.tsx`
- **Status:** **Fixed** - Changed font from mono to sans-serif and matched styling to the Task panel for visual parity.

### 4. LessonCarousel JSX Tag Mismatch
- **Source:** `src/pages/Learn/LessonCarousel.tsx`
- **Status:** **Fixed** - Resolved nesting errors and orphaned closing tags introduced during UI cleanup.

### 3. Font Loading CSP Violation
- **Source:** `index.html` CSP.
- **Status:** **Fixed** - Added `data:` URI support to `font-src`.

### 2. Tracking Prevention Blocked Storage
- **Source:** Browser Privacy Settings.
- **Status:** **Fixed** - Added storage check in `App.tsx`.

### 1. `injection_script.js` Duplicate Declaration
- **Source:** External Browser Extension.
- **Status:** **Verified External** - No code action required.

---

<div align="center">
  <p>Last Updated: February 17, 2026</p>
</div>
