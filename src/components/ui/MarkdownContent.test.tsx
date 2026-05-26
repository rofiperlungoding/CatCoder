/**
 * MarkdownContent — sanitization & rendering tests.
 *
 * We avoid `@testing-library/jest-dom` here because its lodash sub-imports
 * stumble on Node 25 ESM strict resolution; bare `expect` against the
 * underlying DOM nodes is enough for what these tests cover.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import * as React from 'react';
import MarkdownContent from './MarkdownContent';

afterEach(() => cleanup());

describe('MarkdownContent', () => {
    it('renders headings, lists, and bold/italic text', () => {
        render(
            <MarkdownContent
                content={[
                    '# Title',
                    '',
                    'Some **bold** and *italic* text.',
                    '',
                    '- one',
                    '- two',
                ].join('\n')}
            />
        );

        expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeTruthy();
        expect(screen.getByText('bold').tagName).toBe('STRONG');
        expect(screen.getByText('italic').tagName).toBe('EM');
        expect(screen.getAllByRole('listitem').length).toBe(2);
    });

    it('renders fenced code blocks with monospace markup', () => {
        const { container } = render(
            <MarkdownContent
                content={['```python', 'print("hi")', '```'].join('\n')}
            />
        );
        const code = container.querySelector('pre code');
        expect(code).not.toBeNull();
        expect(code?.textContent).toContain('print("hi")');
    });

    it('strips raw <script> tags via rehype-sanitize', () => {
        const { container } = render(
            <MarkdownContent content={'normal text\n\n<script>alert(1)</script>\n\nafter'} />
        );
        expect(container.querySelectorAll('script').length).toBe(0);
        expect(container.textContent).toContain('normal text');
        expect(container.textContent).toContain('after');
    });

    it('strips javascript: URLs from links', () => {
        const { container } = render(
            // eslint-disable-next-line no-script-url -- explicit XSS coverage
            <MarkdownContent content={'[click me](javascript:alert(1))'} />
        );
        const anchor = container.querySelector('a');
        const href = anchor?.getAttribute('href') ?? '';
        expect(href.toLowerCase()).not.toContain('javascript:');
    });

    it('opens external https links in a new tab with rel=noopener', () => {
        const { container } = render(
            <MarkdownContent content={'[example](https://example.com)'} />
        );
        const anchor = container.querySelector('a')!;
        expect(anchor.getAttribute('target')).toBe('_blank');
        const rel = anchor.getAttribute('rel') ?? '';
        expect(rel).toContain('noopener');
        expect(rel).toContain('noreferrer');
    });
});
