---
title: "Embedding-Based Candidate Matching: How We Built Semantic Search for AI Hiring"
description: "How we replaced keyword filters with vector embeddings to match candidates to jobs at HyrecruitAI — architecture, pitfalls, and production results."
date: "2026-04-07"
tags: embeddings, vector-search, ai, hiring, pgvector
coverImage: /thumbnail.jpg
featured: false
---

Six months after launch, our job-to-candidate matching was producing garbage results. A "Senior Backend Engineer" role was surfacing candidates who had "backend" in their hobbies section and "senior" in their college club title. The precision on our top-10 matches was 34%. Recruiters were spending 40+ minutes per role manually filtering. We had keyword search dressed up as AI.

We replaced it with embedding-based semantic matching. Precision on top-10 is now 81%. Recruiter filtering time is down to under 8 minutes per role. Here's the full story.

## The Problem

HyrecruitAI lets recruiters post jobs and get ranked candidate shortlists. The original matching pipeline was embarrassingly simple:

```typescript
// What we had (simplified)
async function matchCandidates(jobId: string) {
  const job = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) });
  const keywords = extractKeywords(job.description); // naive TF-IDF

  return db.execute(sql`
    SELECT c.id, c.name,
      ts_rank(to_tsvector('english', c.resume_text),
              plainto_tsquery('english', ${keywords.join(' ')})) AS rank
    FROM candidates c
    ORDER BY rank DESC
    LIMIT 50
  `);
}
```

This worked when job descriptions and resumes used identical phrasing. "Python developer" would never match a resume that said "Django/FastAPI engineer." "Machine learning" wouldn't match "deep learning practitioner." The semantic gap was wide and growing.

We were also building an AI interview platform. Candidates who got through our matching were increasingly wrong for the roles — meaning our AI interview evaluations were generating noise, not signal.

## The Solution

We moved to **text embeddings + vector similarity search using pgvector**. The pipeline:

1. Embed job descriptions at creation time (or on edit)
2. Embed candidate resumes at upload/parse time
3. At query time: cosine similarity between job embedding and candidate embeddings
4. Re-rank top-N with a lightweight scoring function

### Choosing the Embedding Model

We evaluated three options:

| Model | Dims | Latency (p99) | Monthly Cost (est.) | Notes |
|---|---|---|---|---|
| `text-embedding-3-small` | 1536 | 180ms | ~$18 | Good baseline |
| `text-embedding-3-large` | 3072 | 310ms | ~$130 | Best quality |
| `nomic-embed-text` (self-hosted) | 768 | 45ms | ~$0 (compute) | Surprisingly strong |

We landed on `text-embedding-3-small` for production. The quality-to-cost ratio was right, and the 1536-dimension vectors were small enough to not destroy our Postgres storage budget. We kept `nomic-embed-text` as a fallback for batch jobs.

### Schema

We use **pgvector** as a Postgres extension. The migration was straightforward:

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Jobs table gets an embedding column
ALTER TABLE jobs ADD COLUMN description_embedding vector(1536);
CREATE INDEX ON jobs USING ivfflat (description_embedding vector_cosine_ops)
  WITH (lists = 100);

-- Candidates table
ALTER TABLE candidates ADD COLUMN resume_embedding vector(1536);
CREATE INDEX ON candidates USING ivfflat (resume_embedding vector_cosine_ops)
  WITH (lists = 100);
```

IVFFlat is approximate nearest-neighbor — much faster than exact search at our scale (~50k candidates). We set `lists = 100` since our candidate count is well above 100 × sqrt(50000) ≈ 22k.

### Embedding Generation

We generate embeddings in a background queue (BullMQ), not in the request path:

```typescript
// lib/embeddings/generate.ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const cleaned = text
    .replace(/\s+/g, " ")
    .slice(0, 8000); // token budget guard

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: cleaned,
    encoding_format: "float",
  });

  return response.data[0].embedding;
}

// workers/embed-job.ts
export async function embedJobWorker(job: Job<{ jobId: string }>) {
  const record = await db.query.jobs.findFirst({
    where: eq(jobs.id, job.data.jobId),
    columns: { id: true, title: true, description: true, requirements: true },
  });

  if (!record) return;

  // Combine title + description + requirements for richer signal
  const text = [
    `Job Title: ${record.title}`,
    record.description,
    record.requirements ?? "",
  ].join("\n\n");

  const embedding = await generateEmbedding(text);

  await db
    .update(jobs)
    .set({ description_embedding: embedding })
    .where(eq(jobs.id, record.id));
}
```

### Similarity Search

The actual matching query using Drizzle + raw SQL for the vector operator:

```typescript
// lib/matching/find-candidates.ts
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

interface MatchResult {
  candidateId: string;
  name: string;
  similarity: number;
  yearsExperience: number | null;
}

export async function findMatchingCandidates(
  jobId: string,
  limit = 50
): Promise<MatchResult[]> {
  // Fetch the job embedding
  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
    columns: { description_embedding: true },
  });

  if (!job?.description_embedding) {
    throw new Error(`Job ${jobId} has no embedding yet`);
  }

  const embeddingLiteral = `[${job.description_embedding.join(",")}]`;

  const results = await db.execute<MatchResult>(sql`
    SELECT
      c.id              AS "candidateId",
      c.name,
      1 - (c.resume_embedding <=> ${embeddingLiteral}::vector) AS similarity,
      c.years_experience AS "yearsExperience"
    FROM candidates c
    WHERE c.resume_embedding IS NOT NULL
    ORDER BY c.resume_embedding <=> ${embeddingLiteral}::vector
    LIMIT ${limit}
  `);

  return results.rows;
}
```

The `<=>` operator is pgvector's cosine distance. `1 - distance = cosine similarity`. We order by distance (ascending) and return similarity for display.

### Re-ranking Layer

Raw cosine similarity ignores hard constraints. A Junior with 1 year of experience scoring 0.91 similarity against a "10+ years required" role is misleading. We added a lightweight re-ranker on top:

```typescript
// lib/matching/rerank.ts
interface ScoredCandidate extends MatchResult {
  finalScore: number;
}

export function rerank(
  candidates: MatchResult[],
  jobRequirements: { minYears?: number; requiredSkills?: string[] }
): ScoredCandidate[] {
  return candidates
    .map((c) => {
      let score = c.similarity;

      // Experience penalty
      if (jobRequirements.minYears && c.yearsExperience !== null) {
        const gap = jobRequirements.minYears - c.yearsExperience;
        if (gap > 3) score *= 0.6;
        else if (gap > 0) score *= 0.85;
      }

      return { ...c, finalScore: score };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
}
```

This isn't ML — it's deterministic business rules applied after semantic retrieval. Simple, debuggable, works well.

## The Iteration

### What failed first: embedding the raw resume PDF text

Our first attempt embedded whatever we extracted from PDF resumes: messy OCR output, table artifacts, garbled whitespace. The embeddings were noisy and similarity scores were all clustered between 0.55–0.65. We couldn't distinguish good matches from poor ones.

**Fix:** We added a resume normalization step that parsed structured sections (experience, skills, education) using an LLM and re-embedded the structured output. This spread the distribution to 0.40–0.92, giving us real discriminative signal.

```typescript
// lib/resume/normalize.ts
export async function normalizeResume(rawText: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Extract and structure the following resume. Output ONLY:
- Skills: (comma-separated list)
- Experience: (each role as "Title at Company, N years — key responsibilities")
- Education: (degree, institution)
- Summary: (2-3 sentences about the candidate's profile)

Resume:
${rawText.slice(0, 4000)}`
    }],
  });

  return response.content[0].type === "text" ? response.content[0].text : rawText;
}
```

### What failed second: index parameters

With `lists = 100` and default `probes = 1`, we were only probing 1% of the index. Recall at top-50 was ~74%. We bumped `probes` at query time:

```sql
SET ivfflat.probes = 10;
```

Recall jumped to ~94%. Latency went from 8ms to 31ms per query — totally acceptable.

### What surprised us: job description quality

Embeddings are only as good as the text they encode. Vague job posts like "We're looking for a talented engineer to join our team" produce embeddings that match almost everyone. We added a job description quality score (cosine distance from a template "generic job post") and surfaced a warning to recruiters when their JD was too generic. This indirectly improved match quality more than any model tweak.

## Architecture / Flow Diagram

```
Recruiter posts job
        │
        ▼
[Job Service] ──────────────────────────────────────────────┐
    stores job in Postgres                                   │
        │                                                    │
        ▼                                                    ▼
[BullMQ: embed-job queue]                         [JD Quality Checker]
    calls OpenAI /embeddings                        warns if too generic
    stores vector in jobs.description_embedding
        │
        │  (async, ~200ms)
        ▼
[Matching API: GET /api/jobs/:id/matches]
        │
        ├── reads job.description_embedding
        ├── runs pgvector <=> cosine search (top-50)
        ├── re-ranker applies experience/skills rules
        └── returns ranked list

Candidate uploads resume
        │
        ▼
[Resume Parser] ── PDF extract ──▶ [LLM Normalizer] ──▶ [BullMQ: embed-resume queue]
                                                               │
                                                               ▼
                                                   stores vector in candidates.resume_embedding
```

Both embed queues are idempotent (re-queue on edit) and back-filled via a migration script for existing records.

## Learnings & Outcomes

**Precision@10 (correct matches in top 10):** 34% → 81%
**Recruiter filtering time:** 42 min → 7.5 min per role
**Candidate-to-interview conversion rate:** +23% (better shortlists = better interviews)
**Embedding cost:** ~$0.08 per 1000 candidates embedded
**p99 match query latency:** 38ms (including re-rank)

The biggest surprise: most of the gain came from structured resume normalization, not the embedding model choice. Garbage in, garbage out is still the rule.

## Practical Advice

**Start with pgvector before reaching for a dedicated vector DB.** Pinecone and Weaviate are great, but if you're already on Postgres, pgvector handles hundreds of millions of vectors with proper indexing. You avoid an extra service, an extra bill, and an extra failure domain.

**Embed at write time, query at read time.** Never generate embeddings in the request path. A BullMQ or Temporal worker handles failures, retries, and back-pressure cleanly.

**Set `ivfflat.probes` at the session level, not globally.** Different queries have different recall requirements. A batch re-indexing job can use `probes = 1`; a recruiter-facing shortlist query should use `probes = 10` or higher.

**Monitor embedding drift.** When you upgrade your embedding model, old and new vectors are incompatible — cosine distance between them is meaningless. Version your embedding model in the schema (`embedding_model_version TEXT`), and back-fill incrementally before switching queries to the new column.

**Log similarity score distributions, not just top-N results.** If your distribution suddenly narrows (all scores 0.60–0.70), your input quality degraded — a resume parsing regression or a prompt change. Score histograms caught two regressions before recruiters noticed.

The shift from keyword to semantic matching wasn't a magic fix — it was a sequence of small, measurable improvements. The embedding model was table stakes; the real leverage was in data quality, index tuning, and knowing which business rules to apply on top.
