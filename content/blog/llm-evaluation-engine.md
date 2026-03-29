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

The key lesson: LLMs are not good at holistic judgment. They are excellent at structured assessment against explicit criteria. Design your evaluation system accordingly.
