/**
 * Lightweight in-memory rate limiter for the portfolio AI route.
 *
 * Serverless caveat, documented honestly rather than hidden: each Vercel
 * function instance has its own memory, so this limiter is per-instance,
 * not global. On the traffic a personal portfolio actually gets, that is
 * enough to stop a casual abuse script, a stuck retry loop, or someone
 * hammering "Send" from draining API credits. It resets on cold start and
 * does not coordinate across instances or regions.
 *
 * For a real multi-instance guarantee, swap this for a shared store such
 * as Upstash Redis (`@upstash/ratelimit`), which needs its own env vars
 * (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). Left out here on
 * purpose to keep this portfolio's env footprint at a single key — see
 * the README's "Known limitations" section for why that trade-off is
 * acceptable at this project's scale.
 */

type Bucket = {
  count: number;
  windowStart: number;
};

const WINDOW_MS = 60_000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 8; // generous for a real visitor, tight for a script

const buckets = new Map<string, Bucket>();

/** Drops stale buckets so this Map can't grow unbounded on a long-lived
 * function instance. Called on every check; cheap relative to the model call. */
function pruneStaleBuckets(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > WINDOW_MS * 2) {
      buckets.delete(key);
    }
  }
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  pruneStaleBuckets(now);

  const existing = buckets.get(identifier);

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    buckets.set(identifier, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil(
      (existing.windowStart + WINDOW_MS - now) / 1000
    );
    return { allowed: false, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true };
}

/**
 * Best-effort caller identifier from the standard proxy header Vercel sets
 * (`x-forwarded-for`). Falls back to a constant so local dev doesn't crash —
 * that means local dev shares a single bucket, which is fine for testing
 * but worth knowing if you hit 429s while developing.
 */
export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}