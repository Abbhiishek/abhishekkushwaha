---
title: "Building AI Guardrails for LLM Responses in Production"
description: "How we stopped our interview AI from going off-script, leaking PII, and giving biased feedback — with a multi-layer guardrail system in TypeScript."
date: "2026-04-12"
tags: ai, llm, guardrails, typescript, production
coverImage: /thumbnail.jpg
featured: false
---

Three weeks after we launched the AI interviewer at HyrecruitAI, a candidate screenshot went viral on Twitter. Our model had told someone their "communication style seemed regional" — a subtle but real form of bias creeping through a system prompt we thought was airtight. Impressions: 40k. Support tickets: 23. Investor calls asking what happened: 2.

The root cause wasn't one bad prompt. It was the absence of a systematic guardrail layer between our LLM calls and the candidate-facing surface. We were relying on a single system prompt to do the work of an entire content policy engine. This post covers how we fixed it.

## The Problem

Our interview flow worked like this: candidate answers a question via audio → we transcribe → GPT-4o generates a follow-up + real-time coaching feedback → we stream it to the UI. The pipeline moved fast. The guardrails were basically one paragraph at the top of the system prompt:

```
You are a fair, unbiased interviewer. Do not make assumptions about
the candidate's background. Keep feedback professional.
```

That's not a guardrail. That's a hope.

We logged about 2,400 AI-generated coaching responses in the first month. When we ran a retrospective audit using a fine-tuned classifier, we found:
- **~3.1%** contained implicit bias signals (regional, age, gender proxies)
- **~1.4%** leaked information from the job description that candidates shouldn't see (internal level bands, salary ranges from the JD we passed as context)
- **~0.7%** were factually wrong about the candidate's stated experience

At 2,400 responses, that's ~125 problematic outputs. Not catastrophic, but in a hiring product, even 1 biased response is a legal and ethical problem.

## The Solution: A Three-Layer Guardrail System

We built guardrails at three points: input sanitization, output validation, and stream-level filtering.

### Layer 1: Input Sanitization

Before anything hits the LLM, we strip or redact context that could anchor the model toward biased outputs. Salary bands, internal notes, recruiter comments — none of it should influence real-time candidate feedback.

```typescript
interface CandidateContext {
  transcript: string;
  questionText: string;
  jobTitle: string;
  // NOTE: intentionally no salary, internal level, recruiter notes
}

interface SanitizedPromptPayload {
  systemPrompt: string;
  userContent: string;
  redactedFields: string[];
}

function sanitizeInterviewContext(
  raw: RawInterviewContext
): SanitizedPromptPayload {
  const redactedFields: string[] = [];

  // Strip PII patterns from transcript
  const cleanTranscript = raw.transcript
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "[NAME]") // naive name redaction
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE]")
    .replace(/\b[\w.]+@[\w.]+\.\w+\b/g, "[EMAIL]");

  if (raw.internalLevelBand) redactedFields.push("internalLevelBand");
  if (raw.salaryRange) redactedFields.push("salaryRange");
  if (raw.recruiterNotes) redactedFields.push("recruiterNotes");

  return {
    systemPrompt: buildSystemPrompt(raw.jobTitle),
    userContent: buildUserContent(cleanTranscript, raw.questionText),
    redactedFields,
  };
}
```

This runs synchronously before every LLM call — zero latency overhead since it's pure string ops.

### Layer 2: Output Validation Before Delivery

Every completed LLM response passes through a validation chain before we deliver it. We use a fast, cheap model (GPT-4o-mini) as a classifier rather than a second full-inference call.

```typescript
type GuardrailResult =
  | { passed: true }
  | { passed: false; reason: string; category: ViolationCategory };

type ViolationCategory = "bias" | "pii_leak" | "factual_inconsistency" | "off_topic";

async function validateLLMOutput(
  response: string,
  context: CandidateContext
): Promise<GuardrailResult> {
  const classifierPrompt = `
You are a content safety classifier for an AI interview platform.
Analyze this AI-generated feedback and flag any issues.

Feedback: ${response}
Candidate transcript excerpt: ${context.transcript.slice(0, 500)}

Return JSON: { "safe": boolean, "category": string | null, "reason": string | null }
Categories: bias, pii_leak, factual_inconsistency, off_topic
`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: classifierPrompt }],
    response_format: { type: "json_object" },
    max_tokens: 150,
    temperature: 0,
  });

  const parsed = JSON.parse(result.choices[0].message.content ?? "{}");

  if (!parsed.safe) {
    return {
      passed: false,
      reason: parsed.reason,
      category: parsed.category as ViolationCategory,
    };
  }

  return { passed: true };
}
```

The classifier adds ~180ms p50 latency. For non-streaming endpoints, that's fine. For streaming, we had to get creative.

### Layer 3: Stream-Level Filtering

The hardest part: we stream feedback to the UI token by token. We can't wait for the full response to run the classifier. We built a buffered stream interceptor that holds chunks until a "sentence boundary" is detected, then validates each sentence before flushing.

```typescript
async function* guardedStream(
  rawStream: AsyncIterable<string>,
  context: CandidateContext
): AsyncGenerator<string> {
  let buffer = "";
  const sentenceEnd = /[.!?]\s/;

  for await (const chunk of rawStream) {
    buffer += chunk;

    if (sentenceEnd.test(buffer)) {
      const sentences = buffer.split(sentenceEnd);
      const toValidate = sentences.slice(0, -1).join(". ") + ".";
      buffer = sentences[sentences.length - 1];

      const result = await validateLLMOutput(toValidate, context);

      if (result.passed) {
        yield toValidate;
      } else {
        // Log violation, yield a safe fallback
        await logViolation(result, context);
        yield "Let me rephrase that — keep focusing on the technical depth of your answer.";
        buffer = ""; // discard rest of buffer
        return;
      }
    }
  }

  // Flush remaining buffer
  if (buffer.trim()) yield buffer;
}
```

This introduces ~200ms per sentence boundary — acceptable because candidates are already processing audio and reading simultaneously.

## The Iteration

First version used a regex-based approach: pattern lists for known bias signals, PII regex, keyword blocklists. It caught 60% of violations and had a 12% false positive rate. Candidates were getting their feedback replaced with fallbacks mid-sentence for completely benign responses. That was worse than the original problem.

We switched to the classifier-based approach after running an offline evaluation on our audit dataset. The LLM classifier got to 94% precision, 89% recall on our test set of flagged responses. False positives dropped to under 2%.

The tradeoff: the classifier costs ~$0.0002 per validation call. At our current volume (8,000 responses/day), that's $1.60/day — negligible.

One thing we got wrong: we initially validated the entire response as one blob. The classifier would sometimes flag a 400-token response because of a single sentence, and we'd drop the whole thing. Moving to sentence-level validation — both for streaming and for the batch endpoint — made fallback behavior much more surgical.

## Architecture / Flow Diagram

```
Candidate Audio
      │
      ▼
[Transcription Service] ──► Raw Transcript
      │
      ▼
[Input Sanitizer]
  - Strip PII from transcript
  - Remove internal context fields
  - Build sanitized prompt payload
      │
      ▼
[LLM (GPT-4o)] ──► Token Stream
      │
      ▼
[Stream Interceptor / Buffer]
  - Buffer tokens until sentence boundary
  - Emit sentence unit for validation
      │
      ▼
[Guardrail Classifier (GPT-4o-mini)]
  - Bias check
  - PII leak check
  - Factual consistency check
  - Returns: safe | violation + category
      │
     / \
  safe  violation
   │         │
   ▼         ▼
[Stream    [Log Violation]
 to UI]    [Emit Fallback]
            [Discard Buffer]
```

Each violation is written to a `guardrail_violations` table with: session ID, violation category, original text (encrypted), timestamp, and whether a fallback was used. We review these weekly.

## Learnings & Outcomes

Four weeks post-deployment:
- Violation rate down from **~5.2%** to **~0.4%** (measured by weekly audit sample)
- False positive rate: **1.8%** (candidates seeing unnecessary fallbacks)
- Classifier latency p50: **178ms**, p99: **340ms**
- Cost: **~$1.60/day** at current volume
- Zero policy-related support tickets in the past 3 weeks

The 0.4% residual violations are mostly subtle — things the classifier misses because they require domain context (e.g., a comment that's fine in a US context but problematic in certain regional hiring markets). We're building a fine-tuned version of the classifier on our own violation dataset to close that gap.

## Suggestions

**Don't treat prompt engineering as a guardrail.** System prompts shape behavior probabilistically. Guardrails are deterministic checks that run regardless of what the model decides to do.

**Log everything, even passing validations.** You need a dataset of both violations and clean outputs to evaluate your classifier quality over time. We store all outputs (encrypted) for 30 days.

**Validate at sentence granularity, not response granularity.** It makes fallbacks surgical and keeps streaming UX intact.

**Measure false positives as seriously as false negatives.** A guardrail that blocks too aggressively erodes trust in the product just as much as one that lets bad outputs through.

**Separate the classifier from the main LLM.** Using a fast, cheap model for classification keeps costs low and lets you swap the main model without rethinking your safety layer.

The guardrail system is now the part of our stack I'm most confident in — not because it's perfect, but because we can measure it, tune it, and audit it. That's a very different position from "trust the system prompt."
