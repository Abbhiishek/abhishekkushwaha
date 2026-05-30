"use client"

import { AnimatedPage } from "@/components/AnimatedList"
import { BackLink, ExternalLinks, ProjectChallenges } from "@/components/projects/ProjectChrome"
import { FadeIn, FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import type { ProjectDetail } from "@/lib/project-details"
import type { Project } from "@/lib/types"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import Image from "next/image"

interface Props {
    project: Project
    detail: ProjectDetail
}

export default function DevResumeLayout({ project, detail }: Props) {
    return (
        <AnimatedPage className="w-full flex flex-col gap-16 lg:gap-20 mt-16 lg:mt-10 mb-20 px-2 lg:px-4">
            <section className="flex flex-col gap-6">
                <BackLink />

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

                <FadeIn delay={0.32}>
                    <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                        {project.description}
                    </p>
                </FadeIn>

                <FadeIn delay={0.4}>
                    <div className="flex flex-wrap items-center gap-5 pt-1">
                        <ExternalLinks project={project} />
                    </div>
                </FadeIn>
            </section>

            <FadeInView>
                <div className="relative w-full rounded-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-100 dark:bg-zinc-900 aspect-[16/9]">
                    <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </FadeInView>

            <section className="flex flex-col gap-8" aria-label="Vision and goals">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        01 · The vision
                    </span>
                    <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <FadeInView>
                    <p
                        className={cn(
                            "text-2xl sm:text-3xl lg:text-4xl leading-snug text-zinc-900 dark:text-white max-w-4xl",
                            adlam_display.className
                        )}
                    >
                        {detail.vision}
                    </p>
                </FadeInView>
            </section>

            <section className="flex flex-col gap-8" aria-label="Goals">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        02 · Goals
                    </span>
                    <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                    {detail.goals.map((goal, i) => (
                        <StaggerItem key={i}>
                            <div className="flex gap-4 p-5 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 h-full">
                                <span className="font-mono text-[11px] tracking-[0.18em] text-zinc-400 dark:text-zinc-600 shrink-0">
                                    G{String(i + 1).padStart(2, "0")}
                                </span>
                                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                                    {goal}
                                </p>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </section>

            <FadeInView>
                <ProjectChallenges detail={detail} />
            </FadeInView>

            <section className="flex flex-col gap-8" aria-label="Vlog">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        04 · Notes from the build
                    </span>
                    <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
                    {detail.vlog.map((v) => (
                        <StaggerItem key={v.title}>
                            <article className="flex flex-col gap-3 p-5 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 h-full">
                                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                    {v.date}
                                </span>
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{v.title}</h4>
                                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                    {v.body}
                                </p>
                            </article>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </section>

            <section
                className="relative overflow-hidden rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 p-8 sm:p-10 bg-zinc-50/60 dark:bg-zinc-950/60"
                aria-label="Learnings"
            >
                <div className="flex flex-col gap-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        05 · What I learned
                    </span>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {detail.learnings.map((l, i) => (
                            <li
                                key={i}
                                className={cn(
                                    "text-base sm:text-lg leading-snug text-zinc-900 dark:text-zinc-100",
                                    adlam_display.className
                                )}
                            >
                                <span className="font-mono text-[10px] text-zinc-500 mr-2">L{i + 1}</span>
                                {l}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </AnimatedPage>
    )
}
