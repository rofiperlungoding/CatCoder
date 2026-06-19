/**
 * LessonExperience — the top-level interactive lesson player that replaces the
 * legacy `LessonCarousel`. It derives a five-phase {@link LessonPlan} from the
 * shared {@link Lesson} (memoized on `activeLesson.id`), initializes the
 * session store, and renders the {@link WizardShell}.
 *
 * On reaching the Recap phase it calls the server-authoritative
 * `validateAndComplete('lesson', …)` exactly once, mapping success /
 * 'Already completed' / failure outcomes, and surfaces the returned
 * `xp_awarded` to the recap for a single XP display (Req 14.4, 14.7). Guest/mock
 * users see a local estimate with a sign-in prompt rather than a failure.
 *
 * Same prop contract as the component it replaces (Req 18.7).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Lesson, Language } from '../../types';
import { loadLessonsByLanguage } from '../../data/lessons';
import { useProgressStore, useUIStore, useUserStore } from '../../stores';
import { buildLessonPlan } from './lessonExperience/engine/buildLessonPlan';
import { AWARD_XP } from './lessonExperience/engine/xpRules';
import { useActivePhaseId, useLessonStore } from './lessonExperience/state/useLessonStore';
import { WizardShell } from './lessonExperience/shell/WizardShell';
import type { RecapCompletion } from './lessonExperience/blocks/RecapBlock';

interface LessonExperienceProps {
    activeLesson: Lesson;
    onComplete: () => void;
    onBack: () => void;
}

const isLocalUser = (id: string | undefined) => !id || id.startsWith('guest-') || id.startsWith('mock-');

export const LessonExperience: React.FC<LessonExperienceProps> = ({ activeLesson, onComplete }) => {
    const navigate = useNavigate();
    const { addToast } = useUIStore();

    const plan = useMemo(() => buildLessonPlan(activeLesson), [activeLesson]);

    const init = useLessonStore((s) => s.init);
    const reset = useLessonStore((s) => s.reset);
    const activePhase = useActivePhaseId();

    const [nextId, setNextId] = useState<string | null>(null);
    const [completion, setCompletion] = useState<RecapCompletion>({
        xpAwarded: activeLesson.xpReward || AWARD_XP.lesson,
        alreadyCompleted: false,
        estimate: false,
        pending: true,
    });
    const completedRef = useRef(false);

    // Initialize the session store for this lesson; reset on unmount.
    useEffect(() => {
        init(plan);
        completedRef.current = false;
        return () => reset();
    }, [plan, init, reset]);

    // Resolve the next lesson in the track for the "Next lesson" control.
    useEffect(() => {
        let mounted = true;
        loadLessonsByLanguage(activeLesson.language as Language)
            .then((lessons) => {
                if (!mounted) return;
                const ordered = [...lessons].sort((a, b) => a.tier - b.tier);
                const idx = ordered.findIndex((l) => l.id === activeLesson.id);
                setNextId(idx >= 0 && idx + 1 < ordered.length ? ordered[idx + 1].id : null);
            })
            .catch(() => { if (mounted) setNextId(null); });
        return () => { mounted = false; };
    }, [activeLesson.id, activeLesson.language]);

    // On reaching Recap, complete the lesson exactly once.
    useEffect(() => {
        if (activePhase !== 'Recap' || completedRef.current) return;
        completedRef.current = true;

        const user = useUserStore.getState().user;
        const estimate = activeLesson.xpReward || AWARD_XP.lesson;

        if (isLocalUser(user?.id)) {
            setCompletion({ xpAwarded: estimate, alreadyCompleted: false, estimate: true, pending: false });
            return;
        }

        (async () => {
            try {
                const result = await useProgressStore.getState().validateAndComplete('lesson', activeLesson.id, activeLesson.language);
                if (result.success) {
                    const awarded = result.xp_awarded ?? estimate;
                    setCompletion({ xpAwarded: awarded, alreadyCompleted: false, estimate: false, pending: false });
                    addToast('success', `Lesson complete! +${awarded} XP`);
                } else if (result.message === 'Already completed') {
                    setCompletion({ xpAwarded: 0, alreadyCompleted: true, estimate: false, pending: false });
                    addToast('info', 'Lesson already completed.');
                } else {
                    setCompletion({ xpAwarded: estimate, alreadyCompleted: false, estimate: true, pending: false });
                    addToast('error', 'Couldn\'t save progress — your learning is safe, try again.');
                }
            } catch (err) {
                console.error('Lesson completion error:', err);
                setCompletion({ xpAwarded: estimate, alreadyCompleted: false, estimate: true, pending: false });
                addToast('error', 'Couldn\'t save progress — your learning is safe, try again.');
            }
        })();
    }, [activePhase, activeLesson.id, activeLesson.language, activeLesson.xpReward, addToast]);

    const user = useUserStore((s) => s.user);

    return (
        <WizardShell
            lessonTitle={activeLesson.title}
            streak={user?.streakCurrent ?? 0}
            hasNext={!!nextId}
            completion={completion}
            onBack={onComplete}
            onNext={() => nextId && navigate(`/learn/${nextId}`)}
            onAddToReview={() => useLessonStore.getState().dispatch({ t: 'ADD_TO_REVIEW' })}
        />
    );
};

export default LessonExperience;
