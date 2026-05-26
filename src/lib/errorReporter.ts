/**
 * Application error reporter.
 *
 * Best-effort, fire-and-forget delivery of caught application errors to
 * Supabase. Falls back to a console.error and never throws so it can be
 * called from React error boundaries without breaking the boundary itself.
 *
 * Backend: an `error_logs` table populated by the `log_app_error` RPC.
 * If the RPC isn't installed yet, the function logs locally and returns
 * `{ success: false, reason: 'rpc_unavailable' }` so callers can decide.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { logger } from './logger';
import type { Json } from '../types/database.types';

export interface AppErrorReport {
    /** Free-form area tag — `error_boundary`, `pyodide_init`, etc. */
    area: string;
    error: Error;
    /** Optional React component stack from componentDidCatch. */
    componentStack?: string;
    /** Currently signed-in user id, if known. */
    userId?: string;
    /** Anything else useful for triage. Stay clear of PII. */
    extra?: Record<string, unknown>;
}

export interface ErrorReportResult {
    success: boolean;
    reason?: 'not_configured' | 'rpc_unavailable' | 'unexpected';
    detail?: string;
}

const SAFE_EXTRA_BUDGET_BYTES = 8 * 1024;

function trimExtra(value: unknown): Record<string, unknown> {
    try {
        const json = JSON.stringify(value);
        if (json.length <= SAFE_EXTRA_BUDGET_BYTES) {
            return (value && typeof value === 'object' ? (value as Record<string, unknown>) : { value });
        }
        return { _truncated: true, preview: json.slice(0, SAFE_EXTRA_BUDGET_BYTES) };
    } catch {
        return { _serialization_failed: true };
    }
}

export async function reportError(report: AppErrorReport): Promise<ErrorReportResult> {
    // Always emit to the developer console so production debugging from
    // browser devtools still works.
    logger.error(
        `[ErrorReporter] (${report.area})`,
        report.error,
        report.componentStack ? `\nComponent stack:\n${report.componentStack}` : ''
    );

    if (!isSupabaseConfigured()) {
        return { success: false, reason: 'not_configured' };
    }

    try {
        const payload = {
            p_area: report.area,
            p_message: String(report.error?.message ?? report.error),
            p_stack: report.error?.stack ?? null,
            p_component_stack: report.componentStack ?? null,
            p_user_id: report.userId ?? null,
            p_extra: trimExtra({
                ...(report.extra ?? {}),
                href: typeof window !== 'undefined' ? window.location.href : undefined,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            }) as unknown as Json,
        };
        const { error } = await supabase.rpc('log_app_error', payload);
        if (error) {
            // Distinguish "RPC missing" from other DB errors so the deploy
            // checklist surfaces the right next step.
            const code = (error as { code?: string }).code;
            if (code === '42883' || code === 'PGRST202') {
                return { success: false, reason: 'rpc_unavailable', detail: error.message };
            }
            return { success: false, reason: 'unexpected', detail: error.message };
        }
        return { success: true };
    } catch (err) {
        return {
            success: false,
            reason: 'unexpected',
            detail: err instanceof Error ? err.message : String(err),
        };
    }
}
