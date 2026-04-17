---
title: "Streaming LLM Responses in Production: SSE, Backpressure, and Per-Tenant Token Budgets in Next.js"
description: "How we built real-time AI feedback streaming for HyrecruitAI interviews — handling SSE reconnection, backpressure, and per-tenant cost attribution."
date: "2026-04-17"
tags: llm, streaming, sse, nextjs, typescript
coverImage: /thumbnail.jpg
featured: false
---

Candidates in an AI-powered interview don't want to stare at a spinner for eight seconds. They want to see the model think — token by token, like a conversation. We knew this from day one, but getting streaming right in production is a different beast from the OpenAI quickstart demo. Here's what we learned building real-time LLM streaming for HyrecruitAI, including how we handle backpressure, reconnects, and per-tenant token budgets without leaking costs or state across tenants.

## The Problem

Our first pass at interview feedback used standard request-response: fire a prompt, wait, return the full JSON blob. Average latency: **7.2 seconds**. Candidate NPS on that UX was measurably worse than competitors, even when the feedback quality was better. Users couldn't tell the AI was working — they just saw a frozen screen and assumed the platform was broken.

Three specific failure modes drove us to streaming:

1. **Perceived latency killed engagement.** 7s wait on a feedback page → 23% drop-off before reading.
2. **Long completions hit Vercel's 10s serverless timeout** on complex technical questions where the model generated detailed code corrections.
3. **Cost attribution was impossible.** We billed tenants by tokens, but batch responses gave us no visibility into per-stream usage until the bill landed.

Switching to streaming solved the UX issue and surfaced the infrastructure problems we hadn't designed for.

## The Solution

We stream responses using the [Vercel AI SDK](https://sdk.vercel.ai/docs) on top of Next.js Route Handlers with `ReadableStream`. The core of it looks deceptively simple:

```typescript
// app/api/interview/feedback/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { openai } from '@/lib/openai';
import { getTenantContext } from '@/lib/tenant';
import { checkTokenBudget, recordTokenUsage } from '@/lib/billing';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  const { questionId, transcript, tenantId } = await req.json();
  
  const tenant = await getTenantContext(tenantId);
  const budget = await checkTokenBudget(tenant);
  
  if (budget.remaining < 500) {
    return new Response(
      JSON.stringify({ error: 'monthly_token_budget_exceeded' }),
      { status: 429 }
    );
  }

  const systemPrompt = await loadPrompt('interview-feedback', tenant.planTier);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    max_tokens: Math.min(budget.remaining, 1200),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildFeedbackPrompt(transcript) },
    ],
  });

  const stream = OpenAIStream(response, {
    onCompletion: async (completion) => {
      const tokenCount = estimateTokens(completion);
      await recordTokenUsage(tenantId, questionId, tokenCount);
    },
  });

  return new StreamingTextResponse(stream);
}
```

The `onCompletion` callback is the key piece. It fires once the stream closes — successfully or not — letting us record actual token usage server-side before the response is fully consumed by the client. This replaced our previous approach of estimating from the input prompt length, which was off by up to 40% for long technical completions.

## The Iteration

### First failure: SSE reconnects duplicating tokens

The first production issue hit within a week. When a candidate's network dropped mid-stream, the browser auto-reconnected via SSE's built-in retry mechanism. The Route Handler had no idea the previous stream was mid-flight — it started a new completion from scratch and charged the tenant for two full responses.

The fix was a stream ID + Redis idempotency layer:

```typescript
// lib/stream-session.ts
import { redis } from '@/lib/redis';

const STREAM_TTL_SECONDS = 300;

export async function getOrCreateStreamSession(
  streamId: string,
  tenantId: string
): Promise<{ cached: boolean; buffer: string | null }> {
  const key = `stream:${tenantId}:${streamId}`;
  const existing = await redis.get(key);

  if (existing) {
    return { cached: true, buffer: existing as string };
  }

  // Reserve the slot before starting completion
  await redis.setex(key, STREAM_TTL_SECONDS, '');
  return { cached: false, buffer: null };
}

export async function appendStreamChunk(
  streamId: string,
  tenantId: string,
  chunk: string
): Promise<void> {
  const key = `stream:${tenantId}:${streamId}`;
  await redis.append(key, chunk);
  await redis.expire(key, STREAM_TTL_SECONDS);
}
```

On reconnect, the client sends the same `streamId`. If Redis has content for it, we replay the buffered chunks first and then continue from where we left off — or serve the full cached response if the stream already completed. We only call OpenAI once per `streamId`.

### Second failure: backpressure under load

Edge functions have no native backpressure. When 40 concurrent streams hit during a batch interview session (a hiring drive for one enterprise customer), the Route Handler was creating 40 simultaneous OpenAI connections. OpenAI's rate limiter responded with 429s, the streams failed silently, and candidates saw partial feedback cut off mid-sentence.

We wired in a concurrency limiter using a lightweight semaphore backed by Redis atomic operations:

```typescript
// lib/stream-concurrency.ts
import { redis } from '@/lib/redis';

const GLOBAL_CONCURRENCY_LIMIT = 25;
const PER_TENANT_LIMIT = 5;

export async function acquireStreamSlot(tenantId: string): Promise<boolean> {
  const globalKey = 'stream:global:active';
  const tenantKey = `stream:tenant:${tenantId}:active`;

  const [global, perTenant] = await redis.mget(globalKey, tenantKey);

  const globalCount = parseInt(global ?? '0', 10);
  const tenantCount = parseInt(perTenant ?? '0', 10);

  if (globalCount >= GLOBAL_CONCURRENCY_LIMIT) return false;
  if (tenantCount >= PER_TENANT_LIMIT) return false;

  // Atomic increment — if another request raced us, we'll exceed limit by 1
  // Acceptable for soft limits; use Lua script for hard limits
  await redis.incr(globalKey);
  await redis.incr(tenantKey);
  await redis.expire(globalKey, 120);
  await redis.expire(tenantKey, 120);

  return true;
}

export async function releaseStreamSlot(tenantId: string): Promise<void> {
  await redis.decr('stream:global:active');
  await redis.decr(`stream:tenant:${tenantId}:active`);
}
```

The route handler wraps the entire completion in acquire/release:

```typescript
const acquired = await acquireStreamSlot(tenantId);
if (!acquired) {
  return new Response(
    JSON.stringify({ error: 'too_many_concurrent_streams', retryAfter: 5 }),
    { status: 503, headers: { 'Retry-After': '5' } }
  );
}

try {
  // ... streaming logic
} finally {
  await releaseStreamSlot(tenantId);
}
```

Clients respect the `Retry-After` header and back off for 5 seconds before re-attempting. Under the batch load that triggered the original failures, this brought OpenAI 429s from 18% of requests to under 0.3%.

## Architecture / Flow Diagram

```
[Candidate Browser]
     |
     | POST /api/interview/feedback (streamId, tenantId, transcript)
     v
[Next.js Edge Route Handler]
     |
     |--- [Redis] Check idempotency key (streamId:tenantId)
     |         |-- cached? → replay buffered chunks → done
     |         |-- new?   → reserve key, continue
     |
     |--- [Redis] Acquire stream slot (global + per-tenant counter)
     |         |-- slots full? → 503 + Retry-After
     |
     |--- [Billing Service] Check token budget for tenant
     |         |-- budget exhausted? → 429
     |
     |--- [OpenAI API] chat.completions.create({ stream: true })
     |
     |--- ReadableStream pipeline
     |         |-- each chunk → append to Redis buffer (stream session)
     |         |-- each chunk → SSE event to browser
     |         |-- on close  → recordTokenUsage(tenantId, count)
     |                       → releaseStreamSlot(tenantId)
     v
[Candidate Browser] renders tokens as they arrive
```

Key invariants:
- One OpenAI call per `streamId`, regardless of reconnects
- Slot is always released in `finally` block — stream abort, timeout, or success
- Token usage is recorded from actual completion text, not estimated

## Learnings & Outcomes

After rolling this out over 3 weeks:

| Metric | Before | After |
|---|---|---|
| Perceived response time (P50) | 7.2s | 0.8s (first token) |
| Candidate drop-off before reading feedback | 23% | 6% |
| Serverless timeout errors | ~4% of long completions | 0% |
| Token billing accuracy | ±40% estimate | ±2% actual |
| OpenAI 429 errors under batch load | 18% | <0.3% |

The drop-off reduction alone justified the engineering investment. The billing accuracy improvement was a bonus that also helped us price the platform more aggressively — we stopped over-provisioning token budgets to cover estimation error.

One number that surprised us: **the Redis buffer for reconnects added only 3ms to median stream latency**. We expected more overhead. The per-tenant concurrency limiter added roughly 1.2ms per request — entirely acceptable.

## Suggestions

**1. Always use edge runtime for streaming routes.** Node.js serverless functions on Vercel/AWS Lambda have limited streaming support and lower timeout ceilings. Edge is purpose-built for this pattern.

**2. Never rely on client-side token counting for billing.** Clients can lie, networks drop chunks, and token estimators diverge from actual model tokenization. Count on the server in the `onCompletion` callback.

**3. Wire up per-tenant concurrency limits before you think you need them.** One enterprise batch session will spike your OpenAI rate limit without warning. The Redis semaphore takes an hour to build and saves you from a midnight incident.

**4. Make stream IDs part of your API contract.** The client should generate a UUID, persist it in `sessionStorage`, and send it with every retry. This gives you idempotent streams without any server-side state management at the request level.

**5. Test reconnect behavior explicitly.** Chrome DevTools → Network → throttle to "Offline" mid-stream, then restore. If your server starts a second completion, you have a bug and a billing leak.

**6. Log first-token latency separately from completion latency.** These are different UX signals. First-token latency drives perceived performance; completion latency drives cost. Conflating them hides which one you're actually optimizing.

Streaming is table stakes for any AI product. Getting the infrastructure right — idempotency, concurrency, cost attribution — is where the real engineering lives.
