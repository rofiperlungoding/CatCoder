export class AICache {
    private static readonly PREFIX = 'ai_cache_';
    private static readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

    static get<T>(key: string): T | null {
        const itemStr = localStorage.getItem(this.PREFIX + key);
        if (!itemStr) return null;

        try {
            const item = JSON.parse(itemStr);
            if (Date.now() > item.expiry) {
                localStorage.removeItem(this.PREFIX + key);
                return null;
            }
            return item.data;
        } catch (e) {
            console.error('Cache parsing error', e);
            return null;
        }
    }

    static set<T>(key: string, data: T): void {
        const item = {
            data,
            expiry: Date.now() + this.TTL_MS,
        };
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(item));
        } catch (e) {
            console.warn('Cache storage full or error', e);
            // Optional: Clear old cache if storage full
            this.clearExpired();
        }
    }

    static clear(key?: string): void {
        if (key) {
            localStorage.removeItem(this.PREFIX + key);
        } else {
            Object.keys(localStorage).forEach((k) => {
                if (k.startsWith(this.PREFIX)) {
                    localStorage.removeItem(k);
                }
            });
        }
    }

    static clearExpired(): void {
        Object.keys(localStorage).forEach((k) => {
            if (k.startsWith(this.PREFIX)) {
                const itemStr = localStorage.getItem(k);
                if (itemStr) {
                    try {
                        const item = JSON.parse(itemStr);
                        if (Date.now() > item.expiry) {
                            localStorage.removeItem(k);
                        }
                    } catch {
                        localStorage.removeItem(k);
                    }
                }
            }
        });
    }

    static getStats(): { size: number; keys: string[] } {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith(this.PREFIX));
        return {
            size: keys.length,
            keys,
        };
    }
}
