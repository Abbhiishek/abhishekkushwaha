"use client"

import { AnimatedPage } from "@/components/AnimatedList"
import { BackLink, ExternalLinks, ProjectChallenges } from "@/components/projects/ProjectChrome"
import { FadeIn, FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import type { ProjectDetail } from "@/lib/project-details"
import type { Project } from "@/lib/types"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"

interface Props {
    project: Project
    detail: ProjectDetail
}

const terminalSample = [
    { prompt: "todoska add", value: "\"Ship portfolio polish\" \"Work\"" },
    { prompt: "todoska show", value: "" },
    { prompt: "todoska complete", value: "1" },
    { prompt: "todoska update", value: "1 \"Write project notes\" \"Writing\"" },
]

export default function TodoskaLayout({ project, detail }: Props) {
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
                        $ {project.title.toLowerCase()}
                    </h1>
                </FadeIn>

                <FadeIn delay={0.26}>
                    <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                        {project.tagline}
                    </p>
                </FadeIn>

                <FadeIn delay={0.36}>
                    <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                        {project.description}
                    </p>
                </FadeIn>

                <FadeIn delay={0.44}>
                    <div className="flex flex-wrap items-center gap-5">
                        <ExternalLinks project={project} />
                    </div>
                </FadeIn>
            </section>

            <FadeInView>
                <TerminalDemo />
            </FadeInView>

            <section className="flex flex-col gap-6" aria-label="Vision">
                <Prompt label="cat vision.md" />
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

            <section className="flex flex-col gap-6" aria-label="Goals">
                <Prompt label="cat goals.txt" />
                <StaggerContainer className="flex flex-col gap-2 font-mono text-sm">
                    {detail.goals.map((g, i) => (
                        <StaggerItem key={i}>
                            <div className="flex gap-3 p-3 ring-1 ring-zinc-200 dark:ring-zinc-800 rounded">
                                <span className="text-brand-peach shrink-0">{`[${String(i + 1).padStart(2, "0")}]`}</span>
                                <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{g}</span>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </section>

            <FadeInView>
                <ProjectChallenges detail={detail} />
            </FadeInView>

            <section className="flex flex-col gap-6" aria-label="Vlog">
                <Prompt label="cat vlog.txt" />
                <StaggerContainer className="flex flex-col gap-3">
                    {detail.vlog.map((v) => (
                        <StaggerItem key={v.title}>
                            <article className="p-5 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-800 flex flex-col gap-2">
                                <header className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                                    <span>{v.date}</span>
                                    <span>/ {v.title.toLowerCase()}</span>
                                </header>
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{v.title}</h4>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{v.body}</p>
                            </article>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </section>

            <section className="flex flex-col gap-6" aria-label="Learnings">
                <Prompt label="cat lessons.txt" />
                <ul className="flex flex-col font-mono text-sm border-l-2 border-zinc-300 dark:border-zinc-700">
                    {detail.learnings.map((l, i) => (
                        <li
                            key={i}
                            className="pl-5 py-3 border-b border-dashed border-zinc-200 dark:border-zinc-800 last:border-b-0"
                        >
                            <span className="text-zinc-400 dark:text-zinc-600 mr-2">{String(i + 1).padStart(2, "0")}</span>
                            <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{l}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </AnimatedPage>
    )
}

function TerminalDemo() {
    return (
        <div className="relative overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-950 text-zinc-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    </div>
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        ~/work/todoska
                    </span>
                </div>
                <span className="font-mono text-[10px] tracking-[0.18em] text-brand-peach">v1.0.4</span>
            </div>
            <div className="font-mono text-[13px] sm:text-[14px] divide-y divide-zinc-900">
                {terminalSample.map((line, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-center gap-2">
                        <span className="text-brand-peach">$</span>
                        <span className="text-zinc-200">{line.prompt}</span>
                        <span className="text-zinc-500">{line.value}</span>
                    </div>
                ))}
                <div className="px-4 py-2.5 flex items-center gap-2 text-zinc-400">
                    <span className="text-brand-peach">$</span>
                    <span className="animate-pulse">_</span>
                </div>
            </div>
        </div>
    )
}

function Prompt({ label }: { label: string }) {
    return (
        <div className="font-mono text-sm text-zinc-500">
            <span className="text-brand-peach">$</span> {label}
        </div>
    )
}

