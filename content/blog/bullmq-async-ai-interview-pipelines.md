---
title: "Event-Driven AI Pipelines: Using BullMQ to Decouple Interview Processing at Scale"
description: "How we moved from synchronous LLM calls blocking interview sessions to a BullMQ-backed async pipeline that cut p95 latency by 71% and gave us reliable retry semantics."
date: "2026-04-14"
tags: bullmq, redis, event-driven, ai, infrastructure, typescript
coverImage: /thumbnail.jpg
featured: false
---

In April 2024, a candidate reported that their interview session had stalled for 90 seconds after answering a question. The LLM scoring call had timed out mid-request. We retried it synchronously. That retry also timed out. The session was effectively dead. The candidate refreshed, lost context, and filed a support ticket.

We were blocking the interview session process on three LLM calls in series: answer scoring, follow-up question generation, and session-state update. When any one of them hiccuped — and inference endpoints hiccup — the whole thing stalled. No retry logic, no queue, no fallback. Just a blocking `await` and a prayer.

This post covers how we redesigned interview processing around [BullMQ](https://docs.bullmq.io/), what we got wrong in v1, and the architecture we settled on after two iterations.

---

## The Problem

Our original interview session flow looked like this in pseudocode:

```typescript
// BEFORE: synchronous, fragile
async function handleAnswerSubmit(sessionId: string, answer: string) {
  const score = await scoreAnswer(answer);          // ~2-4s
  const nextQuestion = await generateFollowUp(answer, score);  // ~3-6s
  await updateSessionState(sessionId, score, nextQuestion);    // ~100ms
  return nextQuestion;
}
```

Total blocking time per answer: **5–10 seconds**. Acceptable in a demo. Painful with 50 concurrent sessions. Catastrophic when the inference provider was degraded.

The symptoms we were seeing:
- p95 answer-to-next-question latency: **11.2 seconds**
- Timeout errors (30s limit): **4.1% of answer submissions**
- Sessions with at least one stall: **18% over a 2-week period**
- Lost sessions due to unrecoverable errors: **~0.7%**

That last number sounds small. For a hiring platform where candidates have scheduled interview slots, 0.7% means real people losing real opportunities.

---

## The Solution: BullMQ-Backed Job Pipeline

BullMQ is a Redis-backed job queue for Node.js. It gives us:
- Named queues with priority and delay support
- Worker concurrency control
- Automatic retries with exponential backoff
- Job progress and state visibility
- Dead-letter queue semantics via `failed` job states

We restructured interview processing into three queues:

| Queue | Jobs | Concurrency | Retry |
|---|---|---|---|
| `interview:scoring` | Score candidate answer | 20 | 3x, exp backoff |
| `interview:generation` | Generate follow-up question | 10 | 3x, exp backoff |
| `interview:notify` | Send session-state updates | 50 | 5x |

### Queue Setup

```typescript
// lib/queues/interview-queues.ts
import { Queue, QueueEvents } from "bullmq";
import { redisConnection } from "@/lib/redis";

export const scoringQueue = new Queue("interview:scoring", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1500 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
});

export const generationQueue = new Queue("interview:generation", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
});

export const notifyQueue = new Queue("interview:notify", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 500 },
  },
});

export const scoringQueueEvents = new QueueEvents("interview:scoring", {
  connection: redisConnection,
});
```

### Job Type Definitions

```typescript
// lib/queues/job-types.ts
export interface ScoringJobData {
  sessionId: string;
  questionId: string;
  answer: string;
  tenantId: string;
  candidateId: string;
  questionContext: {
    text: string;
    rubric: string;
    idealLength: "short" | "medium" | "long";
  };
}

export interface GenerationJobData {
  sessionId: string;
  scoringJobId: string; // dependency — waits for scoring result
  previousAnswers: Array<{ question: string; answer: string; score: number }>;
  jobDescription: string;
  tenantId: string;
}

export interface NotifyJobData {
  sessionId: string;
  event: "answer_scored" | "question_ready" | "session_complete" | "error";
  payload: Record<string, unknown>;
}
```

### Enqueuing from the API Route

The API route now returns immediately after enqueuing. The client polls or subscribes via WebSocket for the result.

```typescript
// app/api/interview/answer/route.ts
import { scoringQueue } from "@/lib/queues/interview-queues";
import type { ScoringJobData } from "@/lib/queues/job-types";

export async function POST(req: Request) {
  const { sessionId, questionId, answer } = await req.json();
  const session = await getSession(sessionId);

  const jobData: ScoringJobData = {
    sessionId,
    questionId,
    answer,
    tenantId: session.tenantId,
    candidateId: session.candidateId,
    questionContext: session.currentQuestion,
  };

  const job = await scoringQueue.add(`score:${sessionId}:${questionId}`, jobData, {
    priority: session.isPriorityCandidate ? 1 : 10,
  });

  return Response.json({ jobId: job.id, status: "queued" }, { status: 202 });
}
```

### Workers

Workers run as a separate process (not in the Next.js server). We deploy them as a standalone service on Fly.io with auto-scaling based on queue depth.

```typescript
// workers/scoring-worker.ts
import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { scoreAnswer } from "@/lib/ai/scoring";
import { generationQueue, notifyQueue } from "@/lib/queues/interview-queues";
import type { ScoringJobData } from "@/lib/queues/job-types";

const scoringWorker = new Worker<ScoringJobData>(
  "interview:scoring",
  async (job) => {
    const { sessionId, questionId, answer, questionContext, tenantId } = job.data;

    job.updateProgress(10);

    const scoreResult = await scoreAnswer({
      answer,
      rubric: questionContext.rubric,
      idealLength: questionContext.idealLength,
    });

    job.updateProgress(80);

    // Chain to generation queue
    await generationQueue.add(
      `generate:${sessionId}`,
      {
        sessionId,
        scoringJobId: job.id!,
        previousAnswers: await getPreviousAnswers(sessionId),
        jobDescription: await getJobDescription(tenantId),
        tenantId,
      },
      { priority: job.opts.priority }
    );

    // Notify client answer was scored
    await notifyQueue.add(`notify:scored:${sessionId}`, {
      sessionId,
      event: "answer_scored",
      payload: { questionId, score: scoreResult.score, feedback: scoreResult.feedback },
    });

    job.updateProgress(100);
    return scoreResult;
  },
  {
    connection: redisConnection,
    concurrency: 20,
    limiter: { max: 50, duration: 1000 }, // 50 LLM calls/sec per worker instance
  }
);

scoringWorker.on("failed", async (job, err) => {
  if (!job) return;
  const isExhausted = job.attemptsMade >= (job.opts.attempts ?? 3);

  if (isExhausted) {
    await notifyQueue.add(`notify:error:${job.data.sessionId}`, {
      sessionId: job.data.sessionId,
      event: "error",
      payload: { message: "Scoring unavailable. Please retry the question." },
    });
  }
});
```

---

## The Iteration

### v1: Naive Chaining (What Failed First)

Our first attempt put all three jobs in a single BullMQ `Flow` (parent-child dependency). Scoring was a parent; generation was a child that only ran after scoring succeeded.

The problem: BullMQ Flows don't propagate parent return values to child jobs automatically — you fetch them via `job.getChildrenValues()`. We missed this and the generation worker was reading stale data from Redis directly. Follow-up questions were occasionally generated without the latest score context. Candidates got follow-ups that ignored their previous answer entirely.

Fix: dropped Flows. Each worker explicitly enqueues the next job with the necessary data in the payload. More verbose, but no implicit magic.

### v2: Worker Colocation (Also Wrong)

We initially ran workers inside the Next.js server process using `new Worker(...)` at module load time. This worked locally but caused two issues in production:

1. Vercel serverless functions are stateless — no persistent process, so the worker never stayed alive.
2. Even on a persistent host, Next.js hot-reloads in dev would spawn duplicate workers that all processed the same jobs.

Fix: dedicated worker service, separate deploy target, separate Redis connection pool. Workers are always-on processes, not request handlers.

---

## Architecture / Flow Diagram

```
Client (Browser)
    │
    ▼
[POST /api/interview/answer]  ──► returns 202 + jobId immediately
    │
    ▼
[interview:scoring Queue]  (Redis)
    │
    ▼
[Scoring Worker × 20 concurrent]
    │  uses: LLM scoring endpoint (OpenAI / Together AI)
    │  emits: score result
    │
    ├──► [interview:generation Queue]  (chained)
    │        │
    │        ▼
    │    [Generation Worker × 10 concurrent]
    │        │  uses: LLM generation endpoint
    │        │  emits: next question
    │        │
    │        ▼
    │    [interview:notify Queue]
    │
    └──► [interview:notify Queue]  (parallel, immediate score notification)
              │
              ▼
         [Notify Worker × 50 concurrent]
              │
              ▼
         WebSocket push to client  ──► Client receives score + next question
```

Each queue scales independently. Notify workers are cheap (no LLM calls) and run at high concurrency. Scoring workers are expensive and rate-limited.

---

## Learnings & Outcomes

After running this in production for six months:

| Metric | Before | After |
|---|---|---|
| p95 answer-to-question latency | 11.2s | 3.2s |
| Timeout error rate | 4.1% | 0.09% |
| Sessions with any stall | 18% | 1.4% |
| Lost sessions | 0.7% | 0% (past 90 days) |
| LLM cost per session | ~$0.043 | ~$0.038 (fewer retries) |

The latency improvement is partly from the async architecture and partly from the worker-side rate limiter smoothing out burst traffic that previously caused cascade timeouts.

**What surprised us:** the retry/backoff semantics of BullMQ alone eliminated most of our error budget. Most LLM provider hiccups are transient and resolve within 3–6 seconds. The exponential backoff handled them silently. We went from monitoring Sentry errors for scoring timeouts daily to checking them weekly.

**Cost:** we spend roughly $8/month on the Fly.io worker service (2x 512MB instances). The Redis connection is shared with our existing rate-limiting Redis instance.

---

## Suggestions

**1. Separate your queues by SLA, not by job type.** A "notify candidate" job and a "score answer" job have different criticality, retry tolerance, and cost profiles. Treat them as separate concerns from day one.

**2. Never run workers inside your web server process.** Serverless functions can't host persistent workers. Even on traditional servers, you'll hit problems with restarts, hot-reload, and concurrency limits. Separate service, separate deploy.

**3. Model your job data as self-contained payloads.** Workers should not need to make additional database reads to run. Pack everything the worker needs into the job payload. This makes retry semantics clean — the same data, retried — and avoids stale-read bugs.

**4. Add a dead-letter monitor before you need it.** We waited until we had stuck jobs to add a dashboard. BullMQ Board (or Bull Dashboard) takes 10 minutes to set up and makes failed job triage trivial. Do it during initial setup.

**5. Use job priority for candidate fairness.** In a multi-tenant system, a large enterprise customer should not starve out a startup's candidate. We assign higher priority (lower numeric value in BullMQ) to priority tiers but cap them — no tenant can monopolize the workers entirely.

The shift from synchronous LLM chains to a queue-backed pipeline is one of the highest-ROI infrastructure changes we've made. The code is more complex, but the failure modes are predictable and recoverable — which is all you can ask for when you're depending on third-party inference APIs in a production flow.
