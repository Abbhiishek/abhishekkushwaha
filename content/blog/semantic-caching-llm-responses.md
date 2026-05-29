---
title: "Semantic Caching for AI Products: Cutting LLM Cost Without Breaking Quality"
description: "How to design a semantic cache for LLM-heavy systems using exact cache keys, embeddings, pgvector, Redis, thresholds, and quality checks."
date: "2026-04-08"
tags: llm, semantic-cache, pgvector, redis, cost-optimization
coverImage: /me.webp
featured: true
---

LLM cost problems usually arrive quietly.

At first, every request goes straight to the model. That is fine when traffic is small. Then usage grows, prompts get longer, the product adds retries, and suddenly the invoice is large enough to become a roadmap item.

The instinct is to switch to a cheaper model. Sometimes that works. But for many AI products, the bigger opportunity is avoiding repeated work.

Semantic caching is one of the highest-leverage patterns for LLM-heavy systems.

## Why Exact Caching Is Not Enough

Traditional caching works when two requests are exactly the same. LLM prompts rarely are.

These are different strings:

```txt
Evaluate this answer for a backend engineer role.
Evaluate the candidate response for a backend engineering role.
Score this backend interview answer.
```

But in many product contexts, they may represent the same underlying request.

An exact cache key will miss all three. A semantic cache can recognize that they are similar enough to reuse a previous response if the product allows it.

That last phrase is important: if the product allows it. Semantic caching is not safe for every LLM call.

## Where Semantic Caching Works

Good candidates:

- repeated evaluation prompts
- FAQ-style assistant answers
- classification tasks
- rubric-based scoring
- summarization of similar structured inputs
- generated explanations for common cases

Bad candidates:

- personalized advice with sensitive user context
- legal, medical, or financial outputs
- anything where small input changes must change the answer
- high-creativity generation
- model calls that include fresh user-specific data

The engineering judgment is deciding where similarity means reuse and where similarity is dangerous.

## A Two-Layer Cache

I prefer a two-layer design.

Layer one is an exact cache:

```txt
normalized prompt -> hash -> Redis
```

Layer two is a semantic cache:

```txt
normalized prompt -> embedding -> pgvector similarity search
```

The exact cache is fast and cheap. The semantic cache is slower but captures near-duplicates.

The flow:

1. Normalize the prompt.
2. Look for exact Redis hit.
3. If it misses, generate an embedding.
4. Search pgvector for similar cached prompts.
5. Reuse only if similarity crosses the threshold.
6. If no safe hit exists, call the model.
7. Store the response asynchronously.

```ts
type CacheResult<T> =
  | { source: "exact"; value: T }
  | { source: "semantic"; value: T; similarity: number }
  | { source: "miss" };
```

This shape forces callers to know where the response came from.

## The Data Model

A simple table is enough to start:

```sql
CREATE TABLE llm_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  response JSONB NOT NULL,
  model TEXT NOT NULL,
  task_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  hit_count INTEGER DEFAULT 0
);

CREATE INDEX llm_response_cache_embedding_idx
ON llm_response_cache
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

I would include `task_type` from the beginning. Evaluation prompts should not match support prompts. Candidate feedback should not match internal scoring. A semantic cache needs boundaries.

## Thresholds Are Product Decisions

A similarity threshold is not a magic constant. It should be calibrated.

For one product, 0.90 may be safe. For another, even 0.97 may be risky. The threshold depends on:

- model embedding quality
- prompt length
- task type
- output sensitivity
- acceptable error rate
- whether humans review the result

I like starting conservative, logging would-have-hit cases, and reviewing them offline before enabling reuse.

Useful logs:

- prompt hash
- candidate match hash
- similarity score
- task type
- model
- accepted or rejected
- downstream quality signal if available

The cache should earn trust before it saves money.

## Quality Checks

The dangerous failure mode is a plausible cached response for a meaningfully different input.

Guardrails help:

- require same task type
- require same model family or compatible model
- require same output schema version
- exclude user-specific fields from reusable prompts
- store cache entries per tenant if data can leak
- add TTLs for fast-changing domains
- sample semantic hits for review

For high-stakes tasks, I would also ask a small verifier model: "Is cached response A valid for new prompt B?" That adds cost, but it can still be cheaper than regenerating with a frontier model.

## Cost Is Not the Only Win

Semantic caching reduces cost, but it also improves latency.

An LLM call might take 800ms to several seconds. A Redis hit is near-instant. A pgvector lookup is usually much faster than a generation call. For interactive products, that latency reduction can matter as much as the invoice.

There is also a reliability benefit. If the model provider has a transient issue, a cache hit can keep common flows alive.

## The Engineering Lesson

Semantic caching is not just "put embeddings in Postgres."

It is a product safety problem:

- What can be reused?
- How similar is similar enough?
- Where can data leak?
- How do we know the cache is helping?
- When should we bypass it?

The strongest AI products are often built from unglamorous systems like this. They make the model cheaper, faster, and more reliable without making the user think about any of it.
