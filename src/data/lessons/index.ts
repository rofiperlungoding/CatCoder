import type { Lesson } from '../../types';

/**
 * Lazy lesson registry.
 *
 * Each language module is imported on demand so the lesson catalog is split
 * into per-language chunks (Vite warned about this when both static and
 * dynamic imports of the same modules existed in this file).
 *
 * For consumers that previously relied on a synchronous `lessons` array, use
 * `loadAllLessons()` instead.
 */

type LessonLoader = () => Promise<Lesson[]>;

const loaders: Record<'python' | 'javascript' | 'cpp', LessonLoader> = {
    python: () => import('./python').then(m => m.pythonLessons),
    javascript: () => import('./javascript').then(m => m.javascriptLessons),
    cpp: () => import('./cpp').then(m => m.cppLessons),
};

const cache = new Map<string, Lesson[]>();

export const loadLessonsByLanguage = async (language: string): Promise<Lesson[]> => {
    const key = language as keyof typeof loaders;
    const loader = loaders[key];
    if (!loader) return [];

    const cached = cache.get(key);
    if (cached) return cached;

    const lessons = await loader();
    cache.set(key, lessons);
    return lessons;
};

export const loadAllLessons = async (): Promise<Lesson[]> => {
    const [py, js, cpp] = await Promise.all([
        loadLessonsByLanguage('python'),
        loadLessonsByLanguage('javascript'),
        loadLessonsByLanguage('cpp'),
    ]);
    return [...py, ...js, ...cpp];
};

export const loadLessonById = async (id: string): Promise<Lesson | undefined> => {
    const all = await loadAllLessons();
    return all.find(l => l.id === id);
};

export const loadLessonCount = async () => {
    const [py, js, cpp] = await Promise.all([
        loadLessonsByLanguage('python'),
        loadLessonsByLanguage('javascript'),
        loadLessonsByLanguage('cpp'),
    ]);
    return {
        python: py.length,
        javascript: js.length,
        cpp: cpp.length,
        total: py.length + js.length + cpp.length,
    };
};
