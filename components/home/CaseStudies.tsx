"use client"

import { FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { caseStudies, type CaseStudyStatus } from "@/lib/case-studies"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

const statusDot: Record<CaseStudyStatus, string> = {
    shipped: "bg-brand-peach",
    ongoing: "bg-brand-pink",
    experiment: "bg-zinc-400 dark:bg-zinc-600",
}

const statusText: Record<CaseStudyStatus, string> = {
    shipped: "SHIPPED",
    ongoing: "ONGOING",
    experiment: "EXPERIMENT",
}

export default function CaseStudies() {
    return (
        <section className="flex flex-col gap-8" aria-label="AI systems case studies">
            <FadeInView>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                            03 · Case studies
                        </span>
                        <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                        <h2
                            className={cn(
                                "text-3xl sm:text-4xl lg:text-5xl tracking-tight text-zinc-900 dark:text-white",
                                adlam_display.className
                            )}
                        >
                            AI systems I have shipped
                        </h2>
                        <Link
                            href="/work"
                            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        >
                            Experience trail
                            <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
                        Each card is a system I designed, built, or own in production today. Most ship inside HyrecruitAI — the patterns travel.
                    </p>
                </div>
            </FadeInView>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                {caseStudies.map((c) => (
                    <StaggerItem key={c.id}>
                        <article
                            className={cn(
                                "group relative flex flex-col gap-4 p-6 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800",
                                "bg-white/60 dark:bg-zinc-950/40 hover:ring-zinc-400 dark:hover:ring-zinc-700 transition-colors h-full"
                            )}
                        >
                            <header className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                    {c.badge}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[c.status])} />
                                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                        {statusText[c.status]}
                                    </span>
                                </div>
                            </header>

                            <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                {c.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                {c.summary}
                            </p>

                            <ul className="flex flex-wrap gap-1.5" aria-label="Systems">
                                {c.systems.map((s) => (
                                    <li
                                        key={s}
                                        className="font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded ring-1 ring-zinc-200 dark:ring-zinc-800 text-zinc-600 dark:text-zinc-400"
                                    >
                                        {s}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex gap-6 mt-auto pt-2">
                                {c.metrics.map((m) => (
                                    <div key={m.label} className="flex flex-col">
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                            {m.value}
                                        </span>
                                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                                            {m.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {c.readMore && (
                                <Link
                                    href={c.readMore.href}
                                    className="inline-flex items-center gap-1 text-sm text-brand-pink dark:text-brand-peach hover:underline underline-offset-4"
                                >
                                    {c.readMore.label}
                                    <ArrowUpRight size={14} />
                                </Link>
                            )}
                        </article>
                    </StaggerItem>
                ))}
            </StaggerContainer>
        </section>
    )
}
