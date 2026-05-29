import type { Project } from "./types"

export const projects: Project[] = [
    {
        slug: "devresume",
        title: "DevResume",
        tagline: "Portfolio builder with custom domains for developers.",
        description:
            "A hosted portfolio platform where developers could create a site, manage resume/projects/blog content, and publish on a subdomain or their own DNS-backed domain.",
        judgment: "Portfolio SaaS - custom domains, auth, publishing",
        stack: ["Next.js", "Prisma", "Postgres", "Clerk", "Vercel DNS"],
        image: "/devresume.png",
        accent: "emerald",
        layout: "product",
        status: "shipped",
        period: "2023",
        githubUrl: "https://github.com/Abbhiishek/dresume",
        featured: true,
    },
    {
        slug: "wiidgets",
        title: "Wiidgets",
        tagline: "API endpoints that render GitHub widgets as SVG.",
        description:
            "A Next.js endpoint platform for README/profile widgets: banners, repo cards, Buy Me a Coffee cards, themes, and GitHub-data visuals returned as embeddable SVG.",
        judgment: "API product - SVG endpoints for GitHub profiles",
        stack: ["Next.js", "SVG", "GitHub API", "Vercel", "Nextra"],
        image: "/wiidgets.png",
        accent: "violet",
        layout: "developer-ref",
        status: "shipped",
        period: "2023",
        githubUrl: "https://github.com/Abbhiishek/Widgets",
        featured: true,
    },
    {
        slug: "code-community-music",
        title: "Code Community Music",
        tagline: "Developer community platform built with React and Django.",
        description:
            "An early full-stack community app where developers could sign in, share projects and ideas, discuss in forums, and run the platform locally with Docker.",
        judgment: "Community product - React + Django full stack",
        stack: ["React", "Next.js", "Django", "Postgres", "Docker"],
        image: "/ccm.png",
        accent: "sky",
        layout: "editorial",
        status: "archived",
        period: "2022 - 2023",
        githubUrl: "https://github.com/Abbhiishek/codecommunitymusic",
        featured: true,
    },
    {
        slug: "todoska",
        title: "Todoska",
        tagline: "Python CLI todo tracker with rich terminal tables.",
        description:
            "A PyPI-installable todo manager with add, show, update, complete, and delete commands, categories, status tracking, and Rich/Typer-powered terminal output.",
        judgment: "CLI UX - Python terminal productivity",
        stack: ["Python", "Typer", "Rich", "SQLite", "PyPI"],
        image: "/todoska.gif",
        accent: "amber",
        layout: "terminal",
        status: "shipped",
        period: "2023",
        githubUrl: "https://github.com/Abbhiishek/Todoska",
        featured: true,
    },
]

export function getFeaturedProjects(): Project[] {
    return projects.filter((p) => p.featured)
}

export function getProjectBySlug(slug: string): Project | undefined {
    return projects.find((p) => p.slug === slug)
}
