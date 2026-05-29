---
title: "Ranking Loops That Learn"
description: "Why search and recommendation quality improves through feedback loops, offline evals, judgment labels, exploration, and product instrumentation - not just a better model."
date: "2026-05-22"
tags: recommendations, ranking, search-quality, feedback-loops, ai-engineering
coverImage: /me.webp
featured: true
---

The model is rarely the whole recommendation system.

A better embedding model can improve recall. A reranker can improve ordering. A larger LLM can produce nicer explanations. But the product only gets better over time if it has a loop: users act, the system observes, the team evaluates, and ranking changes without breaking trust.

That loop is the difference between a smart demo and a system that keeps improving after launch.

## Ranking Needs Ground Truth

Search teams often start with vibes.

"This result looks good."

"This one feels irrelevant."

"The new model seems better."

That is fine for the first hour. It is not enough for production.

A ranking system needs judgment labels. For a talent platform, labels could be:

- strong fit
- possible fit
- weak fit
- wrong seniority
- wrong domain
- missing required skill
- unavailable
- duplicate
- do not show again

For a docs search product, labels could be:

- directly answers query
- useful context
- related but not enough
- outdated
- wrong product area
- unsafe or misleading

The labels do not need to be perfect. They need to be consistent enough to compare changes.

## User Actions Are Signals, Not Truth

Clicks are useful, but they lie.

People click the first result because it is first. They click vague titles because they are curious. They skip good results because the snippet is bad. They save a candidate for political reasons. They reject a result because of a constraint the system never saw.

User behavior is signal, not ground truth.

I like separating passive signals from explicit feedback:

- Passive signals: impressions, clicks, opens, dwell time, scroll depth, repeats.
- Workflow signals: shortlist, save, share, contact, reject, archive.
- Explicit labels: "not relevant", "wrong seniority", "missing skill", "already contacted".

The deeper the action, the stronger the signal. A click is weak. A shortlist is stronger. A rejection with a reason is gold.

## Build The Feedback Capture Into The Workflow

Feedback collection should not feel like a survey.

The best labels come from normal work. If a recruiter rejects a candidate, ask for a lightweight reason. If an engineer marks a search result as unhelpful, offer three concrete reasons. If a user reruns the same query with a new filter, log that the first result set did not satisfy the intent.

This is product design, not just ML infrastructure.

Bad feedback UX creates sparse, noisy data. Good feedback UX creates training and evaluation data while helping the user move faster.

## Offline Evals Keep You Honest

Before changing ranking, I want an offline evaluation set.

It does not need to be huge at first. A few hundred real queries with judged results can catch obvious regressions. The important part is covering query types:

- exact name or entity query
- broad discovery query
- skill-based query
- natural-language query
- filtered query
- rare query
- high-value query

Then track metrics by category. Overall precision can improve while a critical query category gets worse. That is how teams ship regressions with confidence.

For search, I care about:

- recall at 20
- precision at 5
- mean reciprocal rank
- zero-result rate
- reformulation rate
- bad-result exposure

For recommendations, I also care about diversity, freshness, novelty, and repeated exposure. A recommender that always shows the same safe choices may look accurate while making the product feel dead.

## Online Experiments Need Guardrails

A ranking change can look good in aggregate and still hurt important users.

Online experiments should include guardrails:

- latency budget
- zero-result rate
- complaint or rejection rate
- repeated exposure
- tenant-level impact
- protected category checks where relevant
- fallback behavior

I would rather ship a smaller ranking improvement with clear guardrails than a dramatic one nobody can explain.

In AI products, silent drift is a real risk. If the ranking behavior changes every week and nobody can explain why, users stop trusting the surface. Improvement has to feel stable.

## Exploration Is Necessary

If a system only learns from top-ranked results, it traps itself.

Users only interact with what they see. If ranking never explores, it may never learn that lower-ranked candidates or documents are actually better. This is the feedback-loop version of a cold start problem.

Exploration can be small:

- occasionally diversify lower slots
- rotate similar candidates
- test new content in controlled positions
- separate exact-match queries from exploratory queries
- avoid exploration where the user needs precision

The product has to decide where exploration is acceptable. A hiring shortlist may tolerate some exploration. A compliance search probably should not.

## Explainability Is Part Of The Loop

Explanations help users trust results, but they also help teams debug ranking.

For each result, I want to know:

- why it was retrieved
- why it was ranked here
- which filters applied
- which signals contributed most
- which signals were missing
- whether it came from lexical, vector, or recommendation retrieval

This does not have to be shown fully to the user. But the system should expose it internally. Without explanations, relevance debugging turns into guessing.

## The Architecture I Like

A practical ranking loop has five pieces:

1. Retrieval that can bring in enough good candidates.
2. Ranking that combines semantic, lexical, business, and behavioral signals.
3. Instrumentation that records impressions and actions.
4. Evaluation datasets that track quality over time.
5. Admin/debug tooling that explains individual results.

That is the loop.

The first version can be simple. Rules, weights, and a small eval set are enough to begin. The important part is making every ranking change measurable.

## The Takeaway

Ranking systems improve when product and engineering agree on what "better" means.

Better is not only a higher model score. Better is fewer useless results, faster decisions, clearer explanations, safer exposure, lower latency, and more trust from the people using the product.

That requires a loop. Not just a model. Not just a search index. Not just a dashboard.

A product that learns needs somewhere to learn from.
