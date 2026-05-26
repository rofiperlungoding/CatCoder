import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
    content: string;
}

/**
 * Sanitization schema for lesson content.
 *
 * Built on rehype-sanitize's default GitHub-flavoured schema. We deliberately
 * do NOT permit raw HTML in lesson sources — anything outside markdown
 * primitives gets stripped — and we keep the schema strict enough that even
 * a typo'd `<script>` from a lesson author can't slip through.
 */
const SAFE_SCHEMA = {
    ...defaultSchema,
    // Keep the standard markdown surface, plus class attributes for syntax
    // highlighting hooks (added by remark/rehype plugins, never user input).
    attributes: {
        ...defaultSchema.attributes,
        code: [...((defaultSchema.attributes && defaultSchema.attributes.code) ?? []), ['className']],
        span: [...((defaultSchema.attributes && defaultSchema.attributes.span) ?? []), ['className']],
        a: [
            ...((defaultSchema.attributes && defaultSchema.attributes.a) ?? []),
            ['target'],
            ['rel'],
        ],
    },
};

const components: React.ComponentProps<typeof ReactMarkdown>['components'] = {
    h1: (props) => <h1 className="text-3xl font-extrabold mt-8 mb-4 text-foreground" {...props} />,
    h2: (props) => <h2 className="text-2xl font-bold mt-7 mb-3 text-foreground" {...props} />,
    h3: (props) => <h3 className="text-xl font-bold mt-6 mb-2 text-foreground" {...props} />,
    p: (props) => <p className="mb-4 leading-relaxed text-muted-foreground" {...props} />,
    ul: (props) => (
        <ul className="list-disc list-outside pl-6 mb-4 space-y-1.5 text-muted-foreground" {...props} />
    ),
    ol: (props) => (
        <ol className="list-decimal list-outside pl-6 mb-4 space-y-1.5 text-muted-foreground" {...props} />
    ),
    li: (props) => <li className="leading-relaxed" {...props} />,
    blockquote: (props) => (
        <blockquote className="border-l-4 border-accent/40 pl-4 italic text-muted-foreground my-4" {...props} />
    ),
    a: ({ href, children, ...props }) => {
        const isExternal = !!href && /^https?:\/\//i.test(href);
        return (
            <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                // Always block referrer/window-opener leaks for external links.
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors"
                {...props}
            >
                {children}
            </a>
        );
    },
    strong: (props) => <strong className="text-foreground font-bold" {...props} />,
    em: (props) => <em className="italic" {...props} />,
    code: ({ className, children, ...props }) => {
        // ReactMarkdown sets className=`language-xxx` only on code-block <code>;
        // inline <code> has no className. We render them differently.
        const isInline = !className;
        if (isInline) {
            return (
                <code
                    className="bg-secondary/50 border border-border px-1.5 py-0.5 rounded-md text-sm font-mono text-primary font-semibold mx-0.5"
                    {...props}
                >
                    {children}
                </code>
            );
        }
        return (
            <code
                className={`font-mono text-sm text-gray-300 leading-relaxed block whitespace-pre ${className}`}
                {...props}
            >
                {children}
            </code>
        );
    },
    pre: ({ children, ...props }) => (
        <div className="not-prose my-8 rounded-xl overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                <div className="flex gap-2 opacity-20">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
                <div className="ml-auto text-xs font-mono text-gray-500">code</div>
            </div>
            <pre className="p-6 overflow-x-auto m-0" {...props}>
                {children}
            </pre>
        </div>
    ),
    hr: (props) => <hr className="my-8 border-border/60" {...props} />,
    table: (props) => (
        <div className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm" {...props} />
        </div>
    ),
    th: (props) => (
        <th className="text-left font-semibold border-b-2 border-border py-2 px-3" {...props} />
    ),
    td: (props) => <td className="border-b border-border/60 py-2 px-3" {...props} />,
};

/**
 * Renders sanitized GitHub-flavoured markdown.
 *
 * Migrated from a hand-rolled regex parser that only handled fenced blocks
 * and inline `**bold**` / `` `code` ``.  Now supports headings, lists,
 * tables, links, blockquotes, and the rest of the GFM surface, while
 * `rehype-sanitize` enforces the allowlist so authored content can't smuggle
 * in `<script>` or `javascript:` URLs.
 */
const MarkdownContentImpl: React.FC<MarkdownContentProps> = ({ content }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, SAFE_SCHEMA]]}
        components={components}
    >
        {content}
    </ReactMarkdown>
);

const MarkdownContent = React.memo(MarkdownContentImpl);
MarkdownContent.displayName = 'MarkdownContent';

export default MarkdownContent;
