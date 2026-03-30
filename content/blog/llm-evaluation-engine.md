---
title: "How We Built an LLM-Based Evaluation Engine for Interview Answers"
description: "Inside HyrecruitAI's AI evaluation engine — prompt engineering, rubric design, consistency scoring, and bias mitigation for fair interview assessments."
date: "2026-03-01"
tags: llm, ai, evaluation, prompt-engineering
coverImage: /thumbnail.jpg
featured: false
---

# How We Built an LLM-Based Evaluation Engine for Interview Answers

The core promise of HyrecruitAI is consistent, fair interview evaluations. Human interviewers are brilliant at conversation but terrible at consistency. Two interviewers can watch the same answer and give wildly different scores. We built an LLM-based evaluation engine to fix that.

## The Problem With Naive LLM Scoring

Our first attempt was embarrassingly simple: send the transcript to GPT-4 and ask it to score from 1-10. The results were inconsistent, unexplainable, and biased toward verbose answers. A candidate who gave a rambling five-minute response scored higher than one who gave a concise, correct two-sentence answer.

We needed structure.

## Rubric Design

The breakthrough was treating evaluation as a structured rubric assessment, not a single holistic judgment. For each interview question, we define evaluation dimensions:

```typescript
interface EvaluationRubric {
  questionId: string;
  dimensions: {
    name: string;          // e.g., "Technical Accuracy"
    weight: number;        // 0.0 - 1.0
    criteria: {
      score: number;       // 1-5
      description: string; // What this score means
    }[];
  }[];
}
```

A typical technical question has 3-4 dimensions: **Technical Accuracy**, **Problem-Solving Approach**, **Communication Clarity**, and **Depth of Knowledge**. Each dimension has explicit criteria for each score level.

For example, a score of 4 on Technical Accuracy means: "Answer is correct with minor gaps. Demonstrates solid understanding of core concepts. Could identify edge cases if prompted." This specificity forces the LLM to evaluate against concrete criteria rather than vibes.

## Prompt Architecture

We use a multi-stage evaluation pipeline:

**Stage 1 -- Extract Key Points.** Before scoring, we ask the LLM to extract the factual claims and technical assertions from the candidate's answer. This creates an intermediate representation we can audit.

**Stage 2 -- Evaluate Per Dimension.** For each rubric dimension, we send a focused prompt with the extracted key points, the dimension criteria, and the expected answer framework. The LLM returns a score and a justification.

```
You are evaluating a candidate's interview response.

DIMENSION: Technical Accuracy
QUESTION: Explain how database indexing works and when you would use a composite index.

CANDIDATE KEY POINTS:
{extracted_points}

SCORING CRITERIA:
5 - Explains B-tree structure, covers selectivity, correctly describes composite index column ordering
4 - Correct core explanation with minor gaps
3 - Partially correct, misses key concepts
2 - Fundamental misconceptions present
1 - Unable to demonstrate understanding

Score this response on Technical Accuracy only. Return JSON:
{"score": <1-5>, "justification": "<2-3 sentences>"}
```

**Stage 3 -- Aggregate and Normalize.** We compute the weighted average across dimensions and normalize against our historical score distribution to prevent score inflation over time.

## The Prompt Iterations That Failed

We did not arrive at this architecture on the first try. Three failed iterations taught us what works:

**Iteration 1: Single monolithic prompt.** We sent the full transcript, all rubric dimensions, and scoring criteria in one prompt. The model anchored heavily on the first dimension (usually Technical Accuracy) and rushed through the rest. Scores for later dimensions were less discriminating — Communication Clarity scores clustered around 3-4 regardless of actual quality. The model was running out of attention budget.

**Iteration 2: Per-dimension prompts with full transcript.** We split evaluation into separate prompts per dimension, but each prompt received the entire transcript. Results improved, but token cost tripled (each dimension re-processed the full transcript), and we noticed inconsistency — the model would re-extract different key points in each dimension prompt, leading to contradictory justifications across dimensions for the same answer.

**Iteration 3 (current): Extract first, evaluate second.** Separating key point extraction from scoring fixed both problems. The extraction step runs once and produces a stable intermediate representation. Each dimension prompt evaluates against the same extracted points. Token usage dropped by 40% compared to Iteration 2 (extraction is done once, not per-dimension). Consistency improved by 15% as measured by inter-dimension justification coherence.

## Consistency Mechanism

A single LLM call is not reliable enough for high-stakes evaluation. We run each evaluation three times with temperature 0.3 and check for agreement:

- If all three runs agree within 1 point on every dimension, we use the median
- If there is a 2+ point spread on any dimension, we flag it for human review
- We log the variance for every evaluation to track model reliability over time

In practice, about 85% of evaluations converge on the first pass. The remaining 15% usually involve ambiguous answers where reasonable evaluators would also disagree.

## Bias Mitigation

This is the hardest part and the one we take most seriously. Our approach:

- **Transcript-only evaluation**: The LLM never sees the candidate's name, gender, age, or any demographic information. We strip all identifying metadata before evaluation.
- **Linguistic normalization**: We preprocess transcripts to standardize grammar and remove filler words. A non-native English speaker's technically correct answer should not score lower because of accent-influenced transcription artifacts.
- **Regular bias audits**: Monthly, we run our evaluation engine against a synthetic dataset of identical answers attributed to different demographic profiles. Any statistically significant score variance triggers an investigation.
- **Calibration against human panels**: We periodically have expert human evaluators score the same answers and compare their scores against the engine. The LLM should match the human panel's median, not any individual evaluator.

## Results

After six months in production:

- **Inter-run consistency**: 92% of evaluations converge within 1 point across all three runs
- **Human correlation**: Our scores correlate at 0.87 with expert human panel medians (compared to 0.71 between individual human evaluators)
- **Bias audit pass rate**: Zero statistically significant demographic-based score differences in the last four monthly audits

The engine is not perfect. It still struggles with highly creative answers that diverge from expected frameworks, and it cannot evaluate live coding as effectively as verbal responses. But for structured technical and behavioral interviews, it is more consistent than any human evaluator we have tested against.

## Cost Analysis

Each evaluation runs 3 passes of a multi-stage pipeline. Per interview (average 10 questions):

- **Key point extraction:** ~2k input tokens, ~500 output tokens per question = ~25k tokens total
- **Per-dimension scoring:** ~1k input, ~200 output per dimension, 3-4 dimensions per question = ~36k tokens total
- **Times 3 consistency passes:** ~183k total tokens per interview

At GPT-4o pricing (~$2.50/M input, ~$10/M output), each evaluation costs approximately $0.15. At 500 interviews per day, that is roughly $75/day or $2,250/month for the evaluation pipeline alone.

We tested GPT-4o-mini as a cost optimization. Accuracy dropped 8% on technical questions (it struggled with nuanced system design evaluations) but was comparable on behavioral questions (empathy assessment, communication scoring). We now route behavioral question evaluations to GPT-4o-mini, keeping GPT-4o for technical dimensions. This model routing saves approximately 30% on total evaluation cost without measurable quality loss on the dimensions that matter for each question type.

## Handling Creative Answers

The engine's biggest weakness was false negatives on unconventional but technically sound answers. A candidate who proposed an event-sourcing architecture for a question expecting CRUD would score poorly on Technical Accuracy even if their approach was valid and well-reasoned.

We added a "Novelty Assessment" dimension that specifically evaluates whether the candidate's approach diverges from the expected framework and, if so, whether it is technically sound on its own merits. This dimension is scored by a separate prompt that does not see the expected answer framework — it evaluates the response purely on internal consistency and technical correctness.

The novelty score acts as a modifier: if a response scores below 3 on standard dimensions but above 4 on novelty assessment, it gets flagged for human review rather than auto-scored. This reduced false negatives on strong unconventional answers by approximately 20%.

The key lesson: LLMs are not good at holistic judgment. They are excellent at structured assessment against explicit criteria. Design your evaluation system accordingly.
