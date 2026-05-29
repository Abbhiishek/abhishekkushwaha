import { AnimatedGrid, AnimatedItem, AnimatedPage } from "@/components/AnimatedList"
import { pageSocialMetadata } from "@/lib/og-metadata"
import { projects } from "@/lib/project"
import type { Project } from "@/lib/types"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { ArrowUpRight } from "lucide-react"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Systems & Experiments",
    description:
        "Side systems, OSS, and experiments across portfolio SaaS, API endpoints, developer communities, and CLI tools.",
    keywords: "projects, open-source, developer tooling, cli, api design",
    ...pageSocialMetadata({
        page: "projects",
        title: "Systems & Experiments",
        description: "Side systems, OSS, and experiments across portfolio SaaS, API endpoints, developer communities, and CLI tools.",
    }),
}

const statusDot: Record<Project["status"], string> = {
    shipped: "bg-brand-peach",
    ongoing: "bg-brand-pink",
    archived: "bg-zinc-400 dark:bg-zinc-600",
    sunset: "bg-zinc-400 dark:bg-zinc-600",
}

const statusLabel: Record<Project["status"], string> = {
    shipped: "SHIPPED",
    ongoing: "ONGOING",
    archived: "ARCHIVED",
    sunset: "SUNSET",
}

const projectVisuals: Record<string, {
    card: string
    glow: string
    status: string
    tag: string
    image: string
    rule: string
}> = {
    emerald: {
        card: "bg-gradient-to-br from-emerald-50 via-white to-lime-50 ring-emerald-200/80 hover:ring-emerald-400/80 dark:from-emerald-950/40 dark:via-zinc-950/80 dark:to-lime-950/25 dark:ring-emerald-900/50 dark:hover:ring-emerald-500/50",
        glow: "bg-emerald-300/35 dark:bg-emerald-400/20",
        status: "bg-emerald-500",
        tag: "bg-emerald-100/80 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-200 dark:ring-emerald-800/70",
        image: "ring-emerald-300/80 dark:ring-emerald-700/70",
        rule: "from-emerald-500 via-lime-400 to-cyan-400",
    },
    violet: {
        card: "bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 ring-violet-200/80 hover:ring-violet-400/80 dark:from-violet-950/45 dark:via-zinc-950/80 dark:to-fuchsia-950/25 dark:ring-violet-900/50 dark:hover:ring-violet-500/50",
        glow: "bg-violet-300/35 dark:bg-violet-400/20",
        status: "bg-violet-500",
        tag: "bg-violet-100/80 text-violet-800 ring-violet-200 dark:bg-violet-950/70 dark:text-violet-200 dark:ring-violet-800/70",
        image: "ring-violet-300/80 dark:ring-violet-700/70",
        rule: "from-violet-500 via-fuchsia-400 to-sky-400",
    },
    sky: {
        card: "bg-gradient-to-br from-sky-50 via-white to-cyan-50 ring-sky-200/80 hover:ring-sky-400/80 dark:from-sky-950/45 dark:via-zinc-950/80 dark:to-cyan-950/25 dark:ring-sky-900/50 dark:hover:ring-sky-500/50",
        glow: "bg-sky-300/35 dark:bg-sky-400/20",
        status: "bg-sky-500",
        tag: "bg-sky-100/80 text-sky-800 ring-sky-200 dark:bg-sky-950/70 dark:text-sky-200 dark:ring-sky-800/70",
        image: "ring-sky-300/80 dark:ring-sky-700/70",
        rule: "from-sky-500 via-cyan-400 to-emerald-400",
    },
    amber: {
        card: "bg-gradient-to-br from-amber-50 via-white to-orange-50 ring-amber-200/80 hover:ring-amber-400/80 dark:from-amber-950/40 dark:via-zinc-950/80 dark:to-orange-950/25 dark:ring-amber-900/50 dark:hover:ring-amber-500/50",
        glow: "bg-amber-300/35 dark:bg-amber-400/20",
        status: "bg-amber-500",
        tag: "bg-amber-100/80 text-amber-900 ring-amber-200 dark:bg-amber-950/70 dark:text-amber-200 dark:ring-amber-800/70",
        image: "ring-amber-300/80 dark:ring-amber-700/70",
        rule: "from-amber-500 via-orange-400 to-pink-400",
    },
}

export default function ProjectPage() {
    return (
        <AnimatedPage className="w-full min-h-screen h-full p-4 lg:p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full mt-16 lg:mt-0 gap-10 mb-12">
                <div className="flex flex-col gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Side surface
                    </span>
                    <h1
                        className={cn(
                            "dark:text-zinc-200 text-zinc-900 leading-none text-5xl lg:text-6xl tracking-tight",
                            adlam_display.className
                        )}
                    >
                        Systems &amp; Experiments
                    </h1>
                    <p className="dark:text-zinc-400 text-zinc-700 leading-relaxed max-w-2xl">
                        A tighter shelf of projects I built to learn product, systems, and developer experience in public. Less filler here: open a project for the build story, constraints, and lessons.
                    </p>
                </div>

                <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                    {projects.map((project) => (
                        <AnimatedItem key={project.slug}>
                            <ProjectCard project={project} />
                        </AnimatedItem>
                    ))}
                </AnimatedGrid>
            </section>
        </AnimatedPage>
    )
}

function ProjectCard({ project }: { project: Project }) {
    const visual = projectVisuals[project.accent] ?? projectVisuals.sky

    return (
        <Link
            href={`/project/${project.slug}`}
            className={cn(
                "group relative flex flex-col gap-4 p-3 sm:p-4 rounded-2xl ring-1 overflow-hidden transition-all duration-300 h-full",
                "hover:-translate-y-1 hover:shadow-2xl hover:shadow-zinc-900/10 dark:hover:shadow-black/40",
                visual.card
            )}
        >
            <span
                aria-hidden
                className={cn(
                    "absolute -right-14 -top-16 h-40 w-40 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-90",
                    visual.glow
                )}
            />
            <span
                aria-hidden
                className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", visual.rule)}
            />

            <div className={cn("relative w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 ring-1", visual.image)}>
                <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover saturate-125 contrast-105 transition-transform duration-500 group-hover:scale-105"
                />
                <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent"
                />
                <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-zinc-800 shadow-sm backdrop-blur dark:bg-zinc-950/80 dark:text-zinc-200">
                        <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[project.status], project.status === "shipped" && visual.status)} />
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em]">
                            {statusLabel[project.status]}
                        </span>
                    </div>
                    <span className="rounded-full bg-white/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-700 shadow-sm backdrop-blur dark:bg-zinc-950/80 dark:text-zinc-300">
                        {project.period}
                    </span>
                </div>
            </div>

            <section className="flex flex-1 flex-col gap-3 px-1 pb-1">
                <div className="flex flex-col gap-1.5">
                    <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-brand-pink dark:group-hover:text-brand-peach transition-colors">
                        {project.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-3">
                        {project.description}
                    </p>
                </div>

                <ul className="flex flex-wrap gap-1.5">
                    {project.stack.map((s) => (
                        <li
                            key={s}
                            className={cn(
                                "font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded ring-1",
                                visual.tag
                            )}
                        >
                            {s}
                        </li>
                    ))}
                </ul>

                <div className="mt-auto flex items-center justify-end font-mono text-[11px] tracking-[0.15em] text-zinc-500">
                    <span className="inline-flex items-center gap-1 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                        Read the build
                        <ArrowUpRight
                            size={12}
                            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                        />
                    </span>
                </div>
            </section>
        </Link>
    )
}
