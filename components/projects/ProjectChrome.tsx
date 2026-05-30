"use client"

import { FadeIn } from "@/components/ui/motion"
import type { ProjectDetail } from "@/lib/project-details"
import type { Project } from "@/lib/types"
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react"
import Link from "next/link"

export function BackLink() {
    return (
        <FadeIn delay={0.05}>
            <Link
                href="/project"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
                <ArrowLeft size={14} />
                Back to systems
            </Link>
        </FadeIn>
    )
}

export function ExternalLinks({ project }: { project: Project }) {
    if (!project.githubUrl && !project.liveUrl) return null
    return (
        <div className="flex flex-wrap items-center gap-3">
            {project.githubUrl && (
                <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md ring-1 ring-zinc-300 dark:ring-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:ring-zinc-900 dark:hover:ring-zinc-100 transition-colors"
                >
                    <Github size={14} />
                    Source
                    <ArrowUpRight size={12} />
                </a>
            )}
            {project.liveUrl && (
                <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors"
                >
                    Live
                    <ArrowUpRight size={12} />
                </a>
            )}
        </div>
    )
}

export function ProjectChallenges({
    detail,
    title = "Problems and approach",
}: {
    detail: ProjectDetail
    title?: string
}) {
    return (
        <section className="flex flex-col gap-8" aria-label={title}>
            <div className="flex flex-col gap-3">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {title}
                </h2>
                <p className="max-w-2xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    The key product and engineering decisions, written as short problem-to-solution notes.
                </p>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
                {detail.challenges.map((challenge) => (
                    <article
                        key={challenge.title}
                        className="grid grid-cols-1 gap-4 py-8 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-10"
                    >
                        <h3 className="text-xl sm:text-2xl font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-100">
                            {challenge.title}
                        </h3>
                        <div className="flex flex-col gap-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                            <p>{challenge.problem}</p>
                            <p>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">Approach: </span>
                                {challenge.approach}
                            </p>
                            {challenge.outcome && (
                                <p className="border-l-2 border-brand-peach pl-4 text-zinc-700 dark:text-zinc-300">
                                    {challenge.outcome}
                                </p>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}
