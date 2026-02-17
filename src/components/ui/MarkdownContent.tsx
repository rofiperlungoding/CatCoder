import React from 'react';

// Memoized component for rendering markdown to prevent expensive re-renders on keystrokes
const MarkdownContent = React.memo(({ content }: { content: string }) => (
    <div className="whitespace-pre-line">
        {content.split('```').map((part, i) => {
            if (i % 2 === 1) {
                const lines = part.split('\n');
                const codeContent = lines.slice(1).join('\n');
                return (
                    <div key={i} className="not-prose my-12 rounded-xl overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl">
                        <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                            <div className="flex gap-2 opacity-20">
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            </div>
                            <div className="ml-auto text-xs font-mono text-gray-500">code</div>
                        </div>
                        <div className="p-6 overflow-x-auto">
                            <code className="font-mono text-sm text-gray-300 leading-relaxed block whitespace-pre">{codeContent}</code>
                        </div>
                    </div>
                );
            }
            return (
                <span key={i}>
                    {part.split(/(\*\*.*?\*\*|`[^`]+`)/).map((chunk, j) => {
                        if (chunk.startsWith('**') && chunk.endsWith('**')) {
                            return <strong key={j} className="text-foreground font-black">{chunk.slice(2, -2)}</strong>;
                        }
                        if (chunk.startsWith('`') && chunk.endsWith('`')) {
                            return (
                                <code key={j} className="bg-secondary/50 border border-border px-1.5 py-0.5 rounded-md text-sm font-mono text-primary font-bold mx-0.5">
                                    {chunk.slice(1, -1)}
                                </code>
                            );
                        }
                        return chunk;
                    })}
                </span>
            );
        })}
    </div>
));

export default MarkdownContent;
