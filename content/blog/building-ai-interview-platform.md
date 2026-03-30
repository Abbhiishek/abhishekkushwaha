---
title: "Building an AI-Powered Interview Platform from Scratch"
description: "A deep dive into the technical architecture behind HyrecruitAI — request flow, latency budgets, the AI interview agent, real-time transcription, and the data pipeline."
date: "2026-01-20"
tags: ai, architecture, nextjs, startup
coverImage: /thumbnail.jpg
featured: true
---

# Building an AI-Powered Interview Platform from Scratch

We analyzed 500 interview recordings from our early customers and found that scoring variance between different human interviewers evaluating the same candidate was 2.3x higher than the variance between our AI evaluator and the human panel median. Two interviewers watching the same answer would give scores that differed by an average of 1.8 points on a 10-point scale. That inconsistency is what we set out to fix.

At HyrecruitAI, we built a platform where every candidate gets a structured, AI-assisted interview experience. Here is how the technical foundation works.

## The Problem

Traditional interviews are inconsistent in ways that compound. Different interviewers ask different questions, evaluate against different mental rubrics, and introduce unconscious bias. A candidate who interviews at 9 AM with a well-rested interviewer gets a different experience than the one who interviews at 4:30 PM after the interviewer's third back-to-back session.

We wanted to build a platform where the interview structure, question quality, and evaluation criteria remain constant regardless of when or how the interview happens. AI powers the consistency layer. Humans still make the final hiring decision, but they work with much better data.

## Architecture Overview

The platform runs four services:

1. **Web Application** — Next.js with React 19, handling the candidate portal, hiring manager dashboard, and admin interface. Server components for initial page loads, client components for interactive features.
2. **Signaling Server** — A lightweight WebSocket server that brokers WebRTC connections between interview participants. Stateless by design — it relays SDP offers, answers, and ICE candidates, nothing else.
3. **Transcription Worker** — Processes audio streams from interview recordings, sends them to Azure Speech Services for real-time speech-to-text, and writes transcript segments to the database.
4. **Evaluation Pipeline** — An async service that takes finalized transcripts, runs them through our multi-stage LLM evaluation engine, and generates structured reports.

### Request Flow

When a candidate clicks their interview link, here is what happens:

1. The link resolves through our Next.js middleware, which identifies the tenant and the specific interview session
2. The candidate's browser connects to the signaling server via WebSocket
3. The signaling server facilitates a WebRTC peer connection between the candidate and the interviewer (or AI agent)
4. Once the video connection is established, a headless recorder joins as a silent third participant, capturing the composite media stream
5. The recorder pipes audio to the transcription worker in near-real-time via chunked uploads
6. The transcription worker streams transcript segments back to the UI through a separate WebSocket channel
7. When the interview ends, the transcription worker finalizes the full transcript
8. The evaluation pipeline picks up the finalized transcript and runs the multi-stage assessment
9. Within 30 seconds of the interview ending, a structured report with scores and justifications is available to the hiring manager

### Latency Budget

Real-time conversation has zero tolerance for lag. Our latency budget:

- **Video/audio end-to-end:** Sub-200ms for peer-to-peer connections, sub-400ms when relayed through TURN
- **Live transcription:** Under 800ms from speech to text appearing in the UI
- **AI follow-up generation:** Under 2 seconds from candidate finishing an answer to the agent's next question appearing (for AI-led interviews)
- **Post-interview evaluation:** Under 30 seconds from interview end to completed report

For a deeper look at how we handle the video layer, see [Building Real-Time Video Interviews with WebRTC](/blog/real-time-video-webrtc).

## The AI Interview Agent

The core of the product is not a chatbot. It is a structured interviewer that follows a predefined plan, adapts based on responses, and evaluates against explicit rubrics.

### Interview Plan Structure

Every interview starts with a plan defined by the hiring manager:

```typescript
interface InterviewPlan {
  roleId: string;
  totalDurationMinutes: number;
  sections: {
    name: string;                    // e.g., "System Design"
    durationMinutes: number;
    questions: {
      id: string;
      text: string;
      type: 'technical' | 'behavioral' | 'situational';
      followUpTriggers: {
        condition: string;           // e.g., "candidate mentions load balancer but not failover"
        probe: string;               // e.g., "What happens if that load balancer goes down?"
      }[];
      rubric: EvaluationRubric;
    }[];
  }[];
}
```

The plan is not a rigid script. It defines the structure — which sections to cover, how much time to allocate, what questions to ask — but the agent adapts within that structure. If a candidate gives a thorough answer that covers the first two follow-up probes preemptively, the agent skips them and moves on.

### Follow-Up Logic

The agent's follow-up decisions run on a two-pass system:

**Pass 1 — Key Point Extraction.** As the candidate speaks (via the real-time transcript), the agent extracts key technical claims and assertions. For a system design question, this might be: "mentioned load balancer," "proposed horizontal scaling," "did not address single points of failure."

**Pass 2 — Gap Analysis.** The extracted points are compared against the expected answer framework for that question. If the candidate mentioned "load balancer" but did not discuss failover, the follow-up trigger fires: "What happens if that load balancer goes down?"

The critical constraint is latency. The agent must generate a follow-up within 2 seconds of the candidate finishing their answer, or the conversation feels unnatural. We achieve this two ways:

- **Pre-computed follow-up trees** for common answer patterns. The agent does not call the LLM for every follow-up — it checks the pre-computed tree first and only falls back to generation for novel responses.
- **Streaming responses.** When the agent does generate a follow-up, it starts speaking (via TTS) as soon as the first sentence is generated, not after the full response is complete.

### Concrete Example

For a backend engineering interview, the system design section might include:

> **Question:** "Design a URL shortening service that handles 10,000 requests per second."
>
> **Candidate says:** "I would use a hash function to generate short codes, store the mapping in a relational database, and put a load balancer in front of the application servers."
>
> **Extracted points:** hash-based generation, relational DB, load balancer, no mention of caching, no mention of collision handling, no mention of analytics
>
> **Follow-up triggered:** "How would you handle hash collisions, and what would you do if the database becomes a bottleneck at that request volume?"

The agent knows to probe on collisions and scaling because those are in the follow-up trigger definitions for this question. The hiring manager defined them when creating the interview plan.

## Real-Time Transcription Integration

The transcription pipeline is the connective tissue between the video layer and the AI layer. Getting it wrong means the AI agent operates on bad data.

### Speaker Diarization

Early on, we fed a single mixed audio stream to the transcription service. The AI agent confused who said what — it would attribute the interviewer's question to the candidate and evaluate the candidate on words they never said. This was a show-stopping bug.

The fix was straightforward but required architectural change: we capture separate audio tracks per participant in the WebRTC connection. The recorder receives two distinct streams, tags each with a participant identifier, and sends them to the transcription worker independently. The worker merges them into a single time-aligned transcript with speaker labels.

### Transcription Provider Selection

We tested four providers against a benchmark of 200 interview recordings:

| Provider | General Accuracy | Technical Vocabulary | Latency (p95) |
|----------|-----------------|---------------------|---------------|
| Azure Speech Services | 92% | 89% | 650ms |
| Azure + Custom Model | 95% | 94% | 680ms |
| Google Cloud STT | 93% | 87% | 720ms |
| Deepgram | 94% | 91% | 480ms |

We went with Azure Speech Services with a custom model trained on 200 hours of technical interview audio. The custom model improved accuracy on domain-specific terms (React, Kubernetes, PostgreSQL, microservices) from 89% to 94%. Deepgram was faster but did not support custom model training at the time we evaluated.

Accuracy on technical vocabulary matters more than general accuracy for us. If the transcript says "post-grace" instead of "Postgres," the evaluation engine scores the candidate as not knowing the database they actually use daily.

## Data Pipeline

### What Happens After the Interview

Once the interview ends, a pipeline processes the session data:

1. **Transcript finalization.** The real-time transcript is re-processed with a higher-accuracy batch model (Azure Speech Services batch API). This catches errors the real-time model missed and produces the authoritative transcript within 2 minutes.
2. **Evaluation.** The finalized transcript feeds into our multi-stage LLM evaluation engine. Each question is scored against its rubric across multiple dimensions. Three evaluation passes run in parallel for consistency checking. See [How We Built an LLM-Based Evaluation Engine](/blog/llm-evaluation-engine) for the full breakdown.
3. **Report generation.** Scores, justifications, key moments, and a summary are compiled into a structured JSON report and a PDF. The hiring manager receives a notification with a link to the report.
4. **Recording processing.** The raw video is transcoded to H.264/AAC, chunked into segments for seeking, and stored in Azure Blob Storage. Hiring managers can jump to specific moments referenced in the evaluation report.

### Storage

Each interview generates approximately 50MB of data:

- **Video recording:** ~40MB for a 30-minute interview at adaptive bitrate
- **Audio tracks (separate per participant):** ~5MB
- **Transcript JSON (with timestamps and speaker labels):** ~200KB
- **Evaluation results (3 passes, per-dimension scores, justifications):** ~100KB
- **PDF report:** ~500KB

Raw media goes to Azure Blob Storage with lifecycle policies (hot tier for 30 days, cool tier for 6 months, archive after that). Structured data lives in PostgreSQL.

### Analytics

Hiring managers see aggregate metrics across their interview pipeline:

- Average scores by question category and seniority level
- Time-to-hire trends by role and source
- Candidate pipeline conversion rates (applied → screened → interviewed → offered → hired)
- Interviewer consistency scores (for human-led interviews that use our evaluation rubric)

These queries run against materialized views refreshed every 15 minutes. The materialized views join across interviews, evaluations, candidates, and pipeline stages. Without materialized views, the dashboard queries would take 3-5 seconds on our current data volume. With them, sub-200ms. See [PostgreSQL Performance Patterns](/blog/postgres-performance-patterns) for how we optimize these queries.

## Lessons Learned

**Ship the simplest version that teaches you something.** V1 shipped in 6 weeks. It was a video call with a structured question sidebar and manual scoring. No AI evaluation, no real-time transcription, no follow-up logic. We put it in front of 10 hiring managers and learned that they cared most about scoring consistency, not the video quality or the UI polish. V2 with full AI evaluation took another 3 months, built on top of what V1 taught us.

**Type safety at the boundary between services is non-negotiable.** Our worst production bug happened when the transcription worker started sending transcript segments with a `timestamp` field in milliseconds, but the evaluation pipeline expected seconds. The AI evaluated answers against the wrong parts of the transcript. After that, we defined shared Zod schemas for every inter-service message format and validate at both the sending and receiving ends. It has caught 6 similar drift bugs since.

**Invest in observability before you need it.** We added structured logging and distributed tracing (OpenTelemetry with Grafana) four months in. The first week with proper observability surfaced three bugs: a memory leak in the transcription worker, a race condition in the signaling server, and a database query that was doing a full table scan on every interview start. All three had been degrading performance for weeks without anyone noticing.

## What is Next

We are working on multi-language interview support (the transcription model currently handles English and Hindi), advanced analytics with cohort comparison, and deeper integrations with popular ATS platforms. The engineering challenges ahead — multilingual LLM evaluation, cross-region video routing, and real-time collaborative review — are what keep us building.
