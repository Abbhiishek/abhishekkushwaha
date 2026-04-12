---
title: "Semantic Caching for LLM Responses: Cutting Inference Costs by 58%"
description: "How we built a two-layer semantic cache using pgvector and Redis to dramatically reduce LLM API costs in a high-throughput interview platform."
date: "2026-04-11"
tags: llm, caching, pgvector, redis, cost-optimization
coverImage: /thumbnail.jpg
featured: false
---

At HyrecruitAI, our LLM bill crossed $18,000/month by the time we hit 4,000 active interviews. The culprit wasn't complex reasoning tasks — it was thousands of nearly-identical prompts: "Evaluate this candidate's answer to: What is a REST API?" asked in 47 slightly different phrasings. We were paying for re-generation of answers we'd already produced.

This is the story of how we built a semantic caching layer that brought that bill down to $7,600/month without any degradation in response quality.

## The Problem

Our interview engine processes candidate responses in real time. An interviewer bot asks a question, the candidate answers, and our system:

1. Scores the answer (0–10, multi-dimensional)
2. Generates follow-up probes based on gaps
3. Produces a rationale the candidate can review post-interview

Each of those is an LLM call. With 4,000 interviews/month and ~12 LLM calls per interview session, we were making ~48,000 LLM calls/month — and the vast majority of scoring calls had near-identical prompts differing only in minor lexical variation.

Exact-match caching (Redis key = SHA256 of prompt string) hit a rate of only 3.4%. The prompts were never byte-for-byte identical. We needed semantic similarity matching.

```
Total LLM calls/month:      48,000
Exact cache hits:            1,632 (3.4%)
Redundant near-identical:   ~28,000 (estimated)
Monthly API cost:           $18,400
```

## The Solution: Two-Layer Semantic Cache

We built a two-tier system:

- **Layer 1 — Redis exact cache**: SHA256 hash of normalized prompt string. Fast, zero-cost lookup. Hit rate stays low but it's essentially free.
- **Layer 2 — pgvector semantic cache**: Embed the prompt → cosine similarity search against cached embeddings → return cached response if similarity ≥ threshold.

If both miss, we call the LLM, then write to both layers asynchronously.

### Data Model

```sql
CREATE TABLE llm_response_cache (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash  TEXT NOT NULL,
  prompt_text  TEXT NOT NULL,
  embedding    vector(1536) NOT NULL,
  response     JSONB NOT NULL,
  model        TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  hit_count    INTEGER DEFAULT 0,
  last_hit_at  TIMESTAMPTZ
);

CREATE INDEX ON llm_response_cache
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX ON llm_response_cache (prompt_hash);
```

The `response` column stores the full LLM response as JSONB — including token counts, finish reason, and structured output — not just the text. This lets callers use the cache hit transparently.

### TypeScript Cache Client

```typescript
import { createClient } from "redis";
import { openai } from "@/lib/openai";
import { db } from "@/lib/db";
import crypto from "crypto";

interface CacheEntry {
  response: LLMResponse;
  source: "exact" | "semantic" | "miss";
  similarity?: number;
}

interface LLMResponse {
  content: string;
  usage: { prompt_tokens: number; completion_tokens: number };
  model: string;
  cached: boolean;
}

const redis = createClient({ url: process.env.REDIS_URL });

const SIMILARITY_THRESHOLD = 0.94;
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function normalizePrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

async function getEmbedding(text: string): Promise<number[]> {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return resp.data[0].embedding;
}

export async function cachedLLMCall(
  prompt: string,
  options: { model: string; systemPrompt?: string }
): Promise<CacheEntry> {
  const normalized = normalizePrompt(prompt);
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");

  // Layer 1: exact Redis hit
  const redisKey = `llm:exact:${hash}`;
  const exactHit = await redis.get(redisKey);
  if (exactHit) {
    return {
      response: { ...JSON.parse(exactHit), cached: true },
      source: "exact",
    };
  }

  // Layer 2: semantic pgvector hit
  const embedding = await getEmbedding(normalized);
  const vectorLiteral = `[${embedding.join(",")}]`;

  const semanticHit = await db.query<{
    id: string;
    response: LLMResponse;
    similarity: number;
  }>(
    `SELECT id, response, 1 - (embedding <=> $1::vector) AS similarity
     FROM llm_response_cache
     WHERE 1 - (embedding <=> $1::vector) >= $2
       AND model = $3
     ORDER BY similarity DESC
     LIMIT 1`,
    [vectorLiteral, SIMILARITY_THRESHOLD, options.model]
  );

  if (semanticHit.rows.length > 0) {
    const hit = semanticHit.rows[0];

    // Async update hit stats — don't block the response
    db.query(
      `UPDATE llm_response_cache
       SET hit_count = hit_count + 1, last_hit_at = now()
       WHERE id = $1`,
      [hit.id]
    ).catch(console.error);

    // Also backfill exact cache so future identical calls skip vector search
    await redis.setEx(redisKey, CACHE_TTL_SECONDS, JSON.stringify(hit.response));

    return {
      response: { ...hit.response, cached: true },
      source: "semantic",
      similarity: hit.similarity,
    };
  }

  // Cache miss — call LLM
  const completion = await openai.chat.completions.create({
    model: options.model,
    messages: [
      ...(options.systemPrompt
        ? [{ role: "system" as const, content: options.systemPrompt }]
        : []),
      { role: "user", content: prompt },
    ],
  });

  const response: LLMResponse = {
    content: completion.choices[0].message.content ?? "",
    usage: {
      prompt_tokens: completion.usage?.prompt_tokens ?? 0,
      completion_tokens: completion.usage?.completion_tokens ?? 0,
    },
    model: options.model,
    cached: false,
  };

  // Write to both layers asynchronously
  Promise.all([
    redis.setEx(redisKey, CACHE_TTL_SECONDS, JSON.stringify(response)),
    db.query(
      `INSERT INTO llm_response_cache
         (prompt_hash, prompt_text, embedding, response, model)
       VALUES ($1, $2, $3::vector, $4, $5)
       ON CONFLICT (prompt_hash) DO NOTHING`,
      [hash, normalized, vectorLiteral, JSON.stringify(response), options.model]
    ),
  ]).catch(console.error);

  return { response, source: "miss" };
}
```

### Threshold Calibration

The 0.94 cosine similarity threshold wasn't chosen arbitrarily. We ran an offline evaluation:

```typescript
async function calibrateThreshold(
  testPairs: Array<{ prompt: string; acceptableResponse: boolean }>
) {
  const thresholds = [0.88, 0.90, 0.92, 0.94, 0.96, 0.98];

  for (const threshold of thresholds) {
    let falsePositives = 0;
    let truePositives = 0;

    for (const pair of testPairs) {
      const { source, similarity } = await cachedLLMCall(pair.prompt, {
        model: "gpt-4o-mini",
      });

      if (source === "semantic" && similarity! >= threshold) {
        if (pair.acceptableResponse) truePositives++;
        else falsePositives++;
      }
    }

    console.log({
      threshold,
      falsePositiveRate: falsePositives / testPairs.length,
      hitRate: (truePositives + falsePositives) / testPairs.length,
    });
  }
}
```

Results across 2,000 manually-labeled prompt pairs:

| Threshold | False Positive Rate | Cache Hit Rate |
|-----------|---------------------|----------------|
| 0.88      | 8.2%                | 68%            |
| 0.90      | 4.1%                | 61%            |
| 0.92      | 1.9%                | 54%            |
| **0.94**  | **0.6%**            | **47%**        |
| 0.96      | 0.1%                | 31%            |
| 0.98      | 0.0%                | 14%            |

0.94 was the sweet spot: sub-1% false positive rate with nearly half of all calls served from cache.

## The Iteration

### First attempt: Redis only with prompt normalization

Before going vector, we tried aggressive normalization: strip stopwords, lowercase, sort words alphabetically. Hit rate went from 3.4% → 11%. Not worth the engineering complexity, and we were losing semantic meaning in the process.

### Second attempt: Embedding distance without pgvector

We tried in-memory FAISS for the semantic search. It worked in development but exploded in memory on our 2GB Fly.io instances when the cache grew beyond ~50k entries. pgvector with an IVFFlat index solved this — search stays fast (< 15ms at p99) and storage is managed by Postgres.

### Third attempt: Wrong embedding model

We initially used `text-embedding-ada-002` for both embedding and retrieval. Switching to `text-embedding-3-small` cut embedding latency by 40% with comparable similarity quality on our domain-specific prompts. The embedding call is now faster than our Redis round-trip in some cases.

### Cache invalidation

We don't invalidate semantic cache entries — they're treated as immutable once written. If we change a system prompt (e.g., scoring rubric update), we bump a `cache_version` field in the query and only match entries from the same version. Old entries expire via a weekly cleanup job:

```sql
DELETE FROM llm_response_cache
WHERE created_at < now() - interval '30 days'
  AND hit_count = 0;
```

## Architecture / Flow Diagram

```
Incoming LLM Request
        │
        ▼
┌───────────────────┐
│  Normalize Prompt  │  lowercase, collapse whitespace
└────────┬──────────┘
         │
         ▼
┌────────────────────┐
│  Redis Exact Cache  │──── HIT ────▶ return response (source: exact)
│  (SHA256 hash key)  │
└────────┬───────────┘
         │ MISS
         ▼
┌──────────────────────┐
│  Embed Prompt        │  text-embedding-3-small (~5ms)
│  (OpenAI Embeddings) │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  pgvector Similarity Search       │
│  cosine distance < 0.06 (≥ 0.94) │──── HIT ────▶ backfill Redis, return (source: semantic)
│  IVFFlat index, top-1 match       │
└────────┬─────────────────────────┘
         │ MISS
         ▼
┌──────────────────────┐
│  LLM API Call        │  gpt-4o-mini or gpt-4o
│  (OpenAI Chat API)   │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Async Write to Redis + pgvector          │
│  (non-blocking, fire-and-forget w/ catch) │
└──────────────────────────────────────────┘
         │
         ▼
   Return response (source: miss)
```

## Learnings & Outcomes

After 30 days in production:

| Metric                    | Before    | After     |
|---------------------------|-----------|-----------|
| Monthly LLM API cost      | $18,400   | $7,600    |
| Total cache hit rate      | 3.4%      | 51.3%     |
| Exact hits                | 3.4%      | 4.1%      |
| Semantic hits             | —         | 47.2%     |
| Median response latency   | 1,240ms   | 38ms      |
| p99 response latency      | 3,800ms   | 290ms     |
| False positive incidents  | —         | 3 (all low-severity) |

The latency improvement was a bonus we didn't fully anticipate. Semantic cache hits return in ~38ms vs. ~1,200ms for a real LLM call — a 32× speedup that made the whole interview flow feel noticeably more responsive.

## Suggestions

**Start with threshold calibration on your own data.** Generic blog posts say "use 0.85" or "use 0.9" — those numbers mean nothing without understanding your prompt distribution. Build a labeled test set of 500–1,000 prompt pairs before you deploy.

**Embed at query time, not write time.** We initially thought we'd save money by batching embeddings on write. In practice, you need the embedding at read time anyway (for search), so do it once on the first miss and cache the result.

**Don't block the hot path on cache writes.** Use fire-and-forget with proper error catching. A slow Postgres write should never make the user wait.

**Track `source` on every call.** We emit a metric tagged `cache_source: exact | semantic | miss` on every call. This is how we noticed that our semantic threshold was initially too low (high false positive rate appeared in user complaints before we caught it in metrics).

**Version your cache when prompts change.** A system prompt update changes the semantics of what a "good" cached response means. Add a `cache_version` column, bump it on significant prompt changes, and only match within the same version.

**IVFFlat lists parameter matters.** We started with `lists = 20` (the pgvector default example) and saw 80ms p99 on the vector search. Tuning to `lists = 100` for our ~200k row table dropped that to 12ms. Rule of thumb: `lists ≈ sqrt(row_count)`.

The two-layer approach (Redis for exact + pgvector for semantic) wasn't overcomplicated — it was the right tool for each layer. Redis is orders of magnitude faster for key lookups; pgvector handles the fuzzy similarity problem Postgres was designed for. Together, they handle what neither could alone.
