"use client"

import { AnimatedPage } from "@/components/AnimatedList"
import { BackLink, ExternalLinks, ProjectStatusBar, StackPills } from "@/components/projects/ProjectChrome"
import { FadeIn, FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import type { ProjectDetail } from "@/lib/project-details"
import type { Project } from "@/lib/types"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"

interface Props {
    project: Project
    detail: ProjectDetail
}

const sampleEndpoints = [
    "/api/banner?title=Widgets&bio=Github%20widgets",
    "/api/github/repocard?owner=Abbhiishek&repo=Widgets",
    "/api/buymeacoffee?slug=abbhishek",
    "/api/github/repocard?owner=dscjisu&repo=WebDev&theme=dark",
]

export default function WiidgetsLayout({ project, detail }: Props) {
    return (
        <AnimatedPage className="w-full flex flex-col gap-16 lg:gap-20 mt-16 lg:mt-10 mb-20 px-2 lg:px-4">
            <section className="flex flex-col gap-6">
                <BackLink />

                <FadeIn delay={0.1}>
                    <ProjectStatusBar project={project} />
                </FadeIn>

                <FadeIn delay={0.18}>
                    <h1
                        className={cn(
                            "text-zinc-900 dark:text-white text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] tracking-tight",
                            adlam_display.className
                        )}
                    >
                        {project.title}
                    </h1>
                </FadeIn>

                <FadeIn delay={0.26}>
                    <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                        {project.tagline}
                    </p>
                </FadeIn>

                <FadeIn delay={0.36}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
                        <div className="lg:col-span-7">
                            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {project.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-5 pt-5">
                                <ExternalLinks project={project} />
                            </div>
                            <div className="pt-4">
                                <StackPills stack={project.stack} />
                            </div>
                        </div>
                        <EndpointCard />
                    </div>
                </FadeIn>
            </section>

            <section className="flex flex-col gap-8" aria-label="Vision">
                <SectionRule index="01" label="Endpoint contract" />
                <FadeInView>
                    <p
                        className={cn(
                            "text-2xl sm:text-3xl leading-snug text-zinc-900 dark:text-white max-w-4xl",
                            adlam_display.className
                        )}
                    >
                        {detail.vision}
                    </p>
                </FadeInView>
            </section>

            <section className="flex flex-col gap-8" aria-label="Goals">
                <SectionRule index="02" label="Goals" />
                <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {detail.goals.map((goal, i) => (
                        <StaggerItem key={i}>
                            <div className="flex gap-3 p-4 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-800 font-mono text-sm h-full">
                                <span className="text-zinc-400 dark:text-zinc-600 shrink-0">
                                    {String(i + 1).padStart(2, "0")} ›
                                </span>
                                <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{goal}</span>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </section>

            <section className="flex flex-col gap-8" aria-label="Problems">
                <SectionRule index="03" label="The hard parts" />
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                    {detail.challenges.map((c, i) => (
                        <StaggerItem key={c.title}>
                            <article className="flex flex-col gap-3 p-5 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 h-full bg-white/40 dark:bg-zinc-950/40">
                                <header className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                        ISSUE #{String(i + 1).padStart(2, "0")}
                                    </span>
                                    {c.outcome && (
                                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-peach">
                                            RESOLVED
                                        </span>
                                    )}
                                </header>
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                                    {c.title}
                                </h3>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {c.problem}
                                </div>
                                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                        FIX
                                    </span>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1.5 leading-relaxed">
                                        {c.approach}
                                    </p>
                                </div>
                                {c.outcome && (
                                    <div className="mt-auto pt-3 border-t border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                                        → {c.outcome}
                                    </div>
                                )}
                            </article>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </section>

            <section className="flex flex-col gap-8" aria-label="Build notes">
                <SectionRule index="04" label="Build notes" />
                <StaggerContainer className="flex flex-col">
                    {detail.vlog.map((v, i) => (
                        <StaggerItem key={v.title}>
                            <div className="grid grid-cols-[7rem_1fr] gap-6 py-6 border-t border-zinc-200 dark:border-zinc-800 last:border-b">
                                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 pt-1">
                                    {v.date}
                                </span>
                                <div className="flex flex-col gap-2">
                                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{v.title}</h4>
                                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{v.body}</p>
                                </div>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </section>

            <section
                className="rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 p-6 sm:p-8 bg-zinc-50/60 dark:bg-zinc-950/60"
                aria-label="Learnings"
            >
                <div className="flex flex-col gap-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        05 · Lessons
                    </span>
                    <ul className="flex flex-col gap-3">
                        {detail.learnings.map((l, i) => (
                            <li key={i} className="grid grid-cols-[3rem_1fr] gap-3 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                                <span className="text-zinc-400 dark:text-zinc-600">{String(i + 1).padStart(2, "0")}.</span>
                                <span className="leading-relaxed">{l}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </AnimatedPage>
    )
}

function EndpointCard() {
    return (
        <div className="lg:col-span-5 relative overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white/40 dark:bg-zinc-950/60">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        GET · wiidgets/api/v1
                    </span>
                </div>
                <span className="font-mono text-[10px] tracking-[0.18em] text-brand-peach">
                    200 · 87ms
                </span>
            </div>
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-[12px]">
                {sampleEndpoints.map((url) => (
                    <li key={url} className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300 whitespace-nowrap overflow-hidden text-ellipsis">
                        <span className="text-zinc-400 dark:text-zinc-600">$</span> {url}
                    </li>
                ))}
            </ul>
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 font-mono text-[10px] tracking-[0.18em] text-zinc-500">
                <span>cache · stale-while-revalidate</span>
                <span>svg · readme-safe</span>
            </div>
        </div>
    )
}

function SectionRule({ index, label }: { index: string; label: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                {index} · {label}
            </span>
            <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>
    )
}
