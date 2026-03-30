---
title: "Technical Decisions That Shaped HyrecruitAI"
description: "The key technical bets we made building an AI hiring platform — and which ones paid off."
date: "2025-05-18"
tags: startup, architecture, nextjs, infrastructure, decisions
coverImage: /thumbnail.jpg
featured: false
---

Every startup is a series of bets. Some of those bets are about product and market. A surprising number of them are about technology. As CTO of HyrecruitAI, I have made dozens of technical decisions that shaped how fast we ship, how well things scale, and how much sleep I get at night. Here are the ones that mattered most.

## How We Evaluate Technical Decisions

Before diving into specifics, our decision framework evaluates every major technical choice on three axes:

- **Time-to-ship:** How fast can we build the first working version? At a seed stage, shipping speed is survival.
- **Operational burden:** How much babysitting does this require? We do not have a dedicated SRE team. Every hour spent on infrastructure is an hour not spent on product.
- **Hiring leverage:** How easy is it to find engineers who know this? Exotic tech stacks shrink your talent pool exactly when you need to grow it.

Most of our best decisions scored well on all three. The few that scored poorly on one axis caused pain that lasted months.

## Next.js as the Full-Stack Framework

The first big decision was choosing Next.js instead of building a separate React frontend and Node.js backend. This was controversial even within our small team.

**Why we chose it:**

- Server components and API routes in one codebase meant one deployment, one CI pipeline, one mental model
- Server-side rendering out of the box for our public-facing pages (SEO matters for a B2B product)
- The App Router gave us layouts, loading states, and error boundaries without extra libraries
- Vercel's deployment story is hard to beat for a team of three

**What we gave up:**

- Backend-heavy logic sometimes feels awkward in Next.js API routes — we eventually moved compute-intensive work (AI inference, bulk processing) to separate Azure Container Apps workers when a single API route started timing out at the 30-second Vercel limit
- The App Router was immature when we started, and we hit several bugs that required workarounds. `revalidatePath` did not work correctly with dynamic routes for the first two months.

**The measurable win:** Server components cut our Largest Contentful Paint from 2.8s to 1.1s on the hiring manager dashboard. For a B2B product where users refresh dozens of times a day, that responsiveness gap is noticeable.

Looking back, this was the right call. The speed advantage of having one developer go from database query to UI component in a single PR is enormous at the early stage.

## Monorepo Over Polyrepo

We went monorepo from day one using Turborepo. The alternative was separate repos for the frontend, API, and shared types.

The monorepo gave us:

- **Atomic PRs** — a feature that touches the API schema and the frontend form ships in one pull request, reviewed together
- **Shared types** — Zod schemas defined once, imported everywhere, zero type drift
- **Unified CI** — one pipeline to maintain, with Turborepo's caching making it fast

The cost is tooling complexity. Our CI configuration is more involved than a single-repo setup, and new engineers need to understand the workspace structure. But for a small team shipping fast, the tradeoffs are overwhelmingly positive.

## Drizzle ORM Over Prisma

This was a closer call. Prisma is more mature and has better documentation. We chose Drizzle because:

- **SQL-like API** — our team thinks in SQL, and Drizzle's query builder maps closely to the SQL it generates
- **No code generation step** — Prisma's generate step added friction to our development loop
- **Better performance for complex queries** — Drizzle gives you more control over the exact SQL that runs
- **TypeScript-native** — the type inference is excellent without a separate schema language

We pair Drizzle with Drizzle Kit for migrations and have not regretted the choice. For the full comparison with benchmarks and migration details, see [Why We Chose Drizzle ORM Over Prisma](/blog/drizzle-orm-production).

The specific query that pushed us over the edge was an analytics dashboard query joining interviews, evaluations, and companies with conditional aggregation. In Prisma, it required two separate queries and JavaScript-side aggregation. In Drizzle, it was a single typed query that generated exactly the SQL we would have written by hand.

## Managed Infrastructure on Azure

We run on Azure, which might surprise people who expect a startup to default to AWS or go fully serverless. The reason is pragmatic: we got Azure credits through a startup program, and Azure's managed PostgreSQL (Flexible Server) and Container Apps gave us everything we needed without managing infrastructure ourselves.

Our infrastructure philosophy:

- **Managed databases always** — we do not have a DBA, and we do not want to wake up at 3 AM because a PostgreSQL instance ran out of disk
- **Containers for everything else** — Azure Container Apps for the API and workers, with autoscaling rules based on queue depth
- **GitHub Actions for CI/CD** — simple, free for our usage tier, and the ecosystem of actions is massive

Our monthly infrastructure cost at approximately 1,000 daily active users breaks down as: PostgreSQL Flexible Server ~$120, Container Apps (API + 2 workers) ~$80, Blob Storage (interview recordings) ~$40, Azure Speech Services ~$150, everything else (Key Vault, Application Insights, CDN) ~$30. Total: roughly $420/month. The Azure for Startups program covered the first 8 months entirely.

We will probably move some workloads to AWS eventually for specific services, but the "use whatever gives you credits and gets out of your way" approach has served us well. For our CI/CD pipeline details, see [From Code to Production: Our CI/CD Pipeline with Azure and GitHub Actions](/blog/azure-github-actions-cicd).

## What I Would Do Differently

**Invest in observability earlier.** We added OpenTelemetry with Grafana Cloud and Sentry six months in. The first week surfaced three bugs: a memory leak in the transcription worker (it was not releasing audio buffers after processing), a race condition in the signaling server (two candidates joining the same room simultaneously), and a database query doing a sequential scan on the 200k-row candidates table on every dashboard load. All three had been silently degrading performance for weeks.

**Set up feature flags from the start.** We shipped directly to production for the first four months. The first time a half-finished feature leaked to users — a partially working analytics dashboard that showed incorrect numbers — we scrambled to revert. We now use Unleash (self-hosted, free tier) and every new feature gets a flag by default. The overhead is minimal: a `useFlag('feature-name')` hook in the frontend and a middleware check in the API.

**Write ADRs (Architecture Decision Records).** We made these decisions through Slack conversations and verbal discussions. Six months later, nobody remembers why we chose X over Y. Writing a one-page ADR for each significant decision would have cost 30 minutes and saved hours of re-discussion. We now have 23 ADRs. Our format is simple: Context (what situation led to this), Decision (what we chose), Consequences (what became easier, what became harder). They live in `docs/adrs/` and are part of every new engineer's onboarding reading.

For the broader story of how our team and processes scaled alongside these technical decisions, see [Scaling Engineering Teams: Lessons from Building HyrecruitAI](/blog/scaling-engineering-teams).

The best technical decision is the one that lets your team ship the next feature without fighting the previous ones. At HyrecruitAI, that meant optimizing for developer speed, leaning on managed services, and keeping the architecture simple enough that any engineer on the team can understand the full system.
