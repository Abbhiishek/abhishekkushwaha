---
title: "What Maintaining Open Source Projects Actually Taught Me"
description: "Hard-won lessons from building and maintaining open-source projects — community, PRs, docs, and avoiding burnout."
date: "2025-07-12"
tags: open-source, community, developer-experience, lessons
coverImage: /thumbnail.jpg
featured: false
---

I started contributing to open source in college. A few years and several thousand GitHub contributions later, I have maintained projects that ranged from tiny CLI tools to libraries with real users filing real issues at 2 AM. Here is what I actually learned.

## Your README Is Your Product's Landing Page

This one took me embarrassingly long to figure out. I would build something genuinely useful, push it to GitHub, write a three-line README, and wonder why nobody used it.

The turning point was when I rewrote a project's README with:

- A one-sentence explanation of what it does
- A GIF showing it in action
- A copy-paste install command
- A minimal working example

One of my CLI tools went from 40 stars to 300+ after the README rewrite. Weekly npm installs jumped from ~50 to ~400. The code did not change at all. The lesson: people evaluate your project in under 30 seconds. If they cannot understand what it does and how to use it in that window, they leave.

My most-used library now has 1.2k stars and about 200 weekly downloads. It is maintained by 3 regular contributors — none of whom I recruited. They showed up because the contributing guide was clear, the issue labels were useful, and the first PR experience did not require a 2-hour dev environment setup.

## Pull Requests Need Guardrails, Not Gatekeeping

Early on, I either merged everything or reviewed nothing. Both are terrible strategies.

What actually works:

- **Issue-first workflow** — require an issue before a PR so you can discuss the approach before someone writes 400 lines
- **PR templates** — a simple checklist cuts review time in half
- **CI that runs before you look at it** — linting, tests, type checks. If CI fails, the PR is not ready for human review
- **Response time matters more than thoroughness** — a quick "thanks, will review this week" keeps contributors engaged. Silence kills motivation

```yaml
# .github/PULL_REQUEST_TEMPLATE.md
## What does this PR do?
## Related issue
## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or migration guide included)
```

## Community Management Is Mostly Just Being Present

I used to think community management meant elaborate governance docs and contributor ladders. For most projects, it is much simpler:

- **Reply to issues within 48 hours**, even if it is just an acknowledgment
- **Label issues clearly** — `good first issue`, `help wanted`, `bug`, `enhancement`
- **Thank people publicly** — a simple "great catch, thanks for reporting" goes a long way
- **Be honest about project status** — if you are not maintaining something actively, say so in the README

The projects where I stayed responsive grew organically. The ones where I went silent for two weeks accumulated angry issues and frustrated contributors.

## Burnout Is the Default Outcome

This is the part nobody warns you about. Open source maintenance is unpaid on-call work with an unlimited number of stakeholders who feel entitled to your time.

I burned out twice. What I changed:

- **Set explicit boundaries** — I only review issues and PRs on weekdays. My GitHub profile says this clearly
- **Say no to scope creep** — not every feature request deserves implementation. "This is out of scope for this project" is a complete sentence
- **Automate everything possible** — Dependabot, auto-labeling, stale issue bots. Every manual task you eliminate is energy saved
- **Take breaks without guilt** — the project will survive a week without you. If it cannot, that is a bus factor problem to solve, not a reason to never rest

## Documentation Is Never Done

I treat docs like code now. They get PRs, they get reviews, they get versioned. The pattern that works best for me:

- **Quick start** — get someone from zero to working in under 5 minutes
- **API reference** — auto-generated from code comments where possible
- **Guides** — explain the "why" behind design decisions
- **Contributing guide** — lower the barrier for new contributors

At HyrecruitAI, we apply the same philosophy internally. Every internal tool gets a README. Every API gets example requests. It is the open-source discipline applied to a startup context, and it pays for itself every time a new engineer onboards.

## My Open-Source Tooling Stack

After years of experimentation, this is the tooling setup that works for me:

- **Versioning:** Changesets. Handles monorepo versioning, generates changelogs, and publishes to npm in a single workflow. Far less friction than manual version bumps.
- **Building:** tsup. Zero-config TypeScript bundler that outputs both ESM and CJS. I spent too many hours configuring Rollup before finding tsup.
- **Testing:** Vitest. Fast, TypeScript-native, compatible with Jest APIs so migration is painless.
- **Pre-commit:** Lefthook. Faster than Husky, simpler config, runs tasks in parallel.
- **CI/Release:** GitHub Actions with Changesets action. On merge to main, it either opens a "Version Packages" PR or publishes to npm — fully automated.
- **Dependency updates:** Renovate, not Dependabot. Renovate's grouping (batch all minor updates into one PR), scheduling (only open PRs on Mondays), and auto-merge for passing patch updates save significant review time. Dependabot opens a separate PR for every dependency, which drowns you in noise.
- **Docs:** Mintlify or Starlight (Astro-based) for anything with more than 5 pages. README-only for smaller projects. The decision point: if you need a sidebar navigation, you need a docs site.
- **Issue management:** Auto-label bot for triage (assigns labels based on file paths changed in linked PRs), stale bot with a 60-day window and a 14-day warning period before closing.

## The Real Lesson

Open source taught me that software is a social activity. The best code in the world is useless if nobody can find it, understand it, or contribute to it. That mindset shapes everything I build now — from HyrecruitAI's platform to our internal tooling. Build for humans first, computers second.
