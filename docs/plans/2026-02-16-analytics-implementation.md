Feature: Analytics Implementation
Goal: Implement performance monitoring (Core Web Vitals) and user behavior tracking.
Architecture: 
- Use `web-vitals` for performance metrics (LCP, FID, CLS).
- Create a `AnalyticsService` singleton to handle event logging.
- Integrate with Supabase (optional table) or just console for now (MVP).

Steps:
1.  **Install `web-vitals`**: Add dependency.
2.  **Create `src/reportWebVitals.ts`**: Helper to log metrics.
3.  **Create `src/services/analytics.ts`**:
    - `logEvent(eventName, params)`
    - `logPageView(path)`
4.  **Initialize in `src/main.tsx`**: Call `reportWebVitals`.
5.  **Track Key Events**:
    - Problem Solved (`ChallengeSolver.tsx`)
    - Page Views (`App.tsx` via `useEffect` on location change)

Dependencies:
- `web-vitals`
- `react-router-dom` (for location tracking)
