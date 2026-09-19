/**
 * Durable Object rate limiter — authoritative, strongly consistent.
 *
 * Why a Durable Object: the KV limiter this replaces is eventually
 * consistent and its get+put is not atomic, so N concurrent requests can
 * all read the same count and all pass. A DO gives a single serialized
 * execution context per instance: with one instance per identity, the
 * count across every Worker isolate worldwide is exact, not approximate.
 *
 * A full sliding window costs one storage row per request (expensive and
 * unnecessary here — limits are 10-20/window), so this is a fixed-window
 * counter with an epoch key: cheap, exact at the boundary, and the classic
 * 2x-burst-at-window-edge tradeoff is acceptable for abuse control.
 */

/** Request payload for a check-and-consume operation. */
export interface RateLimitRequest {
    limit: number;
    windowSeconds: number;
}

/** Response payload for a check-and-consume operation. */
export interface RateLimitResponse {
    allowed: boolean;
    remaining: number;
    resetAt: number; // unix seconds
}

interface WindowRow {
    epoch: number;
    count: number;
}

/** Storage key holding the current WindowRow. Single row per DO instance. */
const ROW_KEY = 'window';

export class RateLimiterDurableObject implements DurableObject {
    private readonly state: DurableObjectState;
    /**
     * Mutex: DO input gates serialize I/O-bound events, but concurrent
     * `fetch()` calls are still dispatched as separate events — chaining
     * every request onto one promise guarantees strict FIFO handling so
     * check-and-set is atomic even under burst.
     */
    private chain: Promise<unknown> = Promise.resolve();

    constructor(state: DurableObjectState, _env: unknown, _ctx: ExecutionContext) {
        this.state = state;
    }

    async fetch(request: Request): Promise<Response> {
        // Serialize: each request waits for all previously accepted ones.
        const result = this.chain.then(
            () => this.handle(request),
            () => this.handle(request) // keep the chain alive after a failure
        );
        this.chain = result;
        try {
            return await result;
        } catch (err) {
            // Fail-closed: a broken limiter must not open the floodgates.
            console.error('[rateLimiterDo] internal error:', err);
            const body: RateLimitResponse = { allowed: false, remaining: 0, resetAt: 0 };
            return new Response(JSON.stringify(body), { status: 500 });
        }
    }

    private async handle(request: Request): Promise<Response> {
        const body = (await request.json()) as RateLimitRequest;
        const limit = Math.max(0, Math.floor(Number(body.limit)));
        const windowSeconds = Math.max(1, Math.floor(Number(body.windowSeconds)));

        const now = Math.floor(Date.now() / 1000);
        const windowSec = windowSeconds;
        const epoch = Math.floor(now / windowSec);

        const row = ((await this.state.storage.get<WindowRow>(ROW_KEY)) ?? {
            epoch: -1,
            count: 0,
        }) as WindowRow;

        let allowed: boolean;
        let count: number;
        let resetAt: number;

        if (row.epoch === epoch) {
            count = row.count;
            resetAt = (epoch + 1) * windowSec;
            if (count >= limit) {
                allowed = false;
            } else {
                count += 1;
                allowed = true;
                await this.state.storage.put(ROW_KEY, { epoch, count });
            }
        } else {
            // New window: reset the counter to 1. The row is overwritten in
            // place (never accumulates), so no alarm-based cleanup is needed.
            count = 1;
            resetAt = (epoch + 1) * windowSec;
            allowed = limit >= 1;
            if (allowed) {
                await this.state.storage.put(ROW_KEY, { epoch, count });
            }
        }

        const response: RateLimitResponse = {
            allowed,
            remaining: allowed ? Math.max(0, limit - count) : 0,
            resetAt,
        };
        return new Response(JSON.stringify(response), {
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
