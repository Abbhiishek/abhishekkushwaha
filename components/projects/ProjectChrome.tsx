"use client"

import { FadeIn } from "@/components/ui/motion"
import type { Project } from "@/lib/types"
import { cn } from "@/utils/cn"
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react"
import Link from "next/link"

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

export function ProjectStatusBar({ project }: { project: Project }) {
    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[project.status])} />
                {statusLabel[project.status]}
            </span>
            <span>/</span>
            <span>{project.period}</span>
            <span>/</span>
            <span>{project.judgment}</span>
        </div>
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

export function StackPills({ stack }: { stack: string[] }) {
    return (
        <ul className="flex flex-wrap gap-1.5">
            {stack.map((s) => (
                <li
                    key={s}
                    className="font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded ring-1 ring-zinc-200 dark:ring-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                    {s}
                </li>
            ))}
        </ul>
    )
}
