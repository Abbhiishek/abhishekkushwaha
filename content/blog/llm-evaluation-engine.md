---
title: "Designing LLM Evaluation Systems: Rubrics, Consistency, and Guardrails"
description: "A practical blueprint for evaluating interview answers with LLMs: structured rubrics, multi-pass scoring, prompt versioning, bias checks, and guardrails that make the system safer."
date: "2026-04-10"
tags: llm, evaluation, guardrails, prompt-engineering, ai-engineering
coverImage: /me.webp
featured: true
---

The dangerous version of an LLM evaluation system is the one that looks correct.

You send a candidate answer to a model, ask for a score, get back confident JSON, and show it in a dashboard. The output feels structured. The score looks precise. The product team relaxes.

But a single model score is not an evaluation system. It is an opinion with formatting.

If an AI product is going to evaluate humans, the engineering bar has to be higher. The system needs rubrics, consistency checks, guardrails, audit trails, and a way to change prompts without silently changing the product.

## Start With the Rubric, Not the Prompt

The biggest mistake is asking the LLM to "score this answer from 1 to 10." That produces vibes.

A better system starts with explicit dimensions:

- technical accuracy
- problem-solving approach
- communication clarity
- depth of reasoning
- role-specific signal

Each dimension needs criteria. A score of 4 should mean something different from a score of 3. The model should not invent those meanings at runtime.

```ts
type RubricDimension = {
  name: string;
  weight: number;
  criteria: Array<{
    score: 1 | 2 | 3 | 4 | 5;
    meaning: string;
  }>;
};
```

This changes the task from "judge the candidate" to "compare the answer against explicit criteria." That is a much better job for an LLM.

## Extract First, Score Second

I like evaluation pipelines that separate extraction from judgment.

Stage one extracts claims from the answer:

- what the candidate said
- what technical concepts they mentioned
- what trade-offs they identified
- what examples they used
- what was missing or unclear

Stage two scores each rubric dimension against that extracted representation.

This helps for three reasons:

1. The extracted facts can be audited.
2. Each scoring prompt is smaller and more focused.
3. Different dimensions evaluate the same intermediate evidence.

Without this step, the model may notice different facts in different prompts and produce contradictory justifications.

## Consistency Is a Product Feature

For high-impact evaluation, one model pass is not enough. The system should measure its own uncertainty.

One practical approach:

- run scoring multiple times at low temperature
- compare dimension-level variance
- accept scores that converge
- flag high-variance answers for human review

The goal is not to pretend the model is perfectly objective. The goal is to know when it is uncertain.

That distinction matters. In production, "I am not confident" is often a better answer than a polished but unstable score.

## Guardrails Around the Evaluator

Guardrails are not only for chatbots. Evaluation systems need them too.

Useful guardrails include:

- strip names, emails, gendered metadata, and unrelated identifiers before scoring
- prevent the model from giving medical, legal, or personality judgments
- reject outputs that do not match the expected schema
- block feedback that mentions protected attributes
- separate internal scoring from candidate-facing feedback
- keep the model from revealing hidden rubric logic to candidates

The evaluator should produce structured internal output first. Candidate-facing feedback should be generated in a separate, safer step using approved fields from the evaluation.

## Prompt Versioning Matters

Changing a prompt changes the product.

If the scoring prompt changes, yesterday's score and today's score may not mean the same thing. That is a real operational problem when companies are comparing candidates over time.

At minimum, every evaluation should store:

- prompt version
- model name
- rubric version
- input transcript hash
- output JSON
- evaluator settings
- timestamp

This makes it possible to answer basic questions later:

- Why did this answer receive this score?
- Which prompt generated it?
- Did a new prompt change the score distribution?
- Can we roll back safely?

Prompt versioning is not process overhead. It is the audit log for an AI product.

## Bias Checks Are Not Optional

Even if the model never sees demographic fields, bias can leak through language, accent-influenced transcription, education signals, or writing style.

I would test evaluation systems with synthetic and real calibration sets:

- identical answers with different names removed and restored
- concise answers vs verbose answers with same correctness
- non-native English phrasing with correct technical content
- unconventional but valid technical approaches
- answers with filler words from speech transcripts

The system should reward correctness and reasoning, not confidence theater.

## A Strong Evaluation Output

The output should be boring and structured:

```json
{
  "score": 4,
  "confidence": "medium",
  "dimensions": [
    {
      "name": "Technical Accuracy",
      "score": 4,
      "evidence": ["Explained index selectivity", "Mentioned composite index order"],
      "missing": ["Did not discuss write overhead"]
    }
  ],
  "reviewRequired": false
}
```

Notice what is not here: personality claims, vague praise, demographic assumptions, or hidden chain-of-thought.

## The Engineering Lesson

LLMs are useful evaluators when the system around them is disciplined.

They are good at comparing evidence against explicit criteria. They are weaker at open-ended judgment, silent consistency, and fairness unless the product forces structure.

The best evaluation system is not the fanciest prompt. It is the one with clear rubrics, stable versions, low variance, guardrails, and honest escalation paths when the model is unsure.
