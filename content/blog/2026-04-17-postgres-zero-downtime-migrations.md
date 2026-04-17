---
title: "The ALTER TABLE That Killed My Deploy"
description: "How a single schema migration took down production for 4 minutes, and the expand-contract pattern that fixed it."
date: "2026-04-17"
tags: postgres, database, migrations, backend
coverImage: /thumbnail.jpg
featured: false
---

The migration looked harmless. Add a column, give it a default, mark it NOT NULL. Twelve lines of SQL. I'd written it in two minutes and run it against staging without a second thought.

Production was a different story.

The deploy kicked off. The migration runner started. Forty seconds in, my monitoring dashboard lit up: p99 latency spiked from 80ms to 31 seconds. The health check endpoint started failing. The load balancer started cycling the app. By the time I killed the migration job manually, 4 minutes had passed and the incident channel was full.

The table had 2.1 million rows. I'd forgotten that `ALTER TABLE ... ADD COLUMN ... NOT NULL DEFAULT` in Postgres rewrites the entire table. That rewrite holds an `ACCESS EXCLUSIVE` lock the whole time, blocking every read and every write behind it. With 2.1M rows and a few text columns, the rewrite took long enough to cascade through the connection pool, saturate the queue, and trip the health check.

That was my introduction to zero-downtime migrations.

## What Postgres Actually Does with ALTER TABLE

Not all schema changes are equal. Some are instant. Some rewrite the table. Some acquire lock levels that block reads. The documentation is correct about this, but correct documentation you haven't read is not useful at 2am.

An `ACCESS EXCLUSIVE` lock blocks everything: reads, writes, other DDL. Postgres acquires it for table rewrites, for `ADD COLUMN NOT NULL DEFAULT` on Postgres 10 and below, and for `SET NOT NULL` on existing data that has not been pre-validated.

There are two separate problems here and they compound:

1. **Rewrite cost.** If Postgres has to touch every row, the lock is held for as long as that takes. On large tables this is minutes.
2. **Lock queue buildup.** Even a brief DDL operation has to wait for all running transactions to finish first. While it waits, every new query queues behind it. A DDL statement holding `ACCESS EXCLUSIVE` is a traffic jam in a one-lane tunnel. The jam does not clear when the DDL finishes; it clears when everything behind it drains.

The second problem is more insidious because it can happen even on fast migrations. An index creation that takes 50ms can cause 30 seconds of visible slowness if it has to wait on a 5-minute analytics query and 400 requests queue behind it.

```sql
-- This is what killed production.
-- Postgres 10 and below rewrites the table for NOT NULL + DEFAULT.
-- Postgres 11+ handles constant defaults without a rewrite,
-- but computed defaults, sequences, or function calls still rewrite in all versions.
ALTER TABLE candidates
  ADD COLUMN resume_score FLOAT NOT NULL DEFAULT 0.0;
```

```sql
-- Run this while a migration hangs. It shows lock chains.
SELECT
  blocking.pid           AS blocking_pid,
  left(blocking.query, 80) AS blocking_query,
  blocked.pid            AS blocked_pid,
  left(blocked.query, 80)  AS blocked_query,
  now() - blocked.query_start AS blocked_duration
FROM pg_stat_activity AS blocked
JOIN pg_stat_activity AS blocking
  ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
WHERE blocked.wait_event_type = 'Lock'
ORDER BY blocked_duration DESC;
```

That query is the first thing I open when a migration is slow. The `blocking_query` column tells you what is holding the door shut. Usually it is a long-running transaction that started before the migration and has not committed.

## The Expand-Contract Pattern

The fix is to decompose one migration into multiple phases, each requiring only a safe lock level. The pattern is called expand-contract, sometimes parallel-change. The idea is simple: never remove or constrain something until all code has stopped depending on the old shape.

**Phase 1: Expand**

Add the column nullable, no default, no NOT NULL. This is a metadata-only operation in modern Postgres and completes in milliseconds regardless of table size.

```sql
-- Phase 1: metadata-only, no rewrite, lock held for ~5ms
ALTER TABLE candidates ADD COLUMN resume_score FLOAT;
```

Deploy this. The column exists, it is nullable, and existing code that does not touch it continues unchanged.

**Phase 2: Backfill**

Populate existing rows in batches. Never do a single UPDATE across all rows. One giant UPDATE is the same problem: a massive transaction, a huge write-ahead log entry, and a write lock held across the whole table for the duration.

```typescript
import { db } from "@/lib/db";

const BATCH_SIZE = 500;
const PAUSE_MS = 50;

async function backfillResumeScores(): Promise<void> {
  let lastId = 0;
  let total = 0;

  while (true) {
    const rows = await db
      .selectFrom("candidates")
      .select(["id", "resume_text"])
      .where("id", ">", lastId)
      .where("resume_score", "is", null)
      .orderBy("id", "asc")
      .limit(BATCH_SIZE)
      .execute();

    if (rows.length === 0) break;

    for (const row of rows) {
      const score = computeScore(row.resume_text);
      await db
        .updateTable("candidates")
        .set({ resume_score: score })
        .where("id", "=", row.id)
        .execute();
    }

    total += rows.length;
    lastId = rows[rows.length - 1].id;

    process.stdout.write(`\rBackfilled ${total} rows, cursor at id ${lastId}`);
    await new Promise((r) => setTimeout(r, PAUSE_MS));
  }

  console.log(`\nDone. Total: ${total}`);
}
```

The pause between batches matters. 50ms gives Postgres time to flush WAL, lets replication lag recover, and prevents the backfill from saturating I/O during peak traffic. For tables larger than 10M rows, drop the batch size to 200 and increase the pause to 100ms. Run this script as a standalone job outside the normal deploy, during off-peak hours.

**Phase 3: Constrain without full-table validation**

Once the backfill completes, add the NOT NULL constraint using the `NOT VALID` form. This skips scanning existing rows (trusting your backfill), only enforcing the constraint on new inserts and updates.

```sql
-- Phase 3a: safe lock level, skips existing row scan
ALTER TABLE candidates
  ADD CONSTRAINT candidates_resume_score_not_null
  CHECK (resume_score IS NOT NULL) NOT VALID;

-- Phase 3b: validates existing rows
-- acquires SHARE UPDATE EXCLUSIVE, which allows concurrent reads AND writes
ALTER TABLE candidates
  VALIDATE CONSTRAINT candidates_resume_score_not_null;
```

`VALIDATE CONSTRAINT` acquires `SHARE UPDATE EXCLUSIVE`, not `ACCESS EXCLUSIVE`. This lock level allows concurrent reads and writes. It will wait for long-running transactions but will not block new queries from starting. That is the crucial difference: new requests keep flowing while validation scans the table.

After validation succeeds, promote the column to a proper NOT NULL constraint:

```sql
-- Phase 3c: both of these are metadata-only because Postgres knows the column is clean
ALTER TABLE candidates DROP CONSTRAINT candidates_resume_score_not_null;
ALTER TABLE candidates ALTER COLUMN resume_score SET NOT NULL;
```

The final `SET NOT NULL` on a column that Postgres has already verified is non-null completes in microseconds. It is a catalog update, not a table scan.

**Phase 4: Contract**

If you were replacing an old column, you drop it here. Once the application no longer references it and the backfill is complete, the old column is dead weight.

```sql
ALTER TABLE candidates DROP COLUMN old_score_field;
```

## Architecture / Flow Diagram

```
Deploy pipeline
      |
      v
[Migration runner] ----Phase 1 DDL----> [Postgres: ADD COLUMN resume_score FLOAT]
                                                |
                                         lock: RowExclusiveLock, held ~5ms
                                         no rewrite, no rows touched

[Backfill script] ----batched UPDATEs-> [Postgres: UPDATE 500 rows at a time]
      |                                         |
      |<------50ms pause between batches--------|
      |                                         |
      |                                  WAL flushed, replication catches up
      |                                  pg_stat_activity monitored throughout
      |
[Migration runner] ---Phase 3a DDL----> [Postgres: ADD CONSTRAINT ... NOT VALID]
                                                |
                                         lock: ShareUpdateExclusiveLock, held ~10ms
                                         new rows enforced immediately

[Migration runner] ---Phase 3b DDL----> [Postgres: VALIDATE CONSTRAINT]
                                                |
                                         lock: ShareUpdateExclusiveLock
                                         concurrent reads + writes allowed
                                         table scanned row-by-row in background

[Migration runner] ---Phase 3c DDL----> [Postgres: DROP CONSTRAINT]
                                         [Postgres: SET NOT NULL]
                                                |
                                         lock: catalog-only, ~5ms each

[Migration runner] ---Phase 4 DDL----> [Postgres: DROP COLUMN (if applicable)]
                                                |
                                         lock: AccessExclusiveLock, held <10ms
                                         metadata-only, no rewrite
```

Every arrow into Postgres carries a SQL statement. Every arrow back carries an acknowledgment or error. The pause arrows in Phase 2 are deliberate time gaps: they exist to protect I/O headroom and replication lag, not because of any technical constraint.

## Indexing Is the Same Problem

Indexes have their own version of this trap. A naive `CREATE INDEX` locks writes for the entire build duration. Use `CONCURRENTLY`:

```sql
-- This blocks all writes for the full build duration. Do not use on large tables.
CREATE INDEX idx_candidates_score ON candidates (resume_score);

-- This runs as a background operation. Reads and writes continue.
-- Takes longer (two table scans) and cannot run inside a transaction.
CREATE INDEX CONCURRENTLY idx_candidates_score ON candidates (resume_score);
```

If a concurrent index build fails midway, Postgres leaves an `INVALID` index behind. It takes up space and slows writes without helping any queries. Check for them:

```bash
psql "$DATABASE_URL" -c "
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename = 'candidates'
  AND indexname IN (
    SELECT relname FROM pg_class
    WHERE relkind = 'i' AND NOT relisvalid
  );
"
```

Drop any invalid indexes explicitly before retrying the concurrent build. Postgres will not do it automatically.

## Principles

**Staging must have production-scale data.** The original migration passed staging in 2 seconds on 3,000 rows. Production had 2.1 million. The gap between staging and production data volume is the single most reliable source of migration surprises. Restore a production snapshot to staging weekly, or at minimum run a data generator that produces at least 10% of production volume. If you cannot do either, assume every migration will behave differently in production than it did in staging.

**Set a lock timeout on your migration connection.** Without it, a migration that cannot acquire a lock will wait indefinitely while requests queue up behind it. With it, the migration fails fast, your deploy reports an error, and the application keeps running:

```sql
SET lock_timeout = '3s';

ALTER TABLE candidates ADD COLUMN resume_score FLOAT;
```

Fast failure is the correct outcome when the alternative is a minutes-long lock queue that cascades into a health check failure.

**One migration, one deploy does not survive large tables.** Expand-contract means at least three separate deploy cycles for a NOT NULL column add. Build that into your process. Engineers who are not aware of this will schedule migrations on the critical path of a release and be surprised when the release takes 30 minutes longer than planned.

**Know what your migration framework generates.** Drizzle, Prisma, and other ORMs emit different SQL depending on version and configuration. A migration that looks like `ADD COLUMN NOT NULL DEFAULT` in your schema diff might generate a table-rewriting statement or it might not. Run `EXPLAIN` on the generated SQL in a staging database with representative data before running it anywhere near production.

## Numbers

Original approach, 2.1M row table:

| Metric | Value |
|---|---|
| Migration duration | 3m 47s |
| Lock type held | ACCESS EXCLUSIVE |
| p99 latency during migration | 31.4 seconds |
| Requests queued | ~1,200 |
| Effective downtime (health check cycling) | 4 minutes |

Expand-contract approach, same table:

| Phase | Duration | Lock type | User impact |
|---|---|---|---|
| ADD COLUMN | 12ms | RowExclusiveLock | none |
| Backfill (500 rows/batch, 50ms pause) | 22 minutes elapsed | none | none |
| ADD CONSTRAINT NOT VALID | 18ms | ShareUpdateExclusiveLock | none |
| VALIDATE CONSTRAINT | 2m 11s | ShareUpdateExclusiveLock | none |
| SET NOT NULL | 8ms | catalog-only | none |
| p99 during entire operation | 83ms | | baseline |

The backfill took 22 minutes. Users had no idea it was happening. The constraint validation took 2 minutes. p99 stayed at 83ms throughout. The migration that caused a 4-minute outage became a background operation that left nothing in the request logs.

That is what zero-downtime actually means. Not "we finished fast." Fast is a proxy metric. The real requirement is that user-facing latency does not move. Expand-contract achieves that by separating the work that requires locks from the work that does not, and by using the weakest lock that gets the job done.
