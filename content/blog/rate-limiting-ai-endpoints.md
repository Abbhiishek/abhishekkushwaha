---
title: "Rate Limiting AI Endpoints in a Multi-Tenant SaaS: Sliding Windows, Redis, and Cost Protection"
description: "How we built tenant-aware rate limiting at HyrecruitAI to protect LLM API costs, prevent abuse, and keep p99 latency under control — with Redis sliding windows and per-tier quotas."
date: "2026-04-04"
tags: rate-limiting, redis, saas, ai, infrastructure, typescript
coverImage: /thumbnail.jpg
featured: false
---

Before we had rate limiting, a single misbehaving tenant could burn through $200 of OpenAI credits in an afternoon. We found out on a Tuesday when our monthly AI spend notification fired on day 8. That week we built what became one of the most consequential infrastructure pieces we have — tenant-aware rate limiting across every LLM endpoint.

This post covers the architecture, the Redis sliding-window implementation, and the edge cases that bit us.

## The Problem

HyrecruitAI runs AI interviews. Each session involves multiple LLM calls — question generation, follow-up probing, answer evaluation, and feedback synthesis. A single completed interview session makes roughly 12–18 LLM calls depending on depth.

At steady state, that's fine. But we had three failure modes we hadn't protected against:

1. **Bulk candidate imports** — recruiters uploading 500 candidates and triggering simultaneous evaluation pipelines
2. **Retry storms** — client-side retries on slow responses hammering the endpoint in parallel
3. **Quota exhaustion by one tenant affecting others** — shared API keys, shared throttle headroom

Our observability showed that 3% of tenants were responsible for 61% of LLM API calls during business hours. Two were on the same plan as tenants running 10x fewer calls.

We needed per-tenant limits that reflected what each plan paid for, enforced at the API layer before the call ever hit OpenAI.

## Designing the Limit Model

The first decision was granularity. Options:

- **Requests per minute (RPM)** — simple, maps to OpenAI's own limits
- **Tokens per minute (TPM)** — accurate but requires knowing token count before the call
- **Requests per day per tenant** — coarse, allows burst abuse
- **Sliding window RPM per tenant per endpoint** — what we chose

We went with sliding window RPM because:
- Our LLM calls have variable token counts (evaluations are ~1200 tokens, question generation ~400)
- RPM gives us a predictable request shape for capacity planning
- Sliding window avoids the "reset spike" problem of fixed windows

Plan tiers and limits:

```typescript
// packages/config/src/rate-limits.ts
export const RATE_LIMIT_TIERS = {
  starter:      { rpm: 20,  dailyCap: 500  },
  growth:       { rpm: 60,  dailyCap: 2000 },
  professional: { rpm: 150, dailyCap: 8000 },
  enterprise:   { rpm: 400, dailyCap: 30000 },
} as const;

export type RateLimitTier = keyof typeof RATE_LIMIT_TIERS;

export interface RateLimitConfig {
  rpm: number;
  dailyCap: number;
}
```

## The Redis Sliding Window Implementation

A fixed window counter is easy but leaks traffic at boundaries. A sliding window gives accurate enforcement at any point in time.

We use a Redis sorted set — one per tenant per endpoint. Each request adds an entry with the current timestamp as both score and value. Removing entries older than the window and counting remaining entries gives the current rate.

```typescript
// packages/rate-limit/src/sliding-window.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms when oldest entry expires
  retryAfter?: number; // ms until next slot opens
}

export async function checkRateLimit(
  tenantId: string,
  endpoint: string,
  limitConfig: { rpm: number }
): Promise<RateLimitResult> {
  const key = `rl:${tenantId}:${endpoint}`;
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const windowStart = now - windowMs;

  const pipeline = redis.pipeline();

  // Remove entries outside the window
  pipeline.zremrangebyscore(key, "-inf", windowStart);

  // Count current entries in window
  pipeline.zcard(key);

  // Add current request (score = timestamp, member = unique id)
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });

  // Set TTL so keys don't accumulate forever
  pipeline.expire(key, 120);

  const results = await pipeline.exec();
  const currentCount = (results[1] as number) ?? 0;

  if (currentCount >= limitConfig.rpm) {
    // Find the oldest entry to calculate retry-after
    const oldest = await redis.zrange(key, 0, 0, { withScores: true });
    const oldestScore = oldest[0]?.score ?? now;
    const retryAfter = oldestScore + windowMs - now;

    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestScore + windowMs,
      retryAfter: Math.max(0, retryAfter),
    };
  }

  return {
    allowed: true,
    remaining: limitConfig.rpm - currentCount - 1,
    resetAt: now + windowMs,
  };
}
```

One gotcha: `zadd` executes even when the request is denied. We added the entry before checking the count, which inflated the window. We fixed this by checking count before adding:

```typescript
// Corrected: check first, then add only if allowed
pipeline.zremrangebyscore(key, "-inf", windowStart);
pipeline.zcard(key);
// Do NOT add yet — exec first, check count, then add in second pipeline
```

This required two round-trips but eliminated phantom entries from rejected requests.

## Middleware Integration

We wrapped the rate limiter as Next.js middleware so it runs at the edge before any serverless function warms up.

```typescript
// apps/platform/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest } from "@hyrecruitai/auth";
import { getRateLimitConfig } from "@hyrecruitai/rate-limit";
import { checkRateLimit } from "@hyrecruitai/rate-limit/sliding-window";

const AI_ROUTES = [
  "/api/ai/evaluate",
  "/api/ai/generate-questions",
  "/api/ai/feedback",
  "/api/ai/probe",
];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (!AI_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const tenant = await getTenantFromRequest(req);
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getRateLimitConfig(tenant.id, tenant.plan);
  const result = await checkRateLimit(tenant.id, pathname, config);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "rate_limit_exceeded",
        retryAfter: result.retryAfter,
        resetAt: result.resetAt,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(config.rpm),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetAt),
          "Retry-After": String(Math.ceil((result.retryAfter ?? 0) / 1000)),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(config.rpm));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(result.resetAt));

  return response;
}

export const config = {
  matcher: ["/api/ai/:path*"],
};
```

## Daily Cap Enforcement

Per-minute limits stop bursts. Per-day caps protect against sustained overuse across hours. These are simpler — a Redis counter with a TTL aligned to midnight UTC.

```typescript
// packages/rate-limit/src/daily-cap.ts
export async function checkDailyCap(
  tenantId: string,
  dailyLimit: number
): Promise<{ allowed: boolean; used: number; remaining: number }> {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  const ttlSeconds = Math.floor((midnight.getTime() - now.getTime()) / 1000);

  const key = `daily:${tenantId}:${now.toISOString().slice(0, 10)}`;

  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, ttlSeconds, "NX"); // only set TTL on first creation

  const [used] = (await pipeline.exec()) as [number, unknown];

  if (used > dailyLimit) {
    return { allowed: false, used, remaining: 0 };
  }

  return { allowed: true, used, remaining: dailyLimit - used };
}
```

We run this check before the sliding-window check in middleware. Daily exhaustion returns a different error code (`daily_quota_exceeded`) so clients can display an appropriate message rather than a generic throttle warning.

## What Failed First

**Attempt 1: In-memory rate limiter** — we started with a simple Map-based counter in the API route handler. This collapsed immediately because Next.js serverless functions have no shared memory across invocations. Every cold start got a fresh counter.

**Attempt 2: Single Redis key with INCR/EXPIRE** — fixed-window counter with a 60-second TTL. Worked until we noticed that all tenants' windows reset simultaneously at the same second, causing a synchronized surge at every minute boundary. p99 latency spiked 400ms every 60 seconds.

**Attempt 3: Sliding window but with `ZADD NX`** — we tried using `NX` to avoid adding duplicate members. This silently dropped entries when a request ID collided, undercounting traffic. Switched to random suffixes in member names.

The sliding window with the corrected two-phase pipeline is what runs in production.

## Architecture / Flow Diagram

```
Tenant Browser/Client
        │
        ▼
  Next.js Edge Middleware
        │
   ┌────┴──────────────────────────┐
   │  1. Extract tenant from JWT   │
   │  2. Fetch plan tier from KV   │
   │  3. Check daily cap (Redis)   │
   │  4. Check RPM window (Redis)  │
   └────┬──────────────────────────┘
        │
   ─────┼──── DENIED? ─────────────────────► 429 + Retry-After header
        │
        ▼
  /api/ai/* Serverless Function
        │
        ├──► OpenAI API (gpt-4o)
        │
        └──► Response + Rate-Limit headers

Redis (Upstash Global):
  rl:{tenantId}:{endpoint}  →  Sorted Set (sliding window)
  daily:{tenantId}:{date}   →  String counter (daily cap)
  tenant:{tenantId}:plan    →  Hash (plan config cache, 5min TTL)
```

Plan config is cached in Redis at 5-minute TTL so we don't hit Postgres on every request to look up the tenant's current plan.

## Learnings & Outcomes

After 6 weeks in production:

- **AI spend down 34%** — primarily from stopping retry storms and bulk evaluation abuse
- **p99 latency on `/api/ai/evaluate` down from 2.1s to 1.4s** — fewer concurrent calls to OpenAI means better queue position
- **Zero downtime incidents related to OpenAI quota exhaustion** since rollout (previously 2 per month)
- **Redis overhead per request: ~3ms** — Upstash global with edge middleware keeps this negligible

The daily cap caught one tenant running an automated scraper that was generating synthetic candidate profiles. We flagged the account within 12 hours because the usage pattern (flat 24/7 traffic at exactly 95% of daily cap) was obvious in our dashboards.

## Suggestions for Engineers Building This

**Use sorted sets, not counters, for sliding windows.** The INCR approach is simpler but the boundary spike is real and will show up in your p99.

**Cache plan config at the rate limiter, not just in app memory.** If your plan tier lookup goes to Postgres on every request, your rate limiter becomes the thing that takes down your database under load.

**Return `Retry-After` in seconds, not milliseconds.** The HTTP spec uses seconds. Some clients parse this header automatically — if you return ms, they'll wait 1000x longer than intended.

**Differentiate RPM and daily cap errors on the client.** RPM exhaustion recovers in under 60 seconds. Daily cap exhaustion means the user needs to upgrade or wait until tomorrow. Showing the same error message for both destroys UX and floods support.

**Test with concurrent requests, not sequential ones.** A rate limiter that passes sequential tests and fails under concurrent load is worse than useless — it gives you false confidence. Use `Promise.all` in your tests to simulate real bursts.

```typescript
// Test: 25 concurrent requests against a limit of 20
const requests = Array.from({ length: 25 }, (_, i) =>
  checkRateLimit("tenant-test", "/api/ai/evaluate", { rpm: 20 })
);
const results = await Promise.all(requests);
const denied = results.filter((r) => !r.allowed);
expect(denied.length).toBe(5);
```

Rate limiting is one of those things you don't notice when it works and lose sleep over when it doesn't. Build it early — before your first enterprise customer, not after.
