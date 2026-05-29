---
title: "Flash: Talent Search at Scale"
description: "A product and architecture breakdown of Flash, a talent search and recommendation platform built around candidate signals, recruiter workflows, ranking, and scale."
date: "2026-05-24"
tags: talent-search, recommendations, product-engineering, ranking, ai-saas
coverImage: /me.webp
featured: true
---

Talent search looks like a search box, but the product is really a decision system.

A recruiter is not searching for text. They are trying to answer a messy question: "Who is worth my time right now?" A hiring manager wants confidence. A candidate wants a fair shot. The platform has to translate profiles, roles, constraints, preferences, and behavior into a ranked list that is useful without feeling random.

Flash is the kind of product I would build around that reality: a talent search and recommendation platform where search is the surface, but relevance is the product.

## The Core Object Is Not A Resume

A resume is a document. A talent platform needs a candidate graph.

The difference matters.

A candidate profile should include:

- structured skills
- experience history
- role titles
- companies
- seniority signals
- projects
- education
- location and work preference
- compensation expectations if available
- activity and availability
- recruiter notes
- interview or assessment signals

Search over only resume text is weak because resumes are inconsistent. Some candidates write well. Some undersell themselves. Some use different titles for the same work. Some list technologies without context. A serious talent product needs to normalize signal without flattening the person.

## The Search Pipeline

The pipeline I like has stages:

1. Parse and normalize candidate data.
2. Store structured fields for filters and facets.
3. Generate embeddings for semantic retrieval.
4. Run hybrid search for broad candidate recall.
5. Apply hard constraints.
6. Rerank using role fit, freshness, evidence, and recruiter behavior.
7. Explain why each candidate matched.
8. Capture feedback.

The hardest part is not adding embeddings. The hardest part is keeping the system explainable.

Recruiters need to know why someone is shown. "The model liked them" is not enough. A useful result should expose evidence:

- matched skills
- strongest experience overlap
- relevant project
- recent activity
- location fit
- seniority fit
- missing requirements

Good explanations make the system feel less like magic and more like leverage.

## Multi-Tenant Scale Changes The Design

For a small demo, every candidate can live in one pool.

For a real product, tenants change everything.

Different companies have different role taxonomies, hiring priorities, rejection reasons, compliance constraints, and historical feedback. A ranking model that works for one tenant can be wrong for another. Even simple filters like "senior backend engineer" can mean different things across companies.

The architecture needs tenant-aware boundaries:

- tenant-scoped candidate visibility
- tenant-specific notes and feedback
- shared global normalization where safe
- per-tenant ranking boosts
- audit trails for why a recommendation appeared
- permission-aware search

This is where a lot of AI SaaS products get fragile. The model is shared, but the product context is not.

## Ranking Should Combine Signals

I would not make Flash a pure vector-search product.

Vector similarity is useful for recall, but ranking needs more signal:

- semantic match between role and candidate
- exact skill and title matches
- recency of experience
- availability
- recruiter engagement
- past shortlist behavior
- negative feedback
- diversity and fairness constraints
- confidence in extracted data

The scoring model can start simple. Weighted rules are fine if they are observable and easy to tune. The key is designing the system so it can evolve into learned ranking later.

Every ranking decision should be logged. Not just the final score, but the components. If a recruiter says "this candidate is wrong", the team should be able to inspect whether the miss came from parsing, retrieval, filters, scoring, or a bad assumption in the product.

## The Recruiter Workflow Matters

The best search engine still fails if the workflow is clumsy.

Recruiters need to move quickly:

- save a search
- compare candidates
- shortlist
- reject with a reason
- share a slate
- return later
- see what changed

Those actions are also data. A shortlist is a positive relevance label. A rejection reason is a negative label. A profile open without action may be weak interest. A repeated search with different filters shows where the first result set failed.

Flash should treat workflow events as product intelligence.

This is why I think talent search is a strong AI product problem. The user is constantly producing feedback, but most systems waste it.

## What I Would Build First

The first production version would have:

- clean candidate profile schema
- resume parsing with human-correctable fields
- hybrid search over structured and semantic data
- role-based search templates
- strict tenant isolation
- transparent match explanations
- shortlist and rejection feedback
- relevance logging
- admin tools for debugging results

I would avoid pretending the first model is final. The launch goal is to create a relevance loop, not to win a leaderboard.

## The Real Product Bet

Flash is interesting because it sits between search, recommendations, workflow, and trust.

The product does not win by showing a flashy AI answer. It wins when a recruiter can say:

"This saved me time, and I understand why these people showed up."

That is the bar. Speed without trust becomes noise. Trust without speed becomes manual work. The platform has to carry both.

The systems challenge is building a search and recommendation layer that improves as people use it, while staying explainable enough that hiring teams can rely on it. That is the kind of product engineering problem I like: messy data, real users, ranking pressure, and a feedback loop that has to become part of the architecture from day one.
