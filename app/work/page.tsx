import { AnimatedGrid, AnimatedItem, AnimatedPage } from "@/components/AnimatedList"
import { workExperiences, type WorkExperience } from "@/lib/work"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
    title: "Work",
    description: "AI product engineering work — voice agents, LLM evaluation, real-time video, semantic caching, and the multi-tenant SaaS plumbing behind them.",
}

const typeBadgeColors: Record<string, string> = {
    "Full-time": "ring-zinc-300 dark:ring-zinc-700 text-zinc-700 dark:text-zinc-300",
    Internship: "ring-zinc-300 dark:ring-zinc-700 text-zinc-700 dark:text-zinc-300",
    Contract: "ring-zinc-300 dark:ring-zinc-700 text-zinc-700 dark:text-zinc-300",
    Freelance: "ring-zinc-300 dark:ring-zinc-700 text-zinc-700 dark:text-zinc-300",
    Volunteer: "ring-zinc-300 dark:ring-zinc-700 text-zinc-700 dark:text-zinc-300",
}

export default function Work() {
    return (
        <AnimatedPage className="w-full min-h-screen h-full p-4 lg:p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full mt-16 lg:mt-0 gap-10 mb-12">
                <div className="flex flex-col gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Experience trail
                    </span>
                    <h1
                        className={cn(
                            "dark:text-zinc-200 text-zinc-900 leading-none text-5xl lg:text-6xl tracking-tight",
                            adlam_display.className
                        )}
                    >
                        Work
                    </h1>
                    <p className="dark:text-zinc-400 text-zinc-700 leading-relaxed max-w-2xl">
                        I build AI product systems. This page is the operating history — what I owned, what I built, what mattered, and what shipped. HyrecruitAI is the current chapter, not the whole identity.
                    </p>
                </div>

                <AnimatedGrid className="flex flex-col gap-4">
                    {workExperiences.map((work, i) => (
                        <AnimatedItem key={i}>
                            <WorkCard work={work} />
                        </AnimatedItem>
                    ))}
                </AnimatedGrid>
            </section>
        </AnimatedPage>
    )
}

function WorkCard({ work }: { work: WorkExperience }) {
    const hasDeepDetails = Boolean(work.owned || work.systems || work.constraints || work.impact)
    return (
        <article className="flex gap-5 p-6 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-zinc-400 dark:hover:ring-zinc-700 transition-colors">
            <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center ring-1 ring-zinc-200 dark:ring-zinc-800">
                <Image
                    src={work.logo}
                    alt={work.company}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain p-1"
                />
            </div>

            <div className="flex flex-col gap-3 flex-1 min-w-0">
                <header className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
                            {work.url ? (
                                <a
                                    href={work.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline decoration-zinc-400 underline-offset-4 hover:decoration-brand-pink"
                                >
                                    {work.company}
                                </a>
                            ) : (
                                work.company
                            )}
                        </h2>
                        <span
                            className={cn(
                                "font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 rounded ring-1",
                                typeBadgeColors[work.type] ?? "ring-zinc-300 text-zinc-500"
                            )}
                        >
                            {work.type}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{work.role}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] tracking-tight text-zinc-500">
                        <span>{work.duration}</span>
                        <span>·</span>
                        <span>{work.location}</span>
                    </div>
                </header>

                <div className="flex flex-col gap-2">
                    {work.description.map((para, j) => (
                        <p key={j} className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                            {para}
                        </p>
                    ))}
                </div>

                {hasDeepDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-1 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        {work.owned && <DetailList title="01 · Owned" items={work.owned} />}
                        {work.systems && <DetailList title="02 · Systems" items={work.systems} mono />}
                        {work.constraints && <DetailList title="03 · Constraints" items={work.constraints} />}
                        {work.impact && <DetailList title="04 · Impact" items={work.impact} highlight />}
                    </div>
                )}
            </div>
        </article>
    )
}

function DetailList({
    title,
    items,
    mono = false,
    highlight = false,
}: {
    title: string
    items: string[]
    mono?: boolean
    highlight?: boolean
}) {
    return (
        <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{title}</span>
            <ul className="flex flex-col gap-1.5">
                {items.map((item, i) => (
                    <li
                        key={i}
                        className={cn(
                            "text-sm leading-relaxed flex gap-2",
                            mono && "font-mono text-[12px]",
                            highlight ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"
                        )}
                    >
                        <span className="text-zinc-400 dark:text-zinc-600 shrink-0">→</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
