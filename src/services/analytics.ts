import reportWebVitals from './reportWebVitals';

type EventParams = Record<string, any>;

class AnalyticsService {
    private static instance: AnalyticsService;
    private initialized: boolean = false;

    private constructor() { }

    public static getInstance(): AnalyticsService {
        if (!AnalyticsService.instance) {
            AnalyticsService.instance = new AnalyticsService();
        }
        return AnalyticsService.instance;
    }

    public init() {
        if (this.initialized) return;

        // Initialize Web Vitals monitoring
        // Only log in development or send to endpoint in production
        const isDev = import.meta.env.DEV;

        reportWebVitals((metric) => {
            if (isDev) {
                console.log('[Web Vitals]', metric);
            } else {
                // TODO: Send to analytics endpoint (e.g., Supabase, GA4)
                // this.sendToBackend(metric);
            }
        });

        this.initialized = true;
        this.logEvent('app_initialized');
    }

    public logPageView(path: string) {
        if (!this.initialized) return;

        const isDev = import.meta.env.DEV;
        if (isDev) {
            console.log(`[Analytics] Page View: ${path}`);
        }

        // TODO: Send to backend
    }

    public logEvent(eventName: string, params?: EventParams) {
        if (!this.initialized) return;

        const isDev = import.meta.env.DEV;
        if (isDev) {
            console.log(`[Analytics] Event: ${eventName}`, params);
        }

        // TODO: Send to backend
    }
}

export const analytics = AnalyticsService.getInstance();
