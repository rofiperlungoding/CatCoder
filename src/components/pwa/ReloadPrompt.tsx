import { useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useUIStore } from '../../stores';

export const ReloadPrompt = () => {
    const { addToast } = useUIStore();

    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error: unknown) {
            console.log('SW registration error', error);
        },
    });

    const close = useCallback(() => {
        setOfflineReady(false);
        setNeedRefresh(false);
    }, [setOfflineReady, setNeedRefresh]);

    useEffect(() => {
        if (offlineReady) {
            addToast('success', 'App ready to work offline');
            close();
        }
    }, [offlineReady, addToast, close]);

    useEffect(() => {
        if (needRefresh) {
            addToast('info', 'New content available, click to update');
            // In a real app, we might show a toast with a "Reload" button.
            // For now, we'll just automatically prompt the user if they want to update.
            if (window.confirm('New content available, click OK to reload.')) {
                updateServiceWorker(true);
            }
            close();
        }
    }, [needRefresh, updateServiceWorker, addToast, close]);

    return null;
};
