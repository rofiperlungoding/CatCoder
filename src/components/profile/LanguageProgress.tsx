import { useEffect, useMemo, useState } from 'react';
import { ProgressBar } from '../ui';
import { loadAllLessons } from '../../data/lessons';
import { problems as allProblems } from '../../data/problems';
import { useProgressStore } from '../../stores';
import type { Language, Lesson } from '../../types';

interface PerLanguage {
    label: string;
    accent: string;
    lessonsTotal: number;
    lessonsDone: number;
    problemsTotal: number;
    problemsDone: number;
}

const LANGUAGES: { id: Language; label: string; accent: string }[] = [
    { id: 'python', label: 'Python', accent: 'text-blue-500 dark:text-blue-400' },
    { id: 'javascript', label: 'JavaScript', accent: 'text-amber-500 dark:text-amber-400' },
    { id: 'cpp', label: 'C++', accent: 'text-pink-500 dark:text-pink-400' },
];

/**
 * Per-language progress dashboard.
 *
 * Reads the lesson catalog (lazy-loaded so the bundle isn't bloated for
 * users who never open Profile) and the problems catalog, intersects with
 * the progress store's `completedLessons` / `completedProblems` sets, and
 * renders a compact card per supported language.
 */
export const LanguageProgress: React.FC = () => {
    const { completedLessons, completedProblems } = useProgressStore();
    const [lessons, setLessons] = useState<Lesson[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        loadAllLessons()
            .then((all) => {
                if (!cancelled) setLessons(all);
            })
            .catch(() => {
                if (!cancelled) setLessons([]);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const data: PerLanguage[] = useMemo(() => {
        if (!lessons) return [];
        return LANGUAGES.map(({ id, label, accent }) => {
            const langLessons = lessons.filter((l) => l.language === id);
            const langProblems = allProblems.filter((p) => p.languages.includes(id));
            return {
                label,
                accent,
                lessonsTotal: langLessons.length,
                lessonsDone: langLessons.filter((l) => completedLessons.has(l.id)).length,
                problemsTotal: langProblems.length,
                problemsDone: langProblems.filter((p) => completedProblems.has(p.id)).length,
            };
        });
    }, [lessons, completedLessons, completedProblems]);

    if (lessons === null) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Loading per-language progress">
                {LANGUAGES.map((l) => (
                    <div
                        key={l.id}
                        className="h-36 rounded-2xl bg-gray-50 dark:bg-muted/30 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((lang) => {
                const totalProgress = lang.lessonsTotal + lang.problemsTotal;
                const done = lang.lessonsDone + lang.problemsDone;
                const pct = totalProgress > 0 ? Math.round((done / totalProgress) * 100) : 0;
                return (
                    <div
                        key={lang.label}
                        className="p-6 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl shadow-sm flex flex-col gap-4"
                    >
                        <div className="flex items-baseline justify-between">
                            <span className={`font-bold text-lg ${lang.accent}`}>{lang.label}</span>
                            <span className="text-xs font-semibold text-muted-foreground">
                                {done} / {totalProgress || '—'}
                            </span>
                        </div>
                        <ProgressBar value={pct} max={100} size="md" className="h-2.5" />
                        <dl className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <dt className="text-muted-foreground">Lessons</dt>
                                <dd className="font-bold text-foreground">
                                    {lang.lessonsDone} / {lang.lessonsTotal}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Problems</dt>
                                <dd className="font-bold text-foreground">
                                    {lang.problemsDone} / {lang.problemsTotal}
                                </dd>
                            </div>
                        </dl>
                    </div>
                );
            })}
        </div>
    );
};

export default LanguageProgress;
