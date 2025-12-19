import type { Lesson } from '../../types';
import { pythonLessons } from './python';
import { javascriptLessons } from './javascript';
import { cppLessons } from './cpp';

export const lessons: Lesson[] = [
    ...pythonLessons,
    ...javascriptLessons,
    ...cppLessons
];

// Helper functions
export const getLessonsByLanguage = (language: string) => lessons.filter(l => l.language === language);
export const getLessonById = (id: string) => lessons.find(l => l.id === id);
export const getLessonsByTier = (tier: number) => lessons.filter(l => l.tier === tier);
export const getLessonCount = () => ({
    python: pythonLessons.length,
    javascript: javascriptLessons.length,
    cpp: cppLessons.length,
    total: lessons.length
});
