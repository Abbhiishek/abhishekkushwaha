---
title: "Why We Chose Drizzle ORM Over Prisma for Production"
description: "A practical comparison of Drizzle and Prisma from the perspective of running a production SaaS — type safety, migrations, and query performance."
date: "2025-10-05"
tags: drizzle, prisma, orm, postgresql, typescript
coverImage: /thumbnail.jpg
featured: false
---

# Why We Chose Drizzle ORM Over Prisma for Production

Every TypeScript team building on PostgreSQL eventually faces this decision: Prisma or Drizzle? We started HyrecruitAI with Prisma, ran it in production for four months, then migrated to Drizzle. Here is why.

## The Prisma Experience

Prisma is genuinely good for getting started. The schema DSL is clean, `prisma migrate` is straightforward, and the generated client gives you solid autocompletion. For our first three months, it worked fine.

The friction started when our queries got complex. We needed multi-table joins with conditional filters, aggregations for analytics dashboards, and CTEs for our reporting pipeline. Prisma's query API kept pushing us toward multiple round trips or raw SQL escape hatches.

```typescript
// Prisma: Two queries where one would do
const interviews = await prisma.interview.findMany({
  where: { companyId },
  include: { evaluations: true },
});
// Then filter/aggregate in JavaScript
const stats = interviews.map(i => computeStats(i.evaluations));
```

The other pain point was the generated client size. Prisma generates a Node.js query engine binary that added ~15MB to our deployment artifact. In a serverless context, that matters.

## Why Drizzle Won

Drizzle takes a fundamentally different approach. Instead of generating a client from a schema file, you define your schema in TypeScript and get type-safe queries that map directly to SQL.

### Type Safety Without Code Generation

Drizzle schemas are just TypeScript:

```typescript
export const interviews = pgTable('interviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  candidateName: text('candidate_name').notNull(),
  status: text('status', { enum: ['scheduled', 'in_progress', 'completed'] }).notNull(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

No `prisma generate` step. No watching for schema changes. The types flow directly from the table definitions to your queries. When I change a column, TypeScript catches every broken reference at compile time.

### Queries That Think in SQL

The biggest win is the relational query builder. Complex joins, subqueries, and aggregations feel natural because Drizzle does not try to hide SQL -- it wraps it in type safety:

```typescript
const results = await db
  .select({
    companyName: companies.name,
    totalInterviews: count(interviews.id),
    avgScore: avg(evaluations.overallScore),
  })
  .from(companies)
  .leftJoin(interviews, eq(interviews.companyId, companies.id))
  .leftJoin(evaluations, eq(evaluations.interviewId, interviews.id))
  .groupBy(companies.id)
  .having(gt(count(interviews.id), 0));
```

That is one query, fully typed, readable, and it generates exactly the SQL you would write by hand.

### Migration Workflow

Drizzle Kit handles migrations with a `push` command for development and `generate` plus `migrate` for production:

```bash
# Development: push schema changes directly
bunx drizzle-kit push

# Production: generate migration SQL, review it, apply it
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

We review every generated migration file before it runs in CI. The SQL is readable and predictable -- no surprises.

## Performance Comparison

We benchmarked both ORMs against our production query patterns:

- **Simple CRUD**: Negligible difference. Both are fast enough.
- **Complex joins (3+ tables)**: Drizzle generated single queries where Prisma often produced N+1 patterns. 40-60% fewer database round trips.
- **Cold start time**: Drizzle added ~50ms to cold starts vs Prisma's ~300ms (due to the query engine initialization).
- **Bundle size**: Drizzle added ~500KB to our deployment. Prisma added ~15MB.

## The Migration

Moving from Prisma to Drizzle took us about two weeks for a codebase with ~40 database models. The approach:

1. Wrote Drizzle schemas that matched our existing Prisma schema exactly
2. Ran both ORMs in parallel for a week (Drizzle for reads, Prisma for writes)
3. Migrated writes to Drizzle module by module
4. Removed Prisma entirely

The hardest part was rewriting our seed scripts. The actual query migration was mechanical -- Drizzle's API is intuitive enough that most conversions were one-to-one.

## When Prisma Still Makes Sense

I would still recommend Prisma for teams that want a batteries-included ORM with excellent documentation and a gentler learning curve. If your queries are mostly simple CRUD, the differences are marginal.

But if you are building something with complex data access patterns, care about bundle size, or just prefer staying close to SQL while keeping type safety -- Drizzle is the better tool. For HyrecruitAI, it was the right call.
