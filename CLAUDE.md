# CLAUDE.md

## Project Overview

Personal portfolio website for Abhishek Kushwaha (https://abhishekkushwaha.me). Showcases projects, blog posts, work experience, education, and social links with smooth animations and dark mode support.

## Tech Stack

- **Framework:** Next.js 14 (App Router) with React 18 and TypeScript 5
- **Styling:** Tailwind CSS 3.4 with custom color palette (navy-blue, brand colors)
- **Animations:** Framer Motion 11
- **Navigation:** kbar command palette with keyboard shortcuts
- **Theme:** next-themes (dark/light mode, class-based)
- **Content:** Markdown files in `content/` rendered with showdown
- **Blog:** Fetched from Dev.to API via Axios
- **Package Manager:** Bun (bun.lockb present)

## Commands

```bash
bun dev          # Start dev server (port 3000)
bun run build    # Production build
bun run lint     # ESLint check
bun run prettier # Format code with Prettier
```

## Project Structure

```
app/             # Next.js App Router pages
components/      # Shared and page-specific components
  ui/            # Animation/motion UI components (bento-grid, wobble-card, etc.)
  home/          # Home page components
lib/             # Data, types, configs (nav items, links, blog API, kbar actions)
utils/           # Utilities (cn helper for clsx + tailwind-merge)
content/         # Markdown content (about.md, work.md, now.md)
public/          # Static assets (images)
```

## Code Conventions

- **Components:** PascalCase filenames and exports
- **Utilities/functions:** camelCase
- **Path alias:** `@/*` maps to project root
- **Styling:** Tailwind CSS only (no CSS modules); dark mode via `dark:` prefix
- **React patterns:** Server components by default; `"use client"` only for interactive components
- **Commits:** Conventional commits enforced via commitlint (feat, fix, docs, etc.), max 100 char header, lowercase scope
- **Pre-commit hook:** Runs `bun lint` via Husky
- **Formatting:** Prettier with ES5 trailing commas, 2-space indent, single quotes, semicolons

## Key Pages

- `/` — Bento grid hero with profile and flip-role animation
- `/about` — Markdown content + photo layout grid
- `/blog` — Dev.to posts (fetched from API, 3-column grid)
- `/project` — 8 projects displayed as wobble cards
- `/work` — Work experience from markdown
- `/education` — Education timeline
- `/links` — Social media links with icons
- `/tech`, `/talks` — In progress

## External APIs

- **Dev.to:** Blog posts fetched from `https://dev.to/api/articles?username=abbhiishek`
- **Remote images:** All hosts allowed in next.config.mjs
