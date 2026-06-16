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
    {
        slug: "pdf-kabootr",
        title: "PDF Tools",
        tagline: "Private, on-device PDF toolkit for browser workflows.",
        description:
            "A local-first PDF workspace for merging, splitting, organizing, compressing, protecting, signing, and converting documents without uploads or accounts.",
        judgment: "Browser utility - private PDF processing",
        stack: ["Astro", "React", "PDF tooling", "PWA", "Cloudflare"],
        image: "/pdf-kabootr.png",
        accent: "rose",
        layout: "utility-product",
        status: "shipped",
        period: "2026",
        liveUrl: "https://pdf.kabootr.com",
        featured: true,
    },
    {
        slug: "pixel-kabootr",
        title: "PixelMorph",
        tagline: "Private image conversion and editing in the browser.",
        description:
            "A client-side image converter for PNG, JPG, WebP, GIF, SVG, ICO, and TIFF with resize, compress, crop, adjustments, batch export, and no upload step.",
        judgment: "Browser utility - image conversion and editing",
        stack: ["Astro", "Canvas API", "WASM", "PWA", "Cloudflare"],
        image: "/pixel-kabootr.png",
        accent: "fuchsia",
        layout: "utility-product",
        status: "shipped",
        period: "2026",
        liveUrl: "https://pixel.kabootr.com",
        featured: true,
    },
    {
        slug: "linky-kabootr",
        title: "Linky",
        tagline: "Short links, QR codes, and privacy-first analytics.",
        description:
            "A link management platform for branded short links, QR codes, edge redirects, targeting, controls, and real-time analytics over clicks, referrers, devices, and UTMs.",
        judgment: "Edge SaaS - links, QR, analytics",
        stack: ["Astro", "Cloudflare Workers", "D1", "QR", "Analytics"],
        image: "/linky-kabootr.png",
        accent: "indigo",
        layout: "utility-product",
        status: "ongoing",
        period: "2026",
        liveUrl: "https://linky.kabootr.com",
        featured: true,
    },
]

export function getFeaturedProjects(): Project[] {
    return projects.filter((p) => p.featured)
}

export function getProjectBySlug(slug: string): Project | undefined {
    return projects.find((p) => p.slug === slug)
}
