import React from 'react';
import Editor, { type EditorProps } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps extends EditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    language?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
    value,
    onChange,
    language = 'javascript',
    ...props
}) => {
    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
            <Editor
                height="100%"
                defaultLanguage={language}
                language={language}
                value={value}
                onChange={onChange}
                theme="light"
                loading={
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                        <Loader2 className="animate-spin" />
                        <span className="text-xs font-medium">Loading Editor...</span>
                    </div>
                }
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    automaticLayout: true,
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    padding: { top: 16, bottom: 16 },
                    ...props.options
                }}
                {...props}
            />
        </div>
    );
};
