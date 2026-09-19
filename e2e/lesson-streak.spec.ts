import { test, expect, type Page } from '@playwright/test';

/**
 * End-to-end: a signed-in learner completes one full lesson and the XP/streak
 * shown in the Recap are the SERVER's response values (local backend RPC,
 * identical rules to the production Worker), not client-computed numbers.
 *
 * Path taken (deliberately minimal and deterministic — no Pyodide/CDN):
 *   PreFlight MCQ answered → "Skip ahead" (test-out, skips the Learn phase
 *   incl. the runnable playground) → Practice codeTask → PostFlight MCQ →
 *   transfer step → Recap, where `validateAndComplete('lesson', …)` fires
 *   exactly once.
 *
 * Server truth is read back from the local backend's profile store
 * (`cc_local_profiles`), which mirrors the production `profiles` table
 * semantics: xp, streak_current, streak_best, last_activity_date, and the
 * user_progress row with the completion.
 */

const UNIQUE = `e2e-lesson-${Date.now()}`;
const PASSWORD = 'e2e-lesson-pass-1';
const LESSON_TITLE = 'Hello, World!';
const LESSON_ID = 'py-t1-hello';
const YES_OPTION = 'Yes — I understand this';

interface LocalProfile {
    id: string;
    username?: string;
    xp?: number;
    level?: number;
    streak_current?: number;
    streak_best?: number;
    last_activity_date?: string | null;
}

/** Sign up through the real form (local backend auto-signs-in) and land on /home. */
async function signUpAndEnter(page: Page): Promise<void> {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    await page.getByPlaceholder('Enter your name').fill(`E2E ${UNIQUE}`);
    await page.getByPlaceholder('name@example.com').fill(`${UNIQUE}@example.test`);
    await page.getByPlaceholder('••••••••').fill(PASSWORD);
    // The submit button's accessible name is "Button" (component label);
    // match by its visible text instead.
    await page.locator('button', { hasText: 'Create Account' }).click();
    await page.waitForURL(/\/home\/?$/);
}

/** Walk the wizard via test-out to the Recap, where completion fires. */
async function completeLessonWizard(page: Page): Promise<void> {
    await page.goto('/learn');
    await page.getByRole('button', { name: new RegExp(LESSON_TITLE) }).first().click();
    await expect(page).toHaveURL(new RegExp(`/learn/${LESSON_ID}/?$`));

    // PreFlight: answer the recall MCQ correctly so the test-out banner appears.
    await page.getByText(YES_OPTION, { exact: true }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    await page.getByRole('button', { name: 'Skip ahead' }).click();

    // Practice codeTask: not a Try gate — the primary advances directly.
    await page.getByRole('button', { name: 'Submit' }).click();

    // PostFlight: answer the recall MCQ (confidence defaults to medium),
    // then the transfer task closes the phase and opens the Recap.
    await page.getByText(YES_OPTION, { exact: true }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    await page.getByRole('button', { name: 'Check', exact: true }).click(); // MCQ → transfer
    await page.getByRole('button', { name: 'Submit' }).click(); // transfer → Recap

    // Recap reached — the RPC has been kicked off (pill starts as "Saving XP…").
    await expect(page.getByText('Lesson complete', { exact: true })).toBeVisible();
}

/** Read the local backend's profile table (the "server" in this mode). */
async function readProfiles(page: Page): Promise<LocalProfile[]> {
    return page.evaluate(() => {
        const raw = localStorage.getItem('cc_local_profiles');
        return raw ? (JSON.parse(raw) as LocalProfile[]) : [];
    });
}

function findTestProfile(profiles: LocalProfile[]): LocalProfile {
    const mine = profiles.find((p) => p.username?.includes(UNIQUE));
    if (!mine) throw new Error(`profile for ${UNIQUE} not found in cc_local_profiles`);
    return mine;
}

test.describe('Lesson completion → server XP/streak', () => {
    test('completing one lesson awards +50 XP and a 1-day streak from the server response', async ({ page }) => {
        await signUpAndEnter(page);

        // Baseline: fresh profile, zeroed game state, no completion row.
        const before = findTestProfile(await readProfiles(page));
        expect(before.xp).toBe(0);
        expect(before.streak_current ?? 0).toBe(0);
        expect(before.last_activity_date ?? null).toBeNull();

        await completeLessonWizard(page);

        // The Recap renders the SERVER response values (not estimates):
        // no "~" prefix and no "(sign in to keep)" suffix means server-awarded.
        await expect(page.getByText('+50 XP', { exact: true })).toBeVisible();
        await expect(page.getByText('1 day streak')).toBeVisible();
        // Toast from the RPC result (Toaster renders once per portal root; two
        // can exist in dev, so assert any-of rather than a strict single match).
        await expect(page.getByText('Lesson complete! +50 XP').first()).toBeVisible();

        // Server truth: xp/streak advanced by the submit_completion rules.
        const after = findTestProfile(await readProfiles(page));
        expect(after.xp).toBe(50);
        expect(after.streak_current).toBe(1);
        expect(after.streak_best).toBe(1);
        expect(after.last_activity_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(after.last_activity_date).toBe(new Date().toISOString().slice(0, 10));

        // The completion row exists server-side for this exact lesson.
        const progress = await page.evaluate(() => {
            const raw = localStorage.getItem('cc_local_progress');
            return raw ? (JSON.parse(raw) as { content_id: string; content_type: string; status: string }[]) : [];
        });
        expect(progress).toContainEqual(
            expect.objectContaining({ content_id: LESSON_ID, content_type: 'lesson', status: 'completed' })
        );
    });

    test('replaying the same lesson is server-deduped — no double XP, streak unchanged', async ({ page }) => {
        await signUpAndEnter(page);
        await completeLessonWizard(page);
        await expect(page.getByText('+50 XP', { exact: true })).toBeVisible();

        // Re-enter the same lesson and walk to the Recap again.
        await completeLessonWizard(page);

        // The server answered "Already completed" — no new XP minted.
        await expect(page.getByText('Already completed', { exact: true })).toBeVisible();
        await expect(page.getByText('Lesson already completed.').first()).toBeVisible(); // info toast

        const final = findTestProfile(await readProfiles(page));
        expect(final.xp).toBe(50); // unchanged — the duplicate award was blocked server-side
        expect(final.streak_current).toBe(1); // same UTC day: streak holds, not re-incremented
        expect(final.streak_best).toBe(1);
    });
});
