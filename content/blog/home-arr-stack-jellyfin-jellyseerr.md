---
title: "The Home ARR Lab"
description: "What a self-hosted Jellyfin, Jellyseerr, Sonarr, Radarr, indexer, and download-client stack teaches about queues, automation, observability, and operating real systems."
date: "2026-05-26"
tags: self-hosting, jellyfin, jellyseerr, sonarr, radarr, systems
coverImage: /me.webp
featured: true
---

A home media automation stack is basically a small distributed system wearing a hoodie.

On the surface, it looks like a weekend setup: Jellyfin for streaming, Jellyseerr for requests, Sonarr for shows, Radarr for movies, an indexer layer, a download client, and some storage. Underneath, it teaches the same lessons that show up in production products: queues, retries, permissions, naming conventions, broken dependencies, observability, and the pain of not designing failure states.

This post is not a guide to piracy. The useful engineering lesson is the architecture pattern: a request enters the system, multiple services enrich it, a worker picks it up, files move through lifecycle states, metadata gets normalized, and the final experience only works if the whole chain is boringly reliable.

## The Product Surface Is Jellyseerr

Jellyseerr is the user-facing layer.

That matters because every automation stack needs a front door. Users should not care about indexers, release profiles, folder paths, naming rules, or whether a background worker is currently backed up. They should be able to search, request, see status, and trust that the system is doing something.

Good product surfaces hide complexity, but they should not hide state.

A clean request flow needs:

- requested
- approved or rejected
- searching
- queued
- downloading
- imported
- available
- failed with a reason

The last one is the most important. A system that fails silently is worse than a manual workflow. At least manual work lets the operator know where it got stuck.

## Sonarr And Radarr Are Domain Workers

Sonarr and Radarr are not just download helpers. They are domain-specific workflow engines.

They understand seasons, episodes, movies, naming conventions, release quality, missing items, upgrades, and monitoring rules. That is the difference between a general queue and a useful automation system.

In product engineering, this maps to a pattern I like:

- Keep the user-facing app simple.
- Move domain automation into focused workers.
- Let each worker own the rules for its object type.
- Make state visible across the whole chain.

Sonarr should own show logic. Radarr should own movie logic. The request surface should not know every release rule. The streaming surface should not know how import decisions are made. Clear ownership makes the stack easier to debug.

## Indexers Are Retrieval Infrastructure

The indexer layer is search infrastructure.

It turns a user intent into candidates. Those candidates are messy. Some are low quality. Some are duplicates. Some are incorrectly tagged. Some do not match the constraints. The system has to retrieve, filter, rank, and choose.

That is the same shape as AI search.

The temptation is to add more sources and call the system better. In practice, more sources increase noise unless you have rules:

- Which sources are trusted?
- Which categories are allowed?
- Which quality profiles matter?
- What happens when two candidates look identical?
- What is the fallback when no candidate matches?

Retrieval without ranking becomes noise. Ranking without constraints becomes risky. A good automation stack needs both.

## The Download Client Is A Queue, Not A Detail

The download client is where the system becomes operational.

Queues can back up. Jobs can stall. Disk can fill. Network can fail. A job can finish but not import. A job can import but land in the wrong folder. This is where happy-path architecture diagrams start lying.

For any queue-backed system, I want to know:

- What is currently queued?
- What is blocked?
- What failed recently?
- What can retry automatically?
- What needs human intervention?
- What is the oldest stuck item?

Those questions matter in SaaS too. Whether the queue is moving files, scoring interviews, sending emails, generating reports, or processing embeddings, the same principle holds: background work needs visibility.

## Naming Is A System Boundary

File naming feels small until the entire stack depends on it.

Jellyfin needs predictable paths and metadata. Sonarr and Radarr need import rules. Users need clean libraries. Backups need stable folders. Every inconsistency becomes a future debugging session.

This maps directly to product data modeling.

If your identifiers, naming rules, and lifecycle states are inconsistent, every integration pays the price. A clean convention is not cosmetic. It is an API between services.

## Where I Would Add Observability

For a self-hosted lab, simple observability is enough:

- health checks for each service
- disk usage alerts
- queue age alerts
- failed import notifications
- request-to-available timing
- service restart visibility

The interesting metric is not only uptime. It is request latency across the whole workflow.

How long did it take from request to availability? Where did the time go? Was it waiting on approval, search, download, import, metadata refresh, or library scan?

That is the kind of metric product teams should care about too. Users experience workflows, not services.

## Why This Belongs On An Engineering Portfolio

Self-hosted systems are useful because they make infrastructure tangible. You can see the queue. You can break the import path. You can misconfigure a service and feel the downstream effect. You can learn why logs, permissions, backups, and naming rules matter.

It is a small lab for product operations.

The lesson is not "I run a media stack." The lesson is that reliable automation is made of boring boundaries:

- one front door
- clear domain workers
- retrieval constraints
- queue visibility
- predictable storage
- explicit failure states
- observability close to the user workflow

That same thinking travels into AI products. A candidate matching engine, an LLM evaluation pipeline, or a voice interview system is also a set of requests moving through services. The polish comes from making every state understandable.
