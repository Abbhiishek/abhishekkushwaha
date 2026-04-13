---
title: "Structured LLM Outputs: Enforcing JSON Schema in Production AI Pipelines"
description: "How we eliminated 40% of downstream parsing failures by enforcing strict JSON schema on LLM responses in HyrecruitAI's evaluation pipeline."
date: "2026-04-13"
tags: ai, llm, json-schema, typescript, production
coverImage: /thumbnail.jpg
featured: false
---

We had a silent killer in production.

Our AI evaluation pipeline was generating candidate assessment reports — scoring applicants on communication, technical depth, and culture fit. On paper, it worked. In reality, 1 in 6 reports failed to parse downstream, causing silent data loss and corrupted candidate records. The pipeline never threw errors. The LLM returned "JSON". But the shape was wrong — trailing commas, nested arrays where we expected strings, missing required fields.

We were trusting the model to do what we told it to do. We shouldn't have been.

## The Problem

HyrecruitAI runs structured AI evaluations after every interview. The output feeds into scoring dashboards, hiring manager reports, and ATS integrations. That means the LLM response is not a string we display — it's data we parse, store, and act on.

Our original prompt ended with something like:

```
Return your evaluation as a JSON object with the following fields:
- overallScore: number (0-100)
- dimensions: array of { name, score, rationale }
- recommendation: "proceed" | "hold" | "reject"
- summary: string
```

The model complied — most of the time. When it didn't:

- `overallScore` came back as `"87"` (string, not number)
- `dimensions` was occasionally a single object instead of an array
- `recommendation` returned `"Proceed to next round"` instead of `"proceed"`
- Some responses included markdown fences: ` ```json ... ``` `

Our parser handled the happy path fine. Edge cases broke silently. We only noticed when a hiring manager asked why three candidates had blank scorecards.

Instrumenting the pipeline showed a **16.4% parse failure rate** across 1,200 evaluations in January. Of those, 60% produced no error — the data just never reached the downstream table.

## The Solution

We moved from prompt-based JSON instructions to **schema-enforced structured outputs**, using two layers:

1. **OpenAI-compatible structured output mode** (or Anthropic tool-use for Claude) to constrain the raw model response
2. **Zod schema validation** as a runtime safety net before any downstream write

### Layer 1: Structured Output via Tool Calling

Rather than asking the model to "return JSON", we define a tool schema and force the model to call it:

```typescript
// lib/ai/evaluation-schema.ts
import { z } from "zod";

export const EvaluationDimensionSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  rationale: z.string().min(10),
});

export const CandidateEvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  dimensions: z.array(EvaluationDimensionSchema).min(1),
  recommendation: z.enum(["proceed", "hold", "reject"]),
  summary: z.string().min(50).max(800),
  flags: z.array(z.string()).optional().default([]),
});

export type CandidateEvaluation = z.infer<typeof CandidateEvaluationSchema>;
```

```typescript
// lib/ai/run-evaluation.ts
import Anthropic from "@anthropic-ai/sdk";
import { CandidateEvaluationSchema, type CandidateEvaluation } from "./evaluation-schema";
import { zodToJsonSchema } from "zod-to-json-schema";

const client = new Anthropic();

export async function runCandidateEvaluation(
  transcript: string,
  jobContext: string
): Promise<CandidateEvaluation> {
  const toolSchema = zodToJsonSchema(CandidateEvaluationSchema, {
    name: "submit_evaluation",
  });

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    tools: [
      {
        name: "submit_evaluation",
        description:
          "Submit the structured candidate evaluation after analyzing the interview transcript.",
        input_schema: toolSchema as Anthropic.Tool["input_schema"],
      },
    ],
    tool_choice: { type: "tool", name: "submit_evaluation" },
    messages: [
      {
        role: "user",
        content: buildEvaluationPrompt(transcript, jobContext),
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Model did not call submit_evaluation tool");
  }

  // Runtime validation — even with tool_choice, defensive parse
  const parsed = CandidateEvaluationSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`Schema validation failed: ${parsed.error.message}`);
  }

  return parsed.data;
}
```

The key detail: `tool_choice: { type: "tool", name: "submit_evaluation" }` forces the model to produce exactly one tool call with that name. No markdown. No prose. No creative interpretation of what "JSON" means.

### Layer 2: Zod Validation Before Every Write

Even with structured outputs, we validate at the boundary before writing to the database:

```typescript
// lib/ai/evaluation-writer.ts
import { db } from "@db/client";
import { evaluations } from "@db/schema";
import { CandidateEvaluationSchema } from "./evaluation-schema";
import type { CandidateEvaluation } from "./evaluation-schema";

export async function writeEvaluation(
  applicationId: string,
  rawResult: unknown
): Promise<void> {
  const parsed = CandidateEvaluationSchema.safeParse(rawResult);

  if (!parsed.success) {
    // Log structured error — don't silently swallow
    console.error({
      event: "evaluation_schema_violation",
      applicationId,
      errors: parsed.error.flatten(),
    });

    await db.insert(evaluationErrors).values({
      applicationId,
      errorType: "schema_violation",
      raw: JSON.stringify(rawResult),
      errors: parsed.error.flatten(),
      createdAt: new Date(),
    });

    throw new Error(`Evaluation schema violation for ${applicationId}`);
  }

  await db.insert(evaluations).values({
    applicationId,
    overallScore: parsed.data.overallScore,
    recommendation: parsed.data.recommendation,
    summary: parsed.data.summary,
    dimensions: parsed.data.dimensions,
    flags: parsed.data.flags,
    createdAt: new Date(),
  });
}
```

The `evaluationErrors` table gives us observability into what the model returns when validation fails — critical for debugging model drift.

## The Iteration

**First attempt: JSON mode only.**

OpenAI's `response_format: { type: "json_object" }` and Anthropic's prefill technique (`\nAssistant: {`) reduce but don't eliminate structural problems. We still saw type coercions (`"87"` for numbers) and enum drift. Parse failure dropped from 16.4% to 9.1% — better, not solved.

**Second attempt: Prompt-engineering the schema.**

We pasted the Zod schema as a comment into the prompt, added explicit type annotations, and gave few-shot examples. Failure dropped to 4.3%. But maintenance was brutal — every schema change meant updating three places: the Zod file, the prompt comment, and the few-shot examples. They drifted apart within a week.

**Third attempt: Tool calling + runtime validation.**

Forced tool call with `zodToJsonSchema` as the single source of truth. Schema changes automatically propagate to the tool definition. Runtime Zod validation catches anything the model returns that doesn't conform.

Parse failure rate: **0.3%** over 4,200 evaluations in March. The remaining 0.3% are edge cases where the model hits token limits mid-response — handled by a retry with `max_tokens` doubled.

## Architecture / Flow Diagram

```
Interview Transcript + Job Context
          │
          ▼
┌─────────────────────────┐
│  Prompt Builder         │
│  (system + user turn)   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Anthropic API          │
│  tool_choice: forced    │  ◄── Zod schema → JSON Schema (zodToJsonSchema)
│  model: claude-opus-4-6 │
└────────────┬────────────┘
             │  tool_use block
             ▼
┌─────────────────────────┐
│  Schema Validator       │
│  (Zod safeParse)        │
└────────┬────────┬───────┘
         │        │
     SUCCESS    FAILURE
         │        │
         ▼        ▼
  ┌──────────┐  ┌──────────────────┐
  │  Write   │  │  evaluationErrors│
  │  to DB   │  │  table + retry   │
  └──────────┘  └──────────────────┘
```

Data flow: transcript enters, prompt builds, API call with forced tool schema, tool response parsed, Zod validates, write succeeds or error is captured with full raw output for debugging.

## Learnings & Outcomes

**Metrics after rolling out schema-enforced outputs (March 2026 vs January 2026):**

| Metric | Before | After |
|---|---|---|
| Parse failure rate | 16.4% | 0.3% |
| Silent data loss incidents | 12 | 0 |
| Schema drift bugs (prompt vs code) | Weekly | None |
| Avg evaluation latency | 2.1s | 2.4s (+0.3s tool overhead) |
| Retry rate | 4.1% | 0.8% |

The 0.3s latency increase from tool calling is real but acceptable — we batch evaluations async after interviews, not in the critical path.

**What schema enforcement doesn't solve:**

- Semantic correctness: the model can fill every field perfectly and still give a wrong score
- Hallucination of rationale text — Zod can't validate that a string is truthful
- Token budget overruns — long transcripts still require chunking

For semantic correctness we rely on our LLM evaluation engine (a separate pipeline that evaluates the evaluations). For rationale quality we run spot-checks with a lightweight classifier.

## Suggestions for Engineers Implementing This

**Use `zodToJsonSchema` as your single source of truth.** Define the Zod schema once. Derive the JSON Schema from it for the tool definition. Never write the schema twice.

**Force tool choice, don't just offer tools.** `tool_choice: { type: "tool", name: "..." }` is the difference between "the model might call this" and "the model will call this". Without it, the model can choose to respond in prose.

**Log schema violations as structured data, not just errors.** The raw output that failed validation is your most valuable debugging artifact. Store it. You'll need it when the model behavior shifts after a version update.

**Add `.min()` and `.max()` to all numeric fields.** Without bounds, a model returning `overallScore: 9999` passes type validation. Semantic bounds catch range errors too.

**Version your schemas.** When you change the output structure, you need to handle existing records that conform to the old shape. A `schemaVersion` field in your database row makes migrations tractable.

**Test with adversarial prompts.** Add test cases where you deliberately ask the model to ignore the schema, return plain text, or omit required fields. Verify your validation layer catches these before they reach production.

The core shift is treating LLM output as untrusted external data — the same way you'd treat a third-party API response. You wouldn't write `const score = apiResponse.score` without validation. Don't do it with model output either.
