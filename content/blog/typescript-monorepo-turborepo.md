---
title: "Setting Up a TypeScript Monorepo with Turborepo That Actually Scales"
description: "A practical guide to structuring a TypeScript monorepo with Turborepo — workspace layout, shared packages, caching, and CI."
date: "2025-06-01"
tags: typescript, turborepo, monorepo, devops, ci-cd
coverImage: /thumbnail.jpg
featured: false
---

When we started building HyrecruitAI, we had a Next.js frontend and a handful of backend services. Within three months, we had shared types leaking everywhere, duplicated utility functions, and deployment scripts that nobody trusted. That is when we moved to a Turborepo monorepo, and it changed how we ship code.

Here is how we set it up and what we learned along the way.

## The Workspace Structure

After trying several layouts, this is the structure we settled on:

```
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # Express/Hono API server
│   └── jobs/             # Background job workers
├── packages/
│   ├── ui/               # Shared React components
│   ├── db/               # Drizzle ORM schemas + migrations
│   ├── config-ts/        # Shared tsconfig bases
│   ├── config-eslint/    # Shared ESLint configs
│   └── shared/           # Types, validators, constants
├── turbo.json
└── package.json
```

The key insight: **apps consume packages, packages never import from apps, and packages rarely import from each other.** This keeps the dependency graph clean and builds fast.

## Shared Packages Done Right

The `packages/shared` package is where we put everything that two or more apps need. Zod schemas live here because they serve as both runtime validators and TypeScript types:

```typescript
// packages/shared/src/schemas/candidate.ts
import { z } from 'zod';

export const candidateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  status: z.enum(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']),
});

export type Candidate = z.infer<typeof candidateSchema>;
```

Both the API and the frontend import from `@hyrecruit/shared`. One schema, one type, zero drift between what the backend validates and what the frontend expects.

## Package Boundary Enforcement

A monorepo's biggest risk is spaghetti imports. Without guardrails, any file can import from any other file, and the clean package boundaries dissolve within weeks.

We enforce boundaries at two levels:

**ESLint rules block deep imports.** Each package exposes a public API through its `index.ts`. Importing from internal modules triggers a lint error:

```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [
        { "group": ["@hyrecruit/*/src/internal/*"], "message": "Import from the package's public API, not internal modules." }
      ]
    }]
  }
}
```

This rule caught 12 boundary violations in the first month — mostly engineers taking shortcuts by importing a utility directly from a package's internal directory instead of re-exporting it through the public API.

**TypeScript project references.** We use `composite: true` in each package's `tsconfig.json` so that packages only see each other's declaration files, not source code. This has two benefits: the TypeScript language server stays fast because it does not parse source across all packages, and it physically enforces that cross-package imports go through the compiled public API.

## Turborepo Configuration

Our `turbo.json` defines the task pipeline:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

The `dependsOn: ["^build"]` is critical. It means "build my dependencies before building me." Without it, you get mysterious type errors because a package was not compiled before the app that imports it.

## Build Caching Changes Everything

Turborepo's remote caching was the single biggest productivity win. We use Vercel's remote cache, but you can self-host with `turborepo-remote-cache` if you prefer.

The numbers from our repo:

- **Full build from scratch:** ~4 minutes
- **Build with warm cache (no changes):** ~8 seconds
- **Build after touching one package:** ~45 seconds (only rebuilds affected apps)

In CI, this means PRs that only touch the frontend do not rebuild the API server. The cache hit rate on our main branch sits around 85%.

## CI Optimization with GitHub Actions

Our CI pipeline uses Turborepo's `--filter` flag to only run tasks for affected packages:

```yaml
- name: Build affected packages
  run: npx turbo build --filter=...[HEAD^1]

- name: Test affected packages
  run: npx turbo test --filter=...[HEAD^1]
```

The `...[HEAD^1]` syntax means "packages that changed since the last commit." Combined with remote caching, our average CI time dropped from 12 minutes to under 3 minutes.

## Lessons Learned

**Start with fewer packages.** We initially split things too aggressively and spent more time managing package boundaries than writing features. Start with `apps/` and one `packages/shared`, then extract packages only when you feel real pain.

**Pin your TypeScript version.** Different TypeScript versions across packages cause bizarre type errors. We have a single `typescript` dependency in the root `package.json` and reference it everywhere.

**Use `workspace:*` for internal dependencies.** This tells your package manager to always resolve to the local version:

```json
{
  "dependencies": {
    "@hyrecruit/shared": "workspace:*"
  }
}
```

**Invest in the shared tsconfig early.** A base `tsconfig.json` in `packages/config-ts` that all apps extend prevents configuration drift and "works on my machine" issues.

## Troubleshooting Common Monorepo Issues

After a year of running this setup, these are the problems that tripped us up and how we fixed them:

**Ghost dependencies.** An app imports a package that is only installed in another app's `node_modules`. It works locally because of hoisting — the package manager lifts dependencies to the root `node_modules`. It fails in CI or on a fresh install. The fix: use `pnpm` with `strict-peer-dependencies=true` and ensure every package declares its own dependencies explicitly. Hoisting is convenient until it hides missing dependencies.

**TypeScript version skew.** One package on TypeScript 5.3, another on 5.4. Type inference differs subtly between versions, causing builds to pass locally but fail in CI (or vice versa). The fix: a single `typescript` dependency in the root `package.json`, referenced everywhere. In pnpm, you can use the catalog feature: `"typescript": "catalog:"` in workspace packages resolves to the version defined once in `pnpm-workspace.yaml`.

**Turborepo cache poisoning.** A build output includes an absolute path (e.g., source maps referencing `/Users/abhishek/...`) or a build timestamp. The cache key matches, but the output is machine-specific, so other developers get cache hits with broken paths. The fix: audit the `outputs` in `turbo.json` and ensure all build outputs are deterministic. Remove timestamps from build output, use relative paths in source maps (`--sourceRoot /` flag), and avoid injecting `BUILD_TIME` environment variables into builds.

The monorepo is not a silver bullet. It adds complexity to your tooling and CI. But for a startup where three engineers touch every part of the stack, having everything in one repo with shared types and a single PR workflow is a significant multiplier on shipping speed.

For the strategic reasoning behind choosing a monorepo (and when NOT to), see [Why We Chose a TypeScript Monorepo for Our Startup](/blog/why-typescript-monorepo).
