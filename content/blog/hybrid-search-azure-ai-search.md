---
title: "Hybrid Search Without Hand-Waving"
description: "A practical blueprint for building hybrid search with Azure AI Search: lexical retrieval, vector search, semantic ranking, filters, scoring profiles, and relevance evaluation."
date: "2026-05-28"
tags: azure-ai-search, hybrid-search, vector-search, search-relevance, ai-engineering
coverImage: /me.webp
featured: true
---

Hybrid search sounds simple until you have to debug why the right result is sitting at rank 17.

The common pitch is: combine keyword search with vector search and get the best of both worlds. That is directionally true, but incomplete. Real product search is not just retrieval. It is query understanding, filters, scoring, reranking, freshness, permissions, latency, and a relevance loop that tells you when the system is getting worse.

Azure AI Search is useful because it gives you the pieces in one place: classic lexical search, vector indexes, semantic ranker, filters, facets, scoring profiles, and integrations around embeddings. The engineering work is deciding how those pieces should cooperate.

## Start With What Each Search Mode Is Good At

Keyword search is still underrated.

BM25 is good when users type exact names, acronyms, error codes, role titles, companies, skills, locations, file names, and domain language that should not be blurred into a nearby concept. If a recruiter searches for "React Native", they usually do not mean every frontend engineer. If an engineer searches for "Redis timeout", they probably care about those exact words.

Vector search is good when the user expresses intent in natural language:

- "backend engineer who has worked on payments and event-driven systems"
- "candidate with customer-facing AI product experience"
- "docs about reducing latency in voice agents"

The query and the document may not share exact words, but the meaning overlaps.

Semantic ranking helps after retrieval. I think of it as a judgment layer over a candidate set, not a replacement for retrieval. If the first stage fails to bring useful documents into the candidate pool, a ranker cannot save the experience.

## The Shape I Prefer

For most products, I would use a staged pipeline:

1. Normalize the query.
2. Apply hard filters first.
3. Run lexical and vector retrieval together.
4. Merge candidates.
5. Apply semantic ranking or a custom reranker.
6. Add business scoring.
7. Return results with explanations or highlights.
8. Log enough to evaluate later.

The detail that matters: filters are not optional decoration. They are product constraints.

If a user searches inside tenant A, results from tenant B must never enter the candidate pool. If a recruiter is only allowed to see active candidates, archived candidates should not appear and then get filtered in the UI. Permissions belong in retrieval, not presentation.

## Index Design Is Product Design

The index should reflect how people search.

For a talent platform, I would separate fields by intent:

- `name`, `email`, `location`, `company` for exact or boosted keyword matches.
- `skills`, `titles`, `industries`, `seniority` for structured filters and facets.
- `summary`, `experience`, `projects`, `notes` for semantic matching.
- `tenantId`, `visibility`, `status`, `updatedAt` for access and lifecycle control.
- `contentVector` or multiple vectors for semantic retrieval.

One large text blob is easy to ship and hard to improve. Field structure gives you control. It lets you boost title matches differently from body matches. It lets you debug why a document matched. It lets you add freshness without pretending every old document is equally useful.

For embeddings, I prefer starting with one strong document vector, then splitting only when there is evidence. Multiple vectors can help when a document contains very different sections, but they also increase index complexity and evaluation burden.

## Hybrid Retrieval Needs a Merge Strategy

The most important question is not "keyword or vector?"

It is "what happens when they disagree?"

Lexical search may rank an exact but shallow match high. Vector search may rank a semantically rich but vague match high. Hybrid search should let both candidates compete, but not blindly average everything.

Good merge logic depends on the product:

- Exact entity queries should heavily favor lexical matches.
- Exploratory queries should give vectors more room.
- Recent content can get a small boost if freshness matters.
- Trusted or verified records can outrank weaker records.
- Duplicate or near-duplicate documents should be collapsed.

I like query classification here. You do not need a giant model for it. Even simple rules help:

- Does the query contain a quoted phrase?
- Does it look like a name, email, ID, company, or exact skill?
- Is it a long natural-language sentence?
- Is the user filtering by location, role, or status?

That classification can decide how much to trust lexical search, vectors, and reranking.

## Semantic Ranker Is Not a Magic Wand

Semantic ranking can improve ordering, but it has to be measured. A ranker that makes demos look better can still hurt production if it over-favors polished text, misses exact constraints, or changes behavior across query types.

I would use it on a controlled candidate pool and log:

- query text
- filters
- top lexical candidates
- top vector candidates
- merged candidates
- final ranked results
- clicked result
- skipped results
- saved, shortlisted, opened, or rejected result

Without those logs, relevance conversations become vibes.

## Evaluation Is the Real Feature

Search quality cannot be judged by one screenshot.

I would build a relevance set with real queries and expected judgments. Not just "result is correct" or "incorrect", but graded labels:

- perfect match
- useful match
- related but weak
- wrong
- forbidden or unsafe

Then track metrics like recall at 20, precision at 5, mean reciprocal rank, and query coverage by category. You do not need a research lab. You need a repeatable way to ask, "Did this ranking change make the product better?"

For AI products, I would also add qualitative review. A recruiter can often explain why a candidate feels wrong faster than a metric can. Capture that reason. Turn it into a label. Feed it back into the relevance loop.

## What I Would Ship First

My first version would be boring on purpose:

- Azure AI Search index with clean fields and tenant filters.
- BM25 over structured text fields.
- One embedding vector per searchable document.
- Hybrid retrieval with conservative merge weights.
- Semantic ranker for long natural-language queries.
- Scoring profile for freshness and verified records.
- Query/result logging from day one.
- A small offline relevance set before tuning anything.

That is enough to build a serious search product. The advanced work comes after the logs start telling you where search is failing.

Hybrid search is not powerful because it uses vectors. It is powerful because it gives you multiple ways to retrieve evidence, rank it, and learn from user behavior. The engineering bar is not "does it return something smart-looking?" The bar is "can we explain, measure, and improve the results without breaking trust?"
