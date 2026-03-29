---
title: 'From Code to Production: Our CI/CD Pipeline with Azure and GitHub Actions'
description: 'How we deploy HyrecruitAI from code to staging to production using Azure and GitHub Actions, with environment management and rollback strategy.'
date: '2025-11-20'
tags: azure, github-actions, cicd, devops
coverImage: /thumbnail.jpg
featured: true
---

When I co-founded HyrecruitAI, deployments were me SSHing into a VM at 2 AM. That worked for the first month. Then we hired two more engineers, broke production twice in a week, and I knew we needed a real pipeline.

Here is how we built a CI/CD system with GitHub Actions and Azure that lets us ship confidently multiple times a day.

## The Pipeline Architecture

Our deployment flows through three stages: **build and test**, **staging**, and **production**. Every pull request triggers the first two. Production only fires on merges to `main`.

```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run test
      - run: bun run build

  deploy-staging:
    needs: build-and-test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: azure/webapps-deploy@v3
        with:
          app-name: hyrecruit-staging
          slot-name: preview
```

The key insight was using Azure deployment slots. Our staging slot runs on the same App Service plan as production, so we catch environment-specific issues before they reach users.

## Environment Management

We maintain three environments with distinct configurations:

- **Development** -- local machines, local PostgreSQL, mock external services
- **Staging** -- Azure App Service slot, staging database (seeded with anonymized production data), real third-party integrations in sandbox mode
- **Production** -- Azure App Service, production PostgreSQL on Azure Database for PostgreSQL

Each environment has its own `.env` template tracked in the repo. The actual values live in GitHub Environments, which scope secrets per deployment target.

## Secrets Handling

This is where most teams get it wrong. We follow a strict hierarchy:

1. **GitHub Environment Secrets** for deployment credentials (`AZURE_WEBAPP_PUBLISH_PROFILE`, `DATABASE_URL`)
2. **Azure Key Vault** for application secrets that the running app needs (`OPENAI_API_KEY`, `STRIPE_SECRET_KEY`)
3. **Never in code.** We run `gitleaks` as a pre-commit hook and as a CI step

```yaml
- name: Pull secrets from Key Vault
  uses: Azure/get-keyvault-secrets@v1
  with:
    keyvault: hyrecruit-vault
    secrets: 'OPENAI-API-KEY, DATABASE-URL, REDIS-URL'
  id: keyvault
```

The app reads secrets at startup and fails fast if any required value is missing. No silent fallbacks to defaults.

## Rollback Strategy

Rolling back is not optional -- it is a core feature of the pipeline. We use Azure deployment slots for zero-downtime rollbacks:

1. Every production deploy first goes to a **pre-production slot**
2. We run a health check suite against the slot (database connectivity, external API reachability, critical endpoint smoke tests)
3. If health checks pass, we **swap** the slot into production
4. If something breaks post-swap, we swap back in under 30 seconds

```bash
az webapp deployment slot swap \
  --resource-group hyrecruit-rg \
  --name hyrecruit-prod \
  --slot pre-production \
  --target-slot production
```

We also tag every production deployment in git and keep the last 10 build artifacts in GitHub Actions. If a slot swap is not sufficient, we can redeploy any previous build within minutes.

## Database Migrations

Migrations deserve special attention. We run Drizzle ORM migrations as a separate CI step before the application deploy. The rule is simple: migrations must be backward-compatible. If a migration would break the currently running version, we split it into two releases -- one that adds the new schema, and one that removes the old.

## What We Learned

After eight months of running this pipeline, three things stand out:

- **Deployment slots are underrated.** The ability to swap and swap back in seconds has saved us multiple times.
- **Environment parity matters.** Our staging database uses the same PostgreSQL version and extensions as production. No surprises.
- **Fast feedback loops change behavior.** When deploys take 3 minutes instead of 30, engineers deploy smaller changes more frequently, which means fewer incidents.

The total setup took us about a week. The time saved since then is immeasurable. If you are building on Azure, deployment slots plus GitHub Actions is a combination that punches well above its weight.
