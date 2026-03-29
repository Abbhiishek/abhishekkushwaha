---
title: "PostgreSQL Performance Patterns We Use at HyrecruitAI"
description: "Practical PostgreSQL optimization strategies — indexing, query tuning, connection pooling, and monitoring in production."
date: "2025-12-28"
tags: postgresql, database, performance, backend, drizzle
coverImage: /thumbnail.jpg
featured: false
---

HyrecruitAI processes thousands of candidate applications, interview sessions, and hiring pipeline events daily. PostgreSQL is the backbone of all of it. Over the past year, we have gone from "it works" to "it works fast and we know why." Here are the patterns that got us there.

## Indexing Strategy: Less Is More (Until It Isn't)

Our first instinct was to index everything. That backfired — write performance tanked because every INSERT had to update a dozen indexes. We now follow a simple rule: **only add an index when you can point to a slow query that needs it.**

The tools we use to find those queries:

```sql
-- Find the slowest queries in the last 24 hours
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

Once we identify a slow query, we check its plan:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM candidates
WHERE organization_id = 'abc-123'
  AND status = 'screening'
ORDER BY applied_at DESC;
```

If we see a sequential scan on a table with more than 10k rows, that is our signal. The most impactful indexes we have added are **composite indexes on columns that appear together in WHERE clauses:**

```sql
CREATE INDEX idx_candidates_org_status
ON candidates (organization_id, status, applied_at DESC);
```

Column order matters. The most selective column goes first. For us, `organization_id` filters out 95% of rows immediately.

## Partial Indexes for Hot Paths

Not every row needs to be indexed. Our interview scheduling query only cares about upcoming interviews:

```sql
CREATE INDEX idx_interviews_upcoming
ON interviews (scheduled_at)
WHERE status = 'scheduled' AND scheduled_at > NOW();
```

This index is a fraction of the size of a full index on `scheduled_at` and covers the query that runs hundreds of times per hour.

## Query Optimization Patterns

A few patterns that made the biggest difference:

**Avoid SELECT * in production code.** We use Drizzle ORM, which makes column selection natural:

```typescript
const candidates = await db
  .select({
    id: schema.candidates.id,
    name: schema.candidates.name,
    status: schema.candidates.status,
  })
  .from(schema.candidates)
  .where(eq(schema.candidates.organizationId, orgId));
```

**Push pagination to the database.** We replaced offset pagination with cursor-based pagination for any list that could grow beyond a few hundred rows:

```typescript
const nextPage = await db
  .select()
  .from(schema.candidates)
  .where(
    and(
      eq(schema.candidates.organizationId, orgId),
      lt(schema.candidates.appliedAt, cursor)
    )
  )
  .orderBy(desc(schema.candidates.appliedAt))
  .limit(25);
```

Offset pagination gets slower as the offset grows. Cursor pagination is constant time regardless of how deep you are in the list.

## Connection Pooling Is Not Optional

We learned this the hard way. Our API server would occasionally fail with "too many connections" errors during traffic spikes. The fix was PgBouncer in transaction mode sitting between our app and PostgreSQL.

Key settings that work for us:

- **Pool mode:** transaction (connections are returned to the pool after each transaction)
- **Default pool size:** 25 per app instance
- **Max client connections:** 200
- **Server idle timeout:** 600 seconds

With Drizzle, connecting through PgBouncer is just a connection string change — no code modifications needed.

## Monitoring That Actually Helps

We track four metrics that tell us when something is going wrong before users notice:

- **Query duration p95** — alerts if it exceeds 500ms
- **Active connections** — alerts above 80% of pool capacity
- **Cache hit ratio** — should stay above 99% for a healthy database
- **Dead tuples ratio** — indicates whether autovacuum is keeping up

```sql
-- Check cache hit ratio
SELECT
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS ratio
FROM pg_statio_user_tables;
```

If the cache hit ratio drops below 99%, we are either missing indexes (causing full scans) or our dataset has outgrown the available shared_buffers.

## Migrations Without Downtime

We use Drizzle Kit for migrations and follow one rule: **never lock a table for more than a few seconds in production.** That means:

- Add columns as nullable first, backfill, then add the NOT NULL constraint
- Create indexes with `CONCURRENTLY` to avoid blocking writes
- Never rename columns in a single migration — add the new one, migrate data, drop the old one

These patterns are not exotic. They are the basics, applied consistently. The biggest performance gains at HyrecruitAI did not come from clever tricks — they came from measuring first, then making targeted changes based on real data.
