"use client"

import { AnimatedPage } from "@/components/AnimatedList"
import { BackLink, ExternalLinks, ProjectChallenges } from "@/components/projects/ProjectChrome"
import { FadeIn, FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import type { ProjectDetail } from "@/lib/project-details"
import type { Project } from "@/lib/types"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { Quote } from "lucide-react"
import Image from "next/image"

interface Props {
    project: Project
    detail: ProjectDetail
}

export default function CommunityMusicLayout({ project, detail }: Props) {
    return (
        <AnimatedPage className="w-full flex flex-col gap-20 lg:gap-24 mt-16 lg:mt-10 mb-24 px-2 lg:px-4">
            <section className="flex flex-col gap-8 max-w-4xl">
                <BackLink />
                <FadeIn delay={0.16}>
                    <h1
                        className={cn(
                            "text-zinc-900 dark:text-white text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.02] tracking-tight",
                            adlam_display.className
                        )}
                    >
                        {project.title}
                    </h1>
                </FadeIn>

                <FadeIn delay={0.24}>
                    <p className="text-lg sm:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                        {project.tagline}
                    </p>
                </FadeIn>

                <FadeIn delay={0.4}>
                    <div className="flex flex-wrap gap-4 items-center">
                        <ExternalLinks project={project} />
                    </div>
                </FadeIn>
            </section>

            <FadeInView>
                <figure className="flex flex-col gap-3">
                    <div className="relative w-full h-64 sm:h-96 rounded-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                        <Image src={project.image} alt={project.title} fill className="object-cover" priority />
                    </div>
                </figure>
            </FadeInView>

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                <aside className="lg:col-span-3 lg:sticky lg:top-10 self-start flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    <span className="text-zinc-900 dark:text-zinc-100">Chapters</span>
                    {["The hypothesis", "Goals", "What broke", "Notes", "Lessons"].map((c, i) => (
                        <span key={c}>
                            {String(i + 1).padStart(2, "0")} / {c}
                        </span>
                    ))}
                </aside>

                <div className="lg:col-span-9 flex flex-col gap-20">
                    <Chapter index="01" title="The hypothesis">
                        <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">{detail.vision}</p>
                        <FadeInView>
                            <blockquote className="flex gap-4 mt-6 pl-6 border-l-2 border-brand-pink dark:border-brand-peach">
                                <Quote size={18} className="text-brand-pink dark:text-brand-peach shrink-0 mt-1" />
                                <p
                                    className={cn(
                                        "text-xl sm:text-2xl leading-snug text-zinc-900 dark:text-zinc-100 italic",
                                        adlam_display.className
                                    )}
                                >
                                    A community project is only real when people can post, discuss, and collaborate.
                                </p>
                            </blockquote>
                        </FadeInView>
                    </Chapter>

                    <Chapter index="02" title="Goals">
                        <StaggerContainer className="flex flex-col gap-4">
                            {detail.goals.map((g, i) => (
                                <StaggerItem key={i}>
                                    <div className="flex gap-4">
                                        <span className="font-mono text-[11px] tracking-[0.18em] text-zinc-400 dark:text-zinc-600 shrink-0 pt-1">
                                            G{String(i + 1).padStart(2, "0")}
                                        </span>
                                        <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                            {g}
                                        </p>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </Chapter>

                    <FadeInView>
                        <ProjectChallenges detail={detail} title="What broke and what changed" />
                    </FadeInView>

                    <Chapter index="04" title="Notes from the build">
                        <StaggerContainer className="flex flex-col gap-8">
                            {detail.vlog.map((v) => (
                                <StaggerItem key={v.title}>
                                    <article className="flex flex-col gap-2">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                            {v.date}
                                        </span>
                                        <h5 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                            {v.title}
                                        </h5>
                                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{v.body}</p>
                                    </article>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </Chapter>

                    <Chapter index="05" title="What I take with me">
                        <ul className="flex flex-col gap-5">
                            {detail.learnings.map((l, i) => (
                                <li
                                    key={i}
                                    className={cn(
                                        "text-lg leading-relaxed text-zinc-900 dark:text-zinc-100",
                                        adlam_display.className
                                    )}
                                >
                                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mr-3">
                                        L{i + 1}
                                    </span>
                                    {l}
                                </li>
                            ))}
                        </ul>
                    </Chapter>
                </div>
            </section>
        </AnimatedPage>
    )
}

function Chapter({
    index,
    title,
    children,
}: {
    index: string
    title: string
    children: React.ReactNode
}) {
    return (
        <section className="flex flex-col gap-6">
            <header className="flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    Chapter {index}
                </span>
                <h3
                    className={cn(
                        "text-3xl sm:text-4xl text-zinc-900 dark:text-white tracking-tight",
                        adlam_display.className
                    )}
                >
                    {title}
                </h3>
                <span className="block w-12 h-px bg-zinc-300 dark:bg-zinc-700 mt-1" />
            </header>
            <div className="flex flex-col gap-4">{children}</div>
        </section>
    )
}
