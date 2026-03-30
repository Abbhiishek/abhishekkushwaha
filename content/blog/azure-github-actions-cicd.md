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

## Post-Deploy Monitoring

Every production deploy triggers a 10-minute monitoring window. We watch three signals:

- **Error rate** via Sentry — alerts if it increases by more than 2x baseline
- **p95 latency** via Azure Application Insights — alerts if it exceeds 2 seconds
- **Interview completion rate** — our key business metric. If it drops by more than 10%, something user-facing is broken

If any signal crosses its threshold during the monitoring window, we auto-rollback via slot swap. The rollback is triggered by an Azure Monitor alert rule that calls a webhook, which in turn runs the slot swap command. Total time from detection to rollback: under 60 seconds.

Our health check endpoint (`/api/health`) validates more than just "the server is running." It checks:

- Database connectivity (a lightweight `SELECT 1` query)
- Redis connectivity
- External API reachability (Azure Speech Services, OpenAI)
- Disk space and memory (basic thresholds)

If any check fails, the endpoint returns a 503. The deployment slot health probe calls this endpoint, and a failing probe blocks the slot swap from proceeding.

Alert routing: critical alerts (error rate spike, health check failure) go to PagerDuty. Warning alerts (latency increase, elevated queue depth) go to a Slack channel. Informational notifications (deploy started, deploy completed, slot swapped) go to the deploy channel.

## Canary Deployments for High-Risk Changes

For changes that touch the database schema, AI model configuration, or core interview flow, we use a weighted traffic split instead of an all-or-nothing slot swap:

1. Route 10% of traffic to the new version for 1 hour
2. If signals are healthy, increase to 50% for 30 minutes
3. If still healthy, route 100% (full swap)

Azure App Service supports traffic routing between slots natively:

```bash
az webapp traffic-routing set \
  --resource-group hyrecruit-rg \
  --name hyrecruit-prod \
  --distribution pre-production=10
```

The canary saved us once. A Drizzle ORM minor version update changed query generation behavior for a specific left join pattern. The 10% canary showed a 3x increase in query duration for dashboard page loads. We caught it within 20 minutes and reverted the canary before 90% of users were ever exposed.

## What We Learned

After eight months of running this pipeline, three things stand out:

- **Deployment slots are underrated.** The ability to swap and swap back in seconds has saved us multiple times.
- **Environment parity matters.** Our staging database uses the same PostgreSQL version and extensions as production. No surprises.
- **Fast feedback loops change behavior.** When deploys take 3 minutes instead of 30, engineers deploy smaller changes more frequently, which means fewer incidents.

The total setup took us about a week. The time saved since then is immeasurable. If you are building on Azure, deployment slots plus GitHub Actions is a combination that punches well above its weight.
