import { useEffect, useRef } from 'react';
import { useArenaStore } from '../stores/arena';

interface TurnstileApi {
    render: (
        el: HTMLElement,
        opts: {
            sitekey: string;
            callback: (token: string) => void;
            'error-callback'?: () => void;
            'expired-callback'?: () => void;
            theme?: 'auto' | 'light' | 'dark';
        }
    ) => string;
    reset: (id?: string) => void;
    remove: (id?: string) => void;
}

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

function loadScript(): Promise<void> {
    if (window.turnstile) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[data-turnstile="true"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Turnstile failed to load')), { once: true });
            return;
        }
        const script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = 'true';
        script.addEventListener('load', () => resolve(), { once: true });
        script.addEventListener('error', () => reject(new Error('Turnstile failed to load')), { once: true });
        document.head.appendChild(script);
    });
}

export function Turnstile() {
    const ref = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const setTurnstileToken = useArenaStore((s) => s.setTurnstileToken);
    const nonce = useArenaStore((s) => s.turnstileNonce);

    useEffect(() => {
        let cancelled = false;

        if (!SITE_KEY) {
            // Fail closed in production: without a site key the widget cannot
            // render, so submitting would always 403 at the judge. Only the
            // dev server bypasses.
            if (import.meta.env.DEV) {
                setTurnstileToken('dev');
            } else {
                setTurnstileToken(null);
            }
            return;
        }

        loadScript()
            .then(() => {
                if (cancelled || !ref.current || !window.turnstile) return;
                if (widgetId.current) {
                    window.turnstile.reset(widgetId.current);
                    return;
                }
                widgetId.current = window.turnstile.render(ref.current, {
                    sitekey: SITE_KEY,
                    theme: 'dark',
                    callback: (token) => setTurnstileToken(token),
                    'error-callback': () => setTurnstileToken(null),
                    'expired-callback': () => setTurnstileToken(null),
                });
            })
            .catch(() => setTurnstileToken(null));

        return () => {
            cancelled = true;
        };
    }, [setTurnstileToken, nonce]);

    useEffect(() => {
        return () => {
            if (widgetId.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetId.current);
                } catch {
                    /* widget already gone */
                }
                widgetId.current = null;
            }
        };
    }, []);

    if (!SITE_KEY) {
        if (import.meta.env.DEV) {
            return (
                <p className="cc-eyebrow" style={{ color: 'var(--cc-tx-3)' }}>
                    Verification bypassed in local dev
                </p>
            );
        }
        return (
            <p className="cc-eyebrow" style={{ color: 'var(--cc-tx-3)' }}>
                Human verification is unavailable. Please try again later.
            </p>
        );
    }

    return <div ref={ref} />;
}

export default Turnstile;
