import { useEffect } from 'react';
// @ts-ignore - virtual module
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useUIStore } from '../../stores';

export const ReloadPrompt = () => {
    const { addToast } = useUIStore();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: any) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error: any) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    useEffect(() => {
        if (offlineReady) {
            addToast('success', 'App ready to work offline');
            close();
        }
    }, [offlineReady, addToast]);

    useEffect(() => {
        if (needRefresh) {
            // In a real app, show a toast with an action button
            // For now, simpler approach or integrating with existing toast system if it supports actions
            // We'll use a direct confirm for simplicity as adding actions to toast requires store refactor
            if (window.confirm('New content available, click OK to reload.')) {
                updateServiceWorker(true);
            }
            close();
        }
    }, [needRefresh, updateServiceWorker]);

    return null;
}
