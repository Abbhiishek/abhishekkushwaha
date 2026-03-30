---
title: "Scaling Engineering Teams: Lessons from Building HyrecruitAI"
description: "What it actually looks like to grow from 2 to 15 engineers at a seed-stage AI startup — team structures, hiring mistakes, RFC processes, and the metrics that matter."
date: "2025-12-15"
tags: engineering, leadership, startup, scaling
coverImage: /thumbnail.jpg
featured: true
---

# Scaling Engineering Teams: Lessons from Building HyrecruitAI

The first time our engineering process broke was three months in. Two engineers pushed migrations to the same table on the same day. Neither knew the other was working on it. The deploy failed, staging went down for four hours, and we spent the evening untangling conflicting schema changes by hand.

That was the moment I realized "just talk to each other" stops working as a process once you are past two people. Here is what I learned scaling HyrecruitAI's engineering team from 2 to 15 over 18 months.

## Phase 1: Two to Four Engineers

At two engineers, there is no process. You sit next to each other, say "I am changing the candidates table," and that is your coordination mechanism. It works until it does not.

Before hiring our third engineer, we invested two weeks in foundational infrastructure:

- **Monorepo with clear boundaries.** We set up a Turborepo monorepo with `apps/` and `packages/` directories. New engineers could work on a frontend feature without touching backend code, even though everything lived in one repo. This was the single best early decision we made.
- **CI pipeline with teeth.** Every PR ran linting, type checks, and tests. No exceptions. The rule was simple: if CI fails, the PR is not ready for review. This removed "works on my machine" from our vocabulary.
- **Database migration workflow.** After the migration collision, we adopted sequential migration numbering through Drizzle Kit and a CI check that failed if two migrations had the same sequence number in a single PR.

### Hiring at This Stage

Our first two hires came through personal networks. We did not have a formal process, and honestly, we did not need one yet. What we looked for was simple: engineers who could own a feature end-to-end. Not "I will build the API endpoint" but "I will talk to the hiring manager, understand what they need, build it, test it, and ship it."

We made one early hiring mistake that taught me a lasting lesson. We brought on a senior engineer with impressive credentials who expected clearly scoped tasks and detailed requirements. At a four-person startup, nobody writes requirements. He lasted six weeks. The takeaway: at this stage, autonomy and judgment matter more than technical depth. You need people who can figure out the right thing to build, not just build what they are told.

## Phase 2: Five to Eight Engineers

This is where informal coordination starts to crack. Five engineers means ten communication paths. Eight means twenty-eight. Meetings multiply. Context gets lost. People step on each other's work.

### Introducing Specialization

At five engineers, we started informal specialization. Not rigid roles — everyone still reviewed PRs across the stack — but primary focus areas:

- Two engineers focused on the frontend (candidate portal, hiring manager dashboard)
- Two focused on backend services (API, evaluation pipeline, integrations)
- One focused on infrastructure (CI/CD, monitoring, database operations)

This was not a top-down decision. It emerged naturally from who gravitated toward what. We just made it explicit so people knew who to ask about what.

### The RFC Process

The migration collision was a small version of a problem that kept recurring: engineers making decisions in isolation that affected the whole system. We introduced RFCs (Request for Comments) for any change that met one of these criteria:

- Touches more than two services or packages
- Adds a new external dependency
- Changes the database schema in a non-additive way
- Introduces a new background job or queue

The format was intentionally lightweight:

```markdown
## RFC: [Title]
**Author:** [Name]  **Date:** [Date]  **Status:** Draft / In Review / Accepted / Rejected

### Problem
What is broken or missing? One paragraph max.

### Proposal
What are we building? Include scope boundaries — what is NOT included.

### Alternatives Considered
At least one alternative, with why it was rejected.

### Migration / Rollout
How do we ship this without breaking production?

### Open Questions
What do we not know yet?
```

Engineers submit the RFC as a pull request to a `docs/rfcs/` directory. Two engineers must approve before implementation starts. The review period is 48 hours — long enough for async feedback, short enough to not block progress.

The key insight was that RFCs are not about getting permission. They are about surfacing context. The reviewer who says "wait, that will break tenant isolation" is saving two weeks of wasted work.

### On-Call Rotation

At six engineers, I stopped being the only person who got paged when things broke. We introduced a weekly on-call rotation with these rules:

- The on-call engineer is responsible for triaging production incidents and customer-reported issues during their week
- If something breaks at 2 AM and it is not a data loss scenario, it can wait until morning
- Every incident gets a brief write-up in a shared channel: what happened, what we did, what we should fix

Initial resistance was real. Nobody wants to be paged on a Saturday. What changed attitudes was making on-call count: on-call weeks had reduced sprint commitments, and recurring incidents triggered engineering investment to fix the root cause.

### Velocity at This Stage

With the RFC process, on-call rotation, and CI pipeline in place, our deploy frequency went from twice a week (cautious, manual, scary) to two to three times per day (automated, tested, boring). That shift in confidence changed how we thought about shipping. Smaller changes, more often, less risk per deploy.

## Phase 3: Nine to Fifteen Engineers

At this size, "the team" stops being a single unit. People do not know what everyone else is working on. Decisions that used to happen in a hallway conversation now need deliberate communication structures.

### Squad Topology

We split into three squads, each owning a distinct part of the product:

- **Platform squad** (4 engineers): Authentication, multi-tenancy, billing, infrastructure, CI/CD. Owns everything below the product layer.
- **Product squad** (5 engineers): Candidate portal, hiring manager dashboard, analytics, integrations. Owns every user-facing feature.
- **AI squad** (3 engineers): Interview agent, evaluation engine, transcription pipeline. Owns the AI layer and its supporting data infrastructure.

Each squad has a lead who joins a weekly leads sync. The leads sync is 30 minutes: each lead shares what shipped this week, what is shipping next week, and any cross-squad dependencies. If a dependency surfaces, the two relevant leads resolve it offline. This meeting has prevented more wasted work than any other process we have.

### Architecture Decision Records

RFCs work for proposals. ADRs (Architecture Decision Records) work for recording decisions after they are made. The distinction matters: six months from now, nobody remembers why we chose Drizzle over Prisma or why we run our own TURN servers. The ADR captures the "why" so it does not get re-litigated.

Our ADR format:

```markdown
## ADR-[number]: [Decision Title]
**Date:** [Date]  **Status:** Accepted / Superseded by ADR-[X]

### Context
What situation or constraint led to this decision?

### Decision
What did we decide?

### Consequences
What are the tradeoffs? What becomes easier, what becomes harder?
```

We have 23 ADRs as of this writing. They live in `docs/adrs/` and are referenced in onboarding docs. A new engineer can read the last 10 ADRs and understand most of the system's architectural rationale in under an hour.

For more detail on the specific technology choices these ADRs captured, see [Technical Decisions That Shaped HyrecruitAI](/blog/startup-tech-decisions).

### Onboarding

A new engineer's first week at HyrecruitAI follows a structured checklist:

- **Day 1:** Environment setup (monorepo clone, local dev running, seed database), access to all tools (GitHub, Sentry, Grafana, Slack channels), meet the squad lead
- **Day 2:** Architecture walkthrough (recorded session covering the monorepo structure, key services, data flow), read the last 5 ADRs
- **Day 3:** First PR. A pre-selected starter task (fixing a UI bug, adding a test, updating docs) that touches the full PR workflow: branch, commit, CI, review, merge
- **Day 4-5:** Shadow the on-call engineer for two days to understand production behavior, monitoring dashboards, and incident response

Our median time-to-first-PR dropped from 5 days to 2 days after introducing this structure. More importantly, new engineers report feeling productive by the end of week one instead of week three.

## The CTO Job Changes Every Six Months

This is the part nobody prepares you for. At 2 engineers, I wrote 80% of the code. At 5, I wrote 50% and reviewed the other 50%. At 10, I wrote maybe 10% — mostly prototypes and proof-of-concepts — and spent the rest of my time in architecture discussions, hiring calls, and 1:1s. At 15, I write almost no production code.

The hardest transition was not technical. It was emotional. Letting go of implementation details when you can see exactly how you would build something is painful. But the leverage math is clear: if I spend 4 hours writing a feature, that is one feature. If I spend 4 hours unblocking three engineers, that is three features. The CTO's job is to be a multiplier, not an individual contributor.

## What I Got Wrong

**Hired too many backend engineers too fast.** We had four backend engineers and one infra person, and our deploy pipeline became the bottleneck. We should have hired a second infra-focused engineer before the fourth backend engineer.

**Waited too long on developer experience tooling.** Local dev setup was painful for six months because nobody owned it. When we finally invested a week into a proper `docker-compose` setup with seeded databases and mocked external services, onboarding time halved and "it works on my machine" bugs disappeared.

**No feature flags until month eight.** We shipped directly to production for the first eight months. The first time a half-finished feature leaked to users, we scrambled to revert. Feature flags would have let us decouple deploys from releases. We use Unleash now, and every new feature gets a flag by default.

## The Common Thread

Every scaling pain we hit came down to the same root cause: implicit knowledge that should have been explicit. The migration collision happened because deployment order was in someone's head. The RFC process exists because architectural decisions were made in DMs. Onboarding was slow because "how things work" lived in tribal memory.

The job of scaling an engineering team is not adding headcount. It is turning implicit knowledge into explicit systems — documentation, processes, automation — so that every new engineer makes the team faster rather than slower. The best engineering processes are the ones nobody notices because they just work.
