import { useState, useEffect, useCallback } from 'react';
import { initializeSecureCore, dispatchToCore, getCurrentCoreState } from '../lib/coreBridge';

/**
 * Hook for interacting with the High-Assurance Secure Core
 */
export const useSecureCore = () => {
  const [state, setState] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleLock = () => {
      setState((s) => s ? ({ ...s, is_locked: true }) : null);
    };

    window.addEventListener('catcoder:core_locked', handleLock);

    const init = async () => {
      try {
        await initializeSecureCore();
        const currentState = await getCurrentCoreState() as Record<string, unknown>;
        setState(currentState);
      } catch (err) {
        console.error("SecureCore Hook Init Fail:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();

    return () => window.removeEventListener('catcoder:core_locked', handleLock);
  }, []);

  const dispatch = useCallback(async (type: string, payload: Record<string, unknown> = {}) => {
    const newState = await dispatchToCore(type, payload) as Record<string, unknown>;
    setState(newState);

    // Requirement 5.1: Critical logging
    if (newState.is_locked) {
      console.warn("[SecureCore] STATE LOCKED - Security violation or idle timeout.");
    }

    return newState;
  }, []);

  return {
    state,
    isLoading,
    updateXP: (amount: number) => dispatch('UPDATE_XP', { amount }),
    scrubMemory: () => dispatch('SCRUB'),
    checkIdle: () => dispatch('CHECK_IDLE')
  };
};
