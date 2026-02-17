import type { Lesson } from '../../types';
import { pythonLessons } from './python';
import { javascriptLessons } from './javascript';
import { cppLessons } from './cpp';

// Static export (Maintains backward compatibility, but bundles everything)
export const lessons: Lesson[] = [
    ...pythonLessons,
    ...javascriptLessons,
    ...cppLessons
];

// Async loaders for Code Splitting
export const loadLessonsByLanguage = async (language: string): Promise<Lesson[]> => {
    switch (language) {
        case 'python':
            const py = await import('./python');
            return py.pythonLessons;
        case 'javascript':
            const js = await import('./javascript');
            return js.javascriptLessons;
        case 'cpp':
            const cpp = await import('./cpp');
            return cpp.cppLessons;
        default:
            return [];
    }
};

export const loadLessonById = async (id: string): Promise<Lesson | undefined> => {
    // This is inefficient if we don't know the language, but good for direct linking if we knew the language.
    // For now, we unfortunately have to search all if ID doesn't contain language info.
    // Assuming we can't easily split by ID alone without an index.
    // Let's rely on the static index for global search or build a lightweight index.
    return lessons.find(l => l.id === id);
};

// Helper functions (Synchronous)
export const getLessonsByLanguage = (language: string) => lessons.filter(l => l.language === language);
export const getLessonById = (id: string) => lessons.find(l => l.id === id);
export const getLessonsByTier = (tier: number) => lessons.filter(l => l.tier === tier);
export const getLessonCount = () => ({
    python: pythonLessons.length,
    javascript: javascriptLessons.length,
    cpp: cppLessons.length,
    total: lessons.length
});
