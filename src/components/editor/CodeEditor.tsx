import React, { lazy, Suspense } from 'react';
import type { EditorProps, OnMount, BeforeMount } from '@monaco-editor/react';
// import { Loader2 } from 'lucide-react'; // Removed unused import
import { LoadingSpinner } from '../ui';
import { useThemeStore } from '../../stores';

// Lazy load Monaco Editor (~400KB savings)
const Editor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })));

interface CodeEditorProps extends EditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    language?: string;
    readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
    value,
    onChange,
    language = 'javascript',
    readOnly = false,
    ...props
}) => {
    const { theme } = useThemeStore();

    const handleBeforeMount: BeforeMount = React.useCallback((monaco) => {
        // Define Custom Dark Theme (WCAG AA Compliant High Contrast)
        monaco.editor.defineTheme('catcoder-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '9ca3af', fontStyle: 'italic' }, // Gray-400
                { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' }, // Purple-400
                { token: 'string', foreground: '4ade80' }, // Green-400
                { token: 'number', foreground: 'fb923c' }, // Orange-400
                { token: 'regexp', foreground: 'f472b6' }, // Pink-400
                { token: 'type', foreground: '60a5fa' }, // Blue-400
                { token: 'class', foreground: '60a5fa' }, // Blue-400
                { token: 'function', foreground: 'facc15' }, // Yellow-400
                { token: 'variable', foreground: 'e5e7eb' }, // Gray-200
                { token: 'operator', foreground: 'e5e7eb' },
            ],
            colors: {
                'editor.background': '#09090b', // Zinc-950 (Rich Black)
                'editor.foreground': '#f3f4f6', // Gray-100
                'editor.lineHighlightBackground': '#18181b', // Zinc-900
                'editorCursor.foreground': '#84cc16', // Lime-500
                'editor.selectionBackground': '#27272a', // Zinc-800
                'editor.inactiveSelectionBackground': '#27272a',
                'editorIndentGuide.background': '#27272a',
                'editorIndentGuide.activeBackground': '#3f3f46',
                'editorLineNumber.foreground': '#52525b', // Zinc-600
                'editorLineNumber.activeForeground': '#e4e4e7', // Zinc-200
            }
        });

        // Define Custom Light Theme (Clean Slate)
        monaco.editor.defineTheme('catcoder-light', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#ffffff',
                'editor.lineHighlightBackground': '#f8fafc',
                'editorCursor.foreground': '#0f172a',
                'editor.selectionBackground': '#e2e8f0',
                'editor.inactiveSelectionBackground': '#f1f5f9',
            }
        });
    }, []);

    const handleEditorDidMount: OnMount = React.useCallback((_editor) => {
        // Force layout update after mount
        setTimeout(() => {
            _editor.layout();
        }, 100);
    }, []);

    const editorFallback = (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50 dark:bg-zinc-950 gap-3">
            <LoadingSpinner className="text-lime-500" size={24} />
            <span className="text-xs font-semibold tracking-wide uppercase dark:text-zinc-500">Loading Editor...</span>
        </div>
    );

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-lime-500/30 shadow-sm bg-white dark:bg-gray-950 transition-all duration-200">
            <Suspense fallback={editorFallback}>
                <Editor
                    height="100%"
                    defaultLanguage={language}
                    language={language}
                    value={value}
                    onChange={onChange}
                    theme={theme === 'dark' ? 'catcoder-dark' : 'catcoder-light'}
                    beforeMount={handleBeforeMount}
                    onMount={handleEditorDidMount}
                    loading={editorFallback}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: true,
                        scrollBeyondLastLine: false,
                        readOnly: readOnly,
                        automaticLayout: true,
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        fontLigatures: true,
                        padding: { top: 20, bottom: 20 },
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                        contextmenu: true,
                        ...props.options
                    }}
                    {...props}
                />
            </Suspense>
        </div>
    );
};
