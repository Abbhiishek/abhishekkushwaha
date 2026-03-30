---
title: "Why We Chose a TypeScript Monorepo for Our Startup"
description: "The multi-repo pain that drove us to a TypeScript monorepo at HyrecruitAI — specific bugs, quantified benefits, and when this approach does NOT work."
date: "2025-09-10"
tags: typescript, monorepo, architecture, devops
coverImage: /thumbnail.jpg
featured: false
---

# Why We Chose a TypeScript Monorepo for Our Startup

The bug that finally pushed us to migrate was embarrassing. Our API returned `candidateStatus: "in_progress"` but the frontend expected `status: "in-progress"`. Different field name, different casing convention, different repo, no shared types. A hiring manager reported that candidate statuses were showing as "Unknown" in the dashboard. It took 3 hours to trace the issue because the type definitions lived in separate repositories and had drifted silently over two months.

That week, we started the monorepo migration. Here is why, what we measured, and when you should NOT do what we did.

## The Multi-Repo Pain We Escaped

Before the monorepo, HyrecruitAI had three repositories: `web` (Next.js frontend), `api` (backend services), and `shared-types` (TypeScript type definitions published as an npm package). This is a common setup. It is also a trap.

### Type Drift

The `shared-types` package was supposed to be the single source of truth. In practice, it was always one step behind. An engineer would add a field to the API response, update the `shared-types` package, but the frontend would not pull the update until someone noticed something was broken. In 2 months, we had 4 type mismatches reach production:

1. The `candidateStatus` casing bug described above
2. An `evaluationScore` field changed from `number` to `number | null` on the API but the frontend still treated it as non-nullable, causing a crash on the dashboard for candidates without completed evaluations
3. A new `tags` array field added to the interview response that the frontend never consumed because nobody updated the frontend types
4. A pagination response that switched from `{ page, totalPages }` to `{ cursor, hasMore }` — the API was updated, the shared types were updated, but the frontend was still on the old types because nobody ran `npm update @hyrecruit/shared-types`

Each of these was a small bug. Together, they consumed roughly 20 engineering hours over two months and eroded trust in the data layer.

### Coordinated Deploys

A feature that touched both the API and the frontend required two PRs in two repos, reviewed by potentially different people, merged in a specific order (API first, then frontend), and deployed sequentially. If someone merged an unrelated API PR between your API merge and your frontend merge, you might deploy against a different API version than you tested against.

We had one incident where a database migration in the API repo was merged and deployed, but the frontend PR that used the new schema was delayed by a day due to review feedback. For 18 hours, the frontend was making API calls that referenced columns that no longer existed under the old names. The API returned empty data instead of errors because the ORM silently ignored unknown fields.

### Onboarding Friction

A new engineer's first day required:

- Clone 3 repos
- Run `npm install` in 3 directories
- Start 3 dev servers
- Understand 3 CI pipelines
- Figure out which repo to make changes in (answer: usually two of them)

Our median time-to-first-PR for new engineers was 5 days. Most of that time was spent understanding the boundaries between repos and how changes propagated.

## Why TypeScript End-to-End

We use TypeScript everywhere: frontend, backend, database schemas (via Drizzle ORM), and even our infrastructure-as-code scripts. The benefits compound when everything is one language:

**Shared types without publishing.** In the monorepo, our API response types are defined once in a `packages/shared` directory and imported directly by both the backend and the frontend. No npm publish step, no version pinning, no drift. When someone changes a field, TypeScript immediately flags every file that needs updating.

**Refactoring across the stack.** Rename `candidateStatus` to `applicationStatus` and TypeScript shows you every API handler, every frontend component, every test, and every Zod schema that references it. In a multi-repo setup, that rename requires coordinating changes across repositories with no compiler to catch what you missed.

**One hiring pool.** Every engineer on the team can contribute to every part of the system. The frontend engineer who notices a backend performance issue can fix it in the same PR. The backend engineer who sees a UI bug can submit a fix without switching repos or learning a different language's toolchain.

We briefly considered using Go for the API layer. Go's type safety would have been comparable for backend code, but the impedance mismatch at the API boundary would have reintroduced the exact drift problem we were solving. We would need to maintain Go struct definitions and TypeScript interface definitions for every API contract, with no compiler enforcing consistency between them. Zod schemas in TypeScript give us the same type at compile time AND runtime validation. A Go API would require a separate validation layer and two representations of every data structure.

## Quantified Benefits

Six months after completing the migration, we measured the impact:

| Metric | Before (Multi-Repo) | After (Monorepo) |
|--------|---------------------|-------------------|
| Type-related production bugs per month | ~2 | 0 |
| PR merge-to-deploy time | 25 min (sequential deploys) | 8 min (single pipeline) |
| New engineer time-to-first-PR | 5 days | 2 days |
| CI pipeline configs to maintain | 3 | 1 |
| Cross-boundary features per sprint | Required 2 PRs | 1 PR (atomic) |

The most impactful change was atomic PRs. A feature that touches the API schema, the database migration, and the frontend form ships in a single pull request, reviewed together, tested together, deployed together. No more "merge the API first, then the frontend, and pray nothing gets in between."

## Trade-Offs We Accept

Monorepos are not free:

**CI times grow.** Our full build from scratch takes ~4 minutes. We mitigate this with Turborepo's remote caching — builds with warm cache take ~8 seconds, and PRs that only touch the frontend do not rebuild the API. Cache hit rate on our main branch is ~85%.

**IDE performance can suffer.** With 200+ files across packages, TypeScript's language server occasionally lags. We use TypeScript project references (`composite: true`) so that packages type-check against declaration files rather than source, which keeps the language server responsive.

**Package boundary discipline.** In a monorepo, it is tempting to import anything from anywhere. We enforce boundaries with ESLint rules that block deep imports into package internals and restrict cross-package imports to public APIs only.

For the hands-on implementation details — workspace layout, Turborepo configuration, caching setup, and CI optimization — see [Setting Up a TypeScript Monorepo with Turborepo That Actually Scales](/blog/typescript-monorepo-turborepo).

## When NOT to Use a TypeScript Monorepo

This approach has worked well for our team of 15 engineers. It does not work for everyone.

**Teams larger than ~30 engineers.** At that size, build times become a real problem even with aggressive caching. Ownership boundaries get fuzzy — who approves changes to the shared package that 8 teams depend on? You start needing CODEOWNERS files, merge queues, and build partitioning that erode the simplicity advantage.

**Performance-critical services that need Go, Rust, or C++.** If your video encoding pipeline or ML inference server needs to run at maximum performance, TypeScript is the wrong tool. We keep these workloads as separate services that communicate over well-defined APIs. The monorepo contains the TypeScript ecosystem; it does not try to contain everything.

**When services genuinely do not share code.** If your frontend and backend have zero shared types, zero shared validation logic, and zero shared configuration, the monorepo adds tooling complexity for no benefit. This is rare in practice — most teams share at least API types and error codes — but it does happen.

**When services have fundamentally different deploy cadences.** If your frontend deploys 10 times a day but your backend deploys once a week, a monorepo forces you to either decouple deploys within the monorepo (which adds complexity) or slow down the frontend to match the backend. We deploy all services on the same cadence, so this is not an issue for us. If your teams operate more independently, separate repos with a shared types package (and rigorous CI checks on type compatibility) might be the better trade-off.

## The Bottom Line

The monorepo did not make us faster because of any single feature. It made us faster because it eliminated an entire category of bugs (type drift), an entire category of coordination overhead (multi-repo deploys), and an entire category of onboarding friction (multi-repo setup). For a startup where every engineer touches every part of the stack, those savings compound into weeks of recovered productivity per quarter.

If your team is under 20 engineers and your stack is primarily TypeScript, this is the right default. You can always extract a service into its own repo later if you need to. Going the other direction — from multi-repo to monorepo — is much more painful. We know from experience.
