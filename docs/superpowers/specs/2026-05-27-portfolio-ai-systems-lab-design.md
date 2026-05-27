# Portfolio AI Systems Lab Redesign

## Context

Abhishek wants the portfolio to stop being primarily tied to HyrecruitAI and become a personal brand surface. HyrecruitAI should remain an important experience and proof point, but the first impression should be Abhishek as a senior AI product engineer.

The site is a Next.js and Tailwind portfolio with content-driven pages for home, work, projects, blog, about, talks, tech, education, and links. The current homepage is photo-led and identifies Abhishek mainly as "CTO & Co-founder at HyrecruitAI." The redesign will keep the existing app structure while changing the identity, visual system, and content hierarchy.

## Approved Direction

Primary identity: senior AI product engineer.

Primary audience: senior AI engineer and product engineer opportunities.

Supporting proof: writing, talks, developer authority, and community credibility.

Visual tone: Precision Lab with controlled Future Workshop energy.

Selected approach: AI Systems Lab with a few Builder OS interactions.

## Goals

1. Make the first five seconds communicate: "Abhishek builds and scales real-time intelligent product systems."
2. Reframe HyrecruitAI as one strong proof point, not the whole identity.
3. Surface technical range across agents, LLM evaluation, voice/video systems, semantic caching, multi-tenant SaaS, infrastructure, and product UI.
4. Use writing and talks as evidence of depth and developer authority.
5. Preserve the existing route structure and content model where practical.
6. Create a more distinctive, polished visual experience that feels credible to engineers and memorable to designers.

## Non-Goals

1. Do not rewrite every blog post. HyrecruitAI references inside technical articles can remain because they are evidence of experience.
2. Do not turn the portfolio into a generic startup founder page.
3. Do not add a CMS, database, or external design dependency.
4. Do not replace the whole app architecture unless the current structure blocks the redesign.
5. Do not make a marketing landing page where the real portfolio content is hidden below generic hero copy.

## Information Architecture

### Home

The homepage becomes the main personal brand surface.

Required sections:

1. Hero: AI product engineer positioning, short credibility copy, social/action links, and a system-console visual panel.
2. Proof rails: systems shipped, engineering range, and authority signals.
3. AI systems case studies: curated proof cards for real-time interviews, voice agents, LLM evaluation, guardrails, WebRTC, semantic caching, and multi-tenant SaaS.
4. Selected writing: AI infrastructure, LLM evaluation, voice agents, semantic caching, WebRTC, and startup architecture posts.
5. Current focus: replace HyrecruitAI-only "now" copy with broader AI product systems, evaluation, developer tooling, and writing.
6. Contact CTA: invite senior AI/product engineering conversations, technical collaborations, talks, and writing opportunities.

### Work

Work becomes experience proof. HyrecruitAI should appear as the first major experience or case block, focused on ownership and impact.

Each work item should answer:

1. What did Abhishek own?
2. What systems did he build?
3. What technical constraints mattered?
4. What product or engineering impact resulted?

### Project

Projects become "Systems & Experiments."

Each card should explain the judgment demonstrated by the project, such as product thinking, developer tooling, CLI design, community systems, API design, or AI product architecture.

### Blog

Blog remains a major authority surface. The homepage should curate blog posts that prove AI systems depth instead of treating the blog as a generic feed.

### About

About becomes personal and sharp. It should still show personality, curiosity, community, writing, and teaching, but it should remove outdated student-heavy framing and reduce unrelated hobby detail.

### Talks

Talks should no longer feel unfinished. If only a few talks are available, the page should become "Talks, notes, and field demos" with a polished lightweight state and one highlighted AI agents talk.

### Metadata

SEO metadata should move away from "CTO & Co-founder at HyrecruitAI" and toward "AI product engineer building real-time intelligent systems."

## Homepage Design

The homepage should lead with a high-confidence hero:

Headline: "AI Product Engineer building real-time intelligent systems."

Supporting copy should communicate that Abhishek designs, ships, and scales AI products across agents, evaluation systems, real-time voice/video, multi-tenant SaaS, and developer-facing tools.

The right side of the hero should become a "system console" or "lab panel" rather than a simple photo block. It should use real labels from Abhishek's work:

1. Voice pipeline
2. LLM evaluation
3. Guardrails
4. Embeddings
5. WebRTC
6. Multi-tenant SaaS
7. Product UI
8. Developer tooling

The console should feel alive through restrained motion, status indicators, subtle grid lines, and metric-style labels. It should not become a fake dashboard full of meaningless numbers.

HyrecruitAI should be visible as a case study or experience badge, not as the homepage identity.

## Visual Language

The site should feel like a precise AI systems lab:

1. High contrast, technical, clean, and deliberate.
2. More structured information density than the current bento/photo approach.
3. Subtle futuristic details: thin lines, signal paths, terminal-style labels, status dots, and small animated traces.
4. Avoid one-note purple gradients, oversized decorative cards, and generic AI portfolio patterns.
5. Keep cards for repeated content only. Sections should be full-width layouts or unframed content bands.
6. Typography should feel technical and editorial. Existing fonts can stay if they support the new direction, but the design should not feel playful in the wrong places.

## Content Voice

Voice should be direct, senior, and product-aware:

1. Use "I build" and "I ship" language where it improves clarity.
2. Prefer concrete systems over broad claims.
3. Describe HyrecruitAI work as experience and proof, not as the entire personal identity.
4. Make writing and talks sound like evidence of practice, not side decoration.
5. Keep personality in About, but keep the homepage focused.

## Component Boundaries

The redesign should fit the existing project:

1. Keep `app/page.tsx` as the home composition file.
2. Replace or heavily revise home components in `components/home`.
3. Keep `lib/project.ts` and `content/*.md` as simple data/content sources unless a local data file is needed for case studies.
4. Reuse existing motion helpers where they fit.
5. Use Tailwind for styling and avoid CSS modules.
6. Keep server components by default; use client components only for interactive or animated sections.

## Data Flow

The homepage should continue to use local static content:

1. Featured projects from `lib/project.ts`.
2. Blog posts from local content utilities or the existing blog source.
3. Current focus from `content/now.md`, rewritten to match the new identity.
4. Experience content from `content/work.md` or route-level content updates.

No new API dependency is required.

## Accessibility And Responsiveness

1. The hero must work on mobile without the console panel overwhelming the message.
2. Text must not overlap at small widths.
3. Motion should be subtle and not required to understand content.
4. Links and calls to action need clear accessible labels.
5. Dark and light modes should remain usable if both are still supported.
6. The first viewport should show a hint of the next section on common desktop and mobile viewport heights.

## Verification Plan

After implementation, verify:

1. `pnpm lint` or the repo's active package-manager equivalent.
2. `pnpm build` or the repo's active package-manager equivalent.
3. Browser check on `http://localhost:3000/`.
4. Mobile and desktop screenshots for hero, case studies, and writing sections.
5. Console/log check for obvious runtime or image errors.
6. Quick content scan for remaining homepage metadata or copy that frames HyrecruitAI as the primary identity.

## Implementation Notes

Implementation should happen after this spec is approved and a separate implementation plan is written. The plan should break work into small checkpoints:

1. Content/data rewrite.
2. Homepage component redesign.
3. Supporting route polish.
4. Metadata update.
5. Visual QA and verification.
