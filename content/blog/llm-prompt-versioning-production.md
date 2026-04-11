---
title: "Prompt Versioning in Production: How We Stopped Shipping Prompt Changes Blind"
description: "How we built a lightweight prompt versioning system at HyrecruitAI to track, test, and roll back LLM prompts without deploying code."
date: "2026-04-10"
tags: llm, prompt-engineering, production, ai, typescript
coverImage: /thumbnail.jpg
featured: false
---

Early on at HyrecruitAI, we shipped a prompt change on a Friday afternoon. By Monday, our interview evaluation scores had drifted—some candidates who should have scored 7/10 were getting 4s, others were getting inflated 9s. We had no idea which prompt version caused it, no rollback mechanism, and no way to compare outputs across versions. We had treated prompts like config strings instead of first-class production artifacts.

That Friday incident cost us three days of debugging and a difficult conversation with an early enterprise customer. Here's how we fixed it.

## The Problem

At HyrecruitAI, prompts are not static. We have prompts for:
- **Interview question generation** — based on job description, experience level, and role
- **Answer evaluation** — scoring candidate responses on rubrics like relevance, depth, communication
- **Follow-up probing** — generating contextual follow-up questions mid-interview
- **Feedback synthesis** — summarizing a full interview into a structured hiring recommendation

Each of these prompts evolved rapidly. In our first three months, the evaluation prompt alone went through 40+ iterations. The core problems were:

1. **No diff history.** Prompts lived in environment variables or hardcoded strings inside service files. `git blame` could tell us who changed it, not *why*.
2. **No A/B testing.** We couldn't run two prompt versions against the same input and compare outputs systematically.
3. **No rollback.** When something broke, we'd scramble to remember what the prompt looked like two weeks ago.
4. **No observability.** We couldn't correlate a specific evaluation result with the exact prompt that generated it.

The solution was to treat prompts like database migrations: versioned, auditable, and deployable independently of code.

## The Solution: Prompt Registry with Versioned Slots

We built a lightweight **Prompt Registry** — a database-backed service that stores prompt versions, exposes an API for resolving the active version per slot, and logs every LLM call with a prompt version ID.

Here's the core schema using Drizzle ORM:

```typescript
// packages/db/src/schema/prompt.ts
import { pgTable, text, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";

export const promptSlots = pgTable("prompt_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // e.g. "eval-v2", "question-gen"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const promptVersions = pgTable("prompt_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  slotId: uuid("slot_id").references(() => promptSlots.id),
  version: integer("version").notNull(),
  body: text("body").notNull(),           // The actual prompt text
  isActive: boolean("is_active").default(false),
  activatedAt: timestamp("activated_at"),
  activatedBy: text("activated_by"),     // User ID or "system"
  changelog: text("changelog"),          // Why this version was created
  createdAt: timestamp("created_at").defaultNow(),
});

export const promptCallLog = pgTable("prompt_call_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  slotId: uuid("slot_id").references(() => promptSlots.id),
  versionId: uuid("version_id").references(() => promptVersions.id),
  inputHash: text("input_hash"),         // SHA-256 of variables injected
  outputHash: text("output_hash"),       // SHA-256 of LLM response
  latencyMs: integer("latency_ms"),
  model: text("model"),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

The registry exposes a simple resolution function:

```typescript
// packages/lib/src/prompt-registry.ts
import { db } from "@hyrecruitai/db";
import { promptSlots, promptVersions } from "@hyrecruitai/db/schema";
import { eq, and } from "drizzle-orm";

export type PromptVariables = Record<string, string | number>;

export async function resolvePrompt(
  slug: string,
  variables: PromptVariables
): Promise<{ body: string; versionId: string }> {
  const result = await db
    .select({
      body: promptVersions.body,
      versionId: promptVersions.id,
    })
    .from(promptVersions)
    .innerJoin(promptSlots, eq(promptSlots.id, promptVersions.slotId))
    .where(
      and(
        eq(promptSlots.slug, slug),
        eq(promptVersions.isActive, true)
      )
    )
    .limit(1)
    .then((rows) => rows[0]);

  if (!result) {
    throw new Error(`No active prompt found for slot: ${slug}`);
  }

  const rendered = interpolate(result.body, variables);
  return { body: rendered, versionId: result.versionId };
}

function interpolate(template: string, vars: PromptVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in vars)) throw new Error(`Missing prompt variable: ${key}`);
    return String(vars[key]);
  });
}
```

All LLM calls now go through a wrapper that logs the prompt version alongside latency and token usage:

```typescript
// packages/lib/src/llm-client.ts
import { resolvePrompt } from "./prompt-registry";
import { logPromptCall } from "./prompt-logger";
import { createHash } from "crypto";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function callLLM(
  slug: string,
  variables: Record<string, string | number>,
  options: { model?: string; maxTokens?: number } = {}
) {
  const { body, versionId } = await resolvePrompt(slug, variables);
  const model = options.model ?? "claude-sonnet-4-6";
  const start = Date.now();

  const response = await client.messages.create({
    model,
    max_tokens: options.maxTokens ?? 1024,
    messages: [{ role: "user", content: body }],
  });

  const latencyMs = Date.now() - start;
  const content = response.content[0].type === "text"
    ? response.content[0].text
    : "";

  await logPromptCall({
    slug,
    versionId,
    inputHash: sha256(JSON.stringify(variables)),
    outputHash: sha256(content),
    latencyMs,
    model,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  });

  return { content, versionId };
}

const sha256 = (s: string) =>
  createHash("sha256").update(s).digest("hex");
```

## The Iteration: What Failed First

**Attempt 1: Plain environment variables.** We started with `EVAL_PROMPT_V1`, `EVAL_PROMPT_V2` env vars toggled via feature flags. This broke immediately — the prompt text was too long for env vars in some CI environments, and we had no audit trail of who activated what when.

**Attempt 2: Versioned files in Git.** We stored prompts in `prompts/eval/v1.txt`, `prompts/eval/v2.txt` and loaded the active version via a config key. This was better for diffing, but required a deploy to activate a new version. Prompts were tied to code deploys again.

**Attempt 3: Database registry (current).** Moving to a database table gave us:
- Activation without a code deploy (toggle via admin panel or CLI)
- Full audit trail with `activatedBy` and `activatedAt`
- Correlation between every LLM call and the exact prompt version that produced it
- Rollback in under 30 seconds (flip `isActive` via admin or migration)

We added one more layer: a **shadow testing mode**. Before activating a new prompt version, we can run it in shadow mode — it executes alongside the active version on real traffic, logs both outputs, but only returns the active version's response to the user. We compare outputs async to catch regressions before going live.

```typescript
// Shadow mode comparison (runs async, doesn't block response)
export async function callLLMWithShadow(
  slug: string,
  variables: Record<string, string | number>,
  shadowVersionId?: string
) {
  const primary = callLLM(slug, variables);

  if (shadowVersionId) {
    // Fire shadow call without awaiting — log both for comparison
    callLLMWithVersion(slug, shadowVersionId, variables)
      .then((shadow) => compareShadowOutputs(primary, shadow, slug))
      .catch(() => {}); // Shadow failures never surface to user
  }

  return primary;
}
```

## Architecture / Flow Diagram

```
┌────────────────────────────────────────────┐
│              Interview Service              │
│                                            │
│  callLLM("eval-answer", { answer, rubric }) │
│               │                            │
└───────────────┼────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│            Prompt Registry                 │
│                                            │
│  promptSlots ──► promptVersions            │
│  slug="eval-answer"                        │
│  version=12 (isActive=true) ──► body       │
│               │                            │
└───────────────┼────────────────────────────┘
                │  interpolate(body, vars)
                ▼
┌────────────────────────────────────────────┐
│             Anthropic API                  │
│  model: claude-sonnet-4-6                  │
│  latency: 1.2s / tokens: 840              │
└───────────────┬────────────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
   response         prompt_call_log
   returned         (versionId=v12,
   to caller         inputHash, outputHash,
                      latencyMs, tokensUsed)

Activation path:
Admin UI ──► PATCH /api/prompts/:versionId/activate
         ──► db: isActive=true on v12, false on v11
         ──► next callLLM picks up v12
```

## Learnings & Outcomes

After 6 weeks running the prompt registry in production:

- **Rollback time: 3 days → 30 seconds.** The Friday incident would have been resolved by flipping `isActive` on the previous version instead of hunting through git history.
- **Prompt iteration speed: 2x faster.** Engineers can activate new prompt versions from the admin panel without waiting for a deploy. PM and non-engineers can now safely participate in prompt tuning.
- **Regression detection: caught 3 regressions before they hit users** using shadow mode. All three were evaluation prompt changes that subtly shifted scoring distributions.
- **Token cost visibility: improved 40%.** The call log revealed that one prompt slot was using 2x the tokens of an equivalent rewrite. We optimized it and cut $380/month in API costs.
- **Audit trail:** Every evaluation result now links to the exact prompt version that produced it. Customer disputes are resolved in minutes instead of "we're not sure what prompt ran then."

## Suggestions for Engineers Building Similar Systems

**Keep the schema simple.** A `slots` table and a `versions` table is enough to start. Don't over-engineer a full workflow engine on day one.

**Log everything at the call site.** Input hash, output hash, latency, tokens — logging these from day one made all our retrospective analysis possible. We wish we'd had this data from the very first prompt.

**Decouple activation from deployment.** The biggest win isn't versioning — it's the ability to activate a new prompt without touching code. This alone changes how fast you can iterate.

**Use changelogs on versions.** Require a `changelog` field before a version can be activated. Even one sentence ("switched to chain-of-thought framing for rubric scoring") is invaluable when debugging a regression three weeks later.

**Shadow testing beats staging environments.** Real traffic has edge cases staging doesn't. Running a new prompt version on shadow traffic for 24 hours before activation is the best regression signal we've found.

**Don't let prompts grow unbounded.** Set a soft limit on version count per slot (we use 20). Archive older versions to a cold table instead of deleting — you may want to re-examine them.

Treating prompts as a first-class production artifact — versioned, logged, rollback-able, and activatable independently of code deploys — is one of the highest-leverage changes we've made to our AI infrastructure. The cost was two days of implementation. The payoff has been continuous.
