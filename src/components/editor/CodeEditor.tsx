import React from 'react';
import Editor, { type EditorProps, type OnMount } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps extends EditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    language?: string;
    theme?: 'light' | 'vs-dark';
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
    value,
    onChange,
    language = 'javascript',
    theme = 'light',
    ...props
}) => {
    const handleEditorDidMount: OnMount = (editor, monaco) => {
        // Define a custom theme that matches our Slate design if needed
        monaco.editor.defineTheme('slate-light', {
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

        // We could define a 'slate-dark' here too if we implemented dark mode
    };

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white ring-offset-2 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-200">
            <Editor
                height="100%"
                defaultLanguage={language}
                language={language}
                value={value}
                onChange={onChange}
                theme={theme === 'light' ? 'slate-light' : 'vs-dark'}
                onMount={handleEditorDidMount}
                loading={
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50 gap-3">
                        <Loader2 className="animate-spin text-indigo-500" size={24} />
                        <span className="text-xs font-semibold tracking-wide uppercase">Initializing Editor...</span>
                    </div>
                }
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    readOnly: props.readOnly || false,
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
        </div>
    );
};
