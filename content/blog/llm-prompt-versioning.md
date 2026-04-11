---
title: "How We Version and Safely Deploy LLM Prompts Across Interview Types"
description: "A practical system for managing prompt versions, running A/B tests, and rolling back without a full redeploy — built for HyrecruitAI's verbal, coding, and quiz evaluations."
date: "2026-04-05"
tags: llm, prompt-engineering, ai, typescript, backend
coverImage: /thumbnail.jpg
featured: false
---

Six months into running AI-generated interview reports at HyrecruitAI, we had a problem that no one warned us about: **prompt drift**.

We were iterating fast — tweaking evaluation criteria, adjusting scoring rubrics, adding edge case handling for different seniority levels. Every change was a direct code edit, a full redeploy, and a silent hope that nothing regressed. Our verbal interview prompts alone went through 23 edits in one sprint. Half of them made things worse. We had no rollback story except `git revert` and redeploying.

The metrics told the story clearly: report quality scores (measured by internal reviewer ratings) dropped from 4.3/5 to 3.8/5 over two weeks. We didn't notice until a candidate complained that their coding interview feedback was "generic and missed the actual bugs."

This post covers the system we built to version prompts like code, deploy them safely, and A/B test evaluation strategies without touching application logic.

---

## The Problem: Prompts Are Config, Not Code

When we started, prompts lived inline in TypeScript files:

```typescript
// packages/lib/src/prompts/report/verbal.ts — the old way
export const VERBAL_REPORT_PROMPT = `
You are an expert technical interviewer evaluating a verbal interview response.
Assess the candidate's communication, technical depth, and problem-solving approach.
Score from 1-10 on each dimension.
`;
```

This looks fine until you have:
- 3 interview types (verbal, coding, quiz), each with 4–6 prompt variants
- Different prompt strategies for junior vs senior roles
- Weekly iteration cycles from the product team
- A need to compare "old prompt" vs "new prompt" across the same interview corpus

Every prompt change required a code review, merge, and deployment. Worse, if we wanted to test whether a new rubric improved scores, we had no infrastructure for it — we'd ship and pray.

We needed prompts to be **first-class versioned artifacts**, decoupled from the application code that uses them.

---

## The Architecture

We landed on a three-layer system:

1. **Prompt Registry** — TypeScript objects with explicit versioning, stored in a dedicated package
2. **Prompt Resolver** — runtime logic that picks the right version based on context (role, interview type, active experiments)
3. **Experiment Config** — a lightweight feature flag structure that routes candidates to prompt variants

### Layer 1: The Prompt Registry

```typescript
// packages/lib/src/prompts/registry.ts

export interface PromptVersion {
  version: string;          // semver: "1.0.0", "1.1.0", etc.
  createdAt: string;        // ISO date
  author: string;
  changelog: string;
  template: string;         // The actual prompt text with {{variable}} slots
  variables: string[];      // Required interpolation keys
  tags: string[];           // e.g. ["verbal", "senior", "evaluation"]
}

export interface PromptDefinition {
  id: string;               // e.g. "verbal-evaluation"
  versions: PromptVersion[];
  stable: string;           // points to the current stable version
  canary?: string;          // optional canary version for A/B
}
```

Every prompt gets a definition file:

```typescript
// packages/lib/src/prompts/definitions/verbal-evaluation.ts

import type { PromptDefinition } from "../registry";

export const verbalEvaluationPrompt: PromptDefinition = {
  id: "verbal-evaluation",
  stable: "1.2.0",
  canary: "1.3.0-beta",
  versions: [
    {
      version: "1.0.0",
      createdAt: "2024-09-01",
      author: "abhishek",
      changelog: "Initial evaluation prompt",
      template: `You are evaluating a verbal technical interview.
Candidate response: {{response}}
Job role: {{jobRole}}

Score the response on:
1. Technical accuracy (1-10)
2. Communication clarity (1-10)
3. Problem-solving depth (1-10)

Return JSON with scores and brief justification.`,
      variables: ["response", "jobRole"],
      tags: ["verbal", "evaluation"],
    },
    {
      version: "1.2.0",
      createdAt: "2024-11-15",
      author: "abhishek",
      changelog: "Added seniority-aware scoring, improved rubric specificity",
      template: `You are a senior technical interviewer evaluating a {{seniorityLevel}} candidate.

Interview type: Verbal Technical
Job role: {{jobRole}}
Candidate response: {{response}}

Evaluation rubric:
- Technical Depth: Does the response demonstrate genuine understanding or surface-level recall?
- Communication: Is the explanation coherent and appropriately structured for the audience?
- Problem Ownership: Does the candidate reason through edge cases, tradeoffs, or unknowns?

For each dimension, provide:
- Score: 1-10
- Evidence: A direct quote or paraphrase from the response
- Gap: What was missing or could be stronger

Return as JSON matching this schema:
{ "technicalDepth": { "score": number, "evidence": string, "gap": string }, ... }`,
      variables: ["response", "jobRole", "seniorityLevel"],
      tags: ["verbal", "evaluation", "seniority-aware"],
    },
    {
      version: "1.3.0-beta",
      createdAt: "2025-01-20",
      author: "priya",
      changelog: "Experimental: adds behavioral signal detection layer",
      template: `...`, // canary version being tested
      variables: ["response", "jobRole", "seniorityLevel"],
      tags: ["verbal", "evaluation", "behavioral"],
    },
  ],
};
```

### Layer 2: The Prompt Resolver

The resolver is the runtime interface everything else calls. It handles version selection and variable interpolation:

```typescript
// packages/lib/src/prompts/resolver.ts

import type { PromptDefinition, PromptVersion } from "./registry";

export type ResolveStrategy = "stable" | "canary" | "latest" | { version: string };

export interface ResolveOptions {
  strategy?: ResolveStrategy;
  variables: Record<string, string>;
  experimentId?: string;
}

export class PromptResolver {
  constructor(private definition: PromptDefinition) {}

  resolve(options: ResolveOptions): { prompt: string; version: string; promptId: string } {
    const version = this.selectVersion(options.strategy ?? "stable");

    // Validate all required variables are present
    const missing = version.variables.filter((v) => !(v in options.variables));
    if (missing.length > 0) {
      throw new Error(
        `Prompt ${this.definition.id}@${version.version} missing variables: ${missing.join(", ")}`
      );
    }

    const prompt = this.interpolate(version.template, options.variables);

    return {
      prompt,
      version: version.version,
      promptId: this.definition.id,
    };
  }

  private selectVersion(strategy: ResolveStrategy): PromptVersion {
    if (strategy === "stable") {
      return this.findVersion(this.definition.stable);
    }
    if (strategy === "canary") {
      const canary = this.definition.canary;
      if (!canary) throw new Error(`No canary version for prompt: ${this.definition.id}`);
      return this.findVersion(canary);
    }
    if (strategy === "latest") {
      return this.definition.versions.at(-1)!;
    }
    return this.findVersion(strategy.version);
  }

  private findVersion(version: string): PromptVersion {
    const found = this.definition.versions.find((v) => v.version === version);
    if (!found) {
      throw new Error(`Version ${version} not found in prompt: ${this.definition.id}`);
    }
    return found;
  }

  private interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return variables[key] ?? `{{${key}}}`;
    });
  }
}
```

Usage in our report generation task:

```typescript
// packages/tasks/src/trigger/report/verbal.ts

import { verbalEvaluationPrompt } from "@hyrecruitai/lib/prompts/definitions/verbal-evaluation";
import { PromptResolver } from "@hyrecruitai/lib/prompts/resolver";
import { getExperimentStrategy } from "@hyrecruitai/lib/experiments";

export async function generateVerbalReport(input: VerbalReportInput) {
  const resolver = new PromptResolver(verbalEvaluationPrompt);

  // Check if this candidate is in an active experiment
  const strategy = await getExperimentStrategy({
    promptId: "verbal-evaluation",
    candidateId: input.candidateId,
    orgId: input.orgId,
  });

  const { prompt, version, promptId } = resolver.resolve({
    strategy,
    variables: {
      response: input.transcription,
      jobRole: input.jobRole,
      seniorityLevel: input.seniorityLevel ?? "mid",
    },
  });

  const result = await callLLM(prompt);

  // Always log which prompt version produced this output
  await logPromptUsage({ promptId, version, interviewId: input.interviewId });

  return result;
}
```

---

## Layer 3: Experiment Config

The experiment layer is deliberately simple — no third-party feature flag service, just a database table and a deterministic hash for assignment:

```typescript
// packages/lib/src/experiments/index.ts

export interface PromptExperiment {
  id: string;
  promptId: string;
  stableVersion: string;
  canaryVersion: string;
  canaryRolloutPercent: number; // 0-100
  startedAt: Date;
  endedAt?: Date;
  active: boolean;
}

export async function getExperimentStrategy(input: {
  promptId: string;
  candidateId: string;
  orgId: string;
}): Promise<ResolveStrategy> {
  const experiment = await db.query.promptExperiments.findFirst({
    where: and(
      eq(promptExperiments.promptId, input.promptId),
      eq(promptExperiments.active, true)
    ),
  });

  if (!experiment) return "stable";

  // Deterministic assignment: same candidate always gets same variant
  const hash = deterministicHash(`${experiment.id}:${input.candidateId}`);
  const bucket = hash % 100;

  return bucket < experiment.canaryRolloutPercent ? "canary" : "stable";
}

function deterministicHash(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
```

The `promptExperiments` Drizzle schema:

```typescript
// packages/db/src/schema/experiments.ts

export const promptExperiments = pgTable("prompt_experiments", {
  id: uuid("id").primaryKey().defaultRandom(),
  promptId: text("prompt_id").notNull(),
  stableVersion: text("stable_version").notNull(),
  canaryVersion: text("canary_version").notNull(),
  canaryRolloutPercent: integer("canary_rollout_percent").notNull().default(10),
  active: boolean("active").notNull().default(true),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});
```

To start an experiment, we insert a row. To end it, we set `active = false` and decide whether to promote the canary to stable (updating the registry) or revert.

---

## The Iteration That Actually Failed

Our first version tried to store prompts in the database entirely — the TypeScript registry didn't exist. The appeal was obvious: edit a prompt via an internal dashboard, zero deployment needed.

It broke in three ways:

1. **Schema drift** — stored prompts quickly diverged from what the code expected. A variable rename in the DB didn't update the interpolation logic.
2. **No git history** — we lost the "who changed what and why" story. A regression in January took 4 hours to debug because we had no diff trail.
3. **Test environment chaos** — local dev, staging, and production had different prompt states. Tests passed locally and failed in CI.

The hybrid we landed on: **prompts live in code (versioned, reviewable), experiments live in the database (runtime-mutable)**. The boundary is intentional. Changing *what a prompt says* is a code review. Changing *what percent of traffic sees it* is a runtime config change.

---

## Architecture / Flow Diagram

```
Interview Completion
        │
        ▼
Report Task Trigger (Trigger.dev)
        │
        ▼
getExperimentStrategy(promptId, candidateId)
        │
        ├─► DB: prompt_experiments (active?) ──► No experiment → "stable"
        │
        └─► Hash(experimentId + candidateId) % 100 < rollout%?
                │
        ┌───────┴────────┐
        ▼                ▼
   "canary"          "stable"
        │                │
        └────────┬────────┘
                 ▼
     PromptResolver.resolve(strategy, variables)
                 │
        ┌────────┴────────┐
        ▼                 ▼
  Prompt v1.3.0-beta   Prompt v1.2.0
  (canary group)       (stable group)
        │                 │
        └────────┬────────┘
                 ▼
         LLM API Call
                 │
                 ▼
   logPromptUsage(promptId, version, interviewId)
                 │
                 ▼
    Report saved to DB + analytics
```

Analytics aggregation query for experiment results:

```sql
SELECT
  prompt_usage.version,
  AVG(report_ratings.score) AS avg_score,
  COUNT(*) AS sample_size,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY report_ratings.score) AS median_score
FROM prompt_usage
JOIN report_ratings ON prompt_usage.interview_id = report_ratings.interview_id
WHERE
  prompt_usage.prompt_id = 'verbal-evaluation'
  AND prompt_usage.created_at > NOW() - INTERVAL '7 days'
GROUP BY prompt_usage.version
ORDER BY avg_score DESC;
```

---

## Learnings and Outcomes

After three months running this system across all three interview types:

- **Report quality scores** recovered to 4.5/5 (up from the 3.8 trough) — the structured rubric in v1.2.0 was the winning change, confirmed by the A/B data
- **Rollback time** dropped from ~45 minutes (git revert + redeploy) to ~2 seconds (flip `active = false` in the DB)
- **Prompt iteration cycle** went from 3–4 days (code review + deploy) for stable changes, while experimental variants can now be deployed in minutes under a canary flag
- **Regression detection** improved significantly — we now catch score drops within 24 hours via the analytics query, before they compound

The biggest unlock wasn't the tooling — it was the discipline change. Treating prompts as versioned artifacts with changelogs forced us to articulate *why* we were changing them, which surfaced several changes that seemed good but lacked a real hypothesis.

---

## Suggestions for Engineers Building Similar Systems

**Start with the registry, not the database.** The temptation to make prompts "live-editable" is real, but the cost is git history and schema safety. Earn database-backed prompts by first building the versioning discipline.

**Version prompts with semver semantics.** A patch (`1.2.1`) means same variables, minor wording fix. A minor (`1.3.0`) means new variables added. A major (`2.0.0`) means breaking variable changes or fundamentally different evaluation strategy. This makes compatibility checks mechanical.

**Log the version, always.** Every LLM call in your pipeline should emit `promptId` and `version` to your analytics/observability store. Without this, debugging quality regressions becomes archaeology.

**Keep the experiment layer dumb.** Resist the urge to add complex targeting logic (org plan, candidate geography, etc.) early on. A rollout percentage and a deterministic hash covers 90% of experiment needs and is trivially auditable.

**Review prompts like code.** We added `*.prompt.ts` files to our PR review checklist alongside schema migrations. A prompt change that touches evaluation criteria gets the same scrutiny as a database migration — because from an output-quality perspective, it has the same blast radius.

The system is not perfect. We still don't have automated prompt regression tests (comparing LLM output distributions across versions is hard and expensive). That's next. But going from "ship and pray" to "version, experiment, and measure" was the right move — and it's one of the higher-leverage infrastructure investments we've made this year.
