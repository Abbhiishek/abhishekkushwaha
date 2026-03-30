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

### Reading EXPLAIN ANALYZE Output

Learning to read `EXPLAIN ANALYZE` output is the single most useful database skill. Here is a real example from our candidates table (anonymized):

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name, status, applied_at
FROM candidates
WHERE organization_id = 'abc-123' AND status = 'screening'
ORDER BY applied_at DESC LIMIT 25;
```

Before adding the composite index, the plan showed:

```
Sort (cost=8234..8245 rows=4200 width=64) (actual time=342.1..342.3 rows=25)
  Sort Key: applied_at DESC
  ->  Seq Scan on candidates (cost=0..7890 rows=4200 width=64) (actual time=0.02..338.5 rows=4180)
        Filter: (organization_id = 'abc-123' AND status = 'screening')
        Rows Removed by Filter: 195820
        Buffers: shared hit=4521 read=1230
```

The sequential scan read 200,000 rows to find 4,200 matches. After adding `idx_candidates_org_status`:

```
Limit (cost=0.42..12.8 rows=25 width=64) (actual time=0.08..0.15 rows=25)
  ->  Index Scan using idx_candidates_org_status on candidates (cost=0.42..2100 rows=4200 width=64) (actual time=0.07..0.14 rows=25)
        Index Cond: (organization_id = 'abc-123' AND status = 'screening')
        Buffers: shared hit=4
```

From 342ms to 0.15ms. From reading 5,751 pages to reading 4. The `LIMIT` pushes down into the index scan because the index is already sorted by `applied_at DESC`. This is why column order in composite indexes matters — the sort column should be last.

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

## Vacuum Tuning for High-Write Tables

Autovacuum defaults are conservative. For our `interview_events` table — which receives 50,000+ inserts per day from real-time interview activity — the defaults were not aggressive enough. Dead tuples would accumulate during business hours, and sequential scans on the table would slow by 30-40% before autovacuum caught up.

We tuned per-table settings:

```sql
ALTER TABLE interview_events SET (
  autovacuum_vacuum_scale_factor = 0.01,    -- default 0.2
  autovacuum_analyze_scale_factor = 0.005,  -- default 0.1
  autovacuum_vacuum_cost_delay = 2          -- default 2ms, keep it low for this table
);
```

With `scale_factor = 0.01`, autovacuum kicks in after 1% of the table has dead tuples rather than 20%. For a table with 2 million rows, that means vacuuming starts at 20,000 dead tuples instead of 400,000. The dead tuple ratio now stays below 2% during peak hours.

## Table Partitioning for Large Tables

Our `audit_logs` table hit 50 million rows after 8 months and queries against it slowed noticeably. Full table scans that were acceptable at 5 million rows were now taking 8+ seconds.

We partitioned by month using PostgreSQL declarative partitioning:

```sql
CREATE TABLE audit_logs (
  id uuid DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  action text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

CREATE TABLE audit_logs_2025_11 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

Queries that filter by date range now hit one or two partitions instead of the full table. A query for "all audit events in November" scans ~4 million rows in one partition instead of 50 million across the entire table.

We automate partition management with a cron job that creates next month's partition on the 25th of each month. If the partition already exists (idempotent check), the job does nothing.

These patterns are not exotic. They are the basics, applied consistently. The biggest performance gains at HyrecruitAI did not come from clever tricks — they came from measuring first, then making targeted changes based on real data.
