"use client"

import { AnimatedPage } from "@/components/AnimatedList"
import { BackLink, ExternalLinks, ProjectChallenges } from "@/components/projects/ProjectChrome"
import { FadeIn, FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import type { ProjectDetail } from "@/lib/project-details"
import type { Project } from "@/lib/types"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import {
    BarChart3,
    FileText,
    GitBranch,
    GitPullRequest,
    ImageIcon,
    Link2,
    Lock,
    Mic,
    PenLine,
    QrCode,
    Scissors,
    ShieldCheck,
    TerminalSquare,
    Zap,
} from "lucide-react"
import Image from "next/image"

interface Props {
    project: Project
    detail: ProjectDetail
}

const utilityHighlights: Record<
    string,
    {
        eyebrow: string
        metrics: { value: string; label: string }[]
        features: { title: string; body: string; icon: React.ReactNode }[]
    }
> = {
    nuvyam: {
        eyebrow: "Desktop workspace for coding agents",
        metrics: [
            { value: "7+", label: "agent CLIs" },
            { value: "1/task", label: "Git worktree" },
            { value: "Win", label: "desktop app" },
        ],
        features: [
            {
                title: "Isolate every task",
                body: "Start each piece of work on its own Git branch and worktree so parallel agents do not compete for one checkout.",
                icon: <GitBranch size={18} />,
            },
            {
                title: "Run agents natively",
                body: "Use supported or custom coding-agent commands in real PTYs, with Skills, prompts, and MCP servers nearby.",
                icon: <TerminalSquare size={18} />,
            },
            {
                title: "Review and ship in context",
                body: "Keep files, diffs, commits, pushes, pull requests, and process-level resource use attached to the task.",
                icon: <GitPullRequest size={18} />,
            },
        ],
    },
    vaaniflow: {
        eyebrow: "Windows voice workflow",
        metrics: [
            { value: "Win", label: "system-wide" },
            { value: "Local", label: "app data" },
            { value: "MIT", label: "open source" },
        ],
        features: [
            {
                title: "Dictate anywhere",
                body: "Hold a global shortcut, speak in the Windows app already open, and release to insert text at the cursor.",
                icon: <Mic size={18} />,
            },
            {
                title: "Shape the transcript",
                body: "Optionally clean up speech, apply app-aware writing styles, and expand saved dictionary terms or snippets.",
                icon: <PenLine size={18} />,
            },
            {
                title: "Keep control",
                body: "Store settings and history locally while sending provider requests to the Azure OpenAI deployments you configure.",
                icon: <ShieldCheck size={18} />,
            },
        ],
    },
    "pdf-kabootr": {
        eyebrow: "Local PDF workspace",
        metrics: [
            { value: "0", label: "uploads" },
            { value: "12+", label: "PDF tools" },
            { value: "PWA", label: "installable" },
        ],
        features: [
            {
                title: "Organize documents",
                body: "Merge, split, reorder, rotate, delete, and number pages from one grouped workspace.",
                icon: <FileText size={18} />,
            },
            {
                title: "Protect private files",
                body: "Compress, protect, unlock, sign, and edit PDFs without making server upload the default path.",
                icon: <ShieldCheck size={18} />,
            },
            {
                title: "Convert common formats",
                body: "Move between PDF, images, text, Word, HTML, and presentation workflows from the browser.",
                icon: <Zap size={18} />,
            },
        ],
    },
    "pixel-kabootr": {
        eyebrow: "Private image bench",
        metrics: [
            { value: "7", label: "formats" },
            { value: "ZIP", label: "batch export" },
            { value: "100%", label: "client-side" },
        ],
        features: [
            {
                title: "Convert formats",
                body: "Convert PNG, JPG, WebP, GIF, SVG, ICO, and TIFF without signup or artificial file quotas.",
                icon: <ImageIcon size={18} />,
            },
            {
                title: "Prepare assets",
                body: "Resize, compress, crop, adjust color, and export favicons from the same workspace.",
                icon: <Scissors size={18} />,
            },
            {
                title: "Keep files local",
                body: "Image data stays in the browser, which makes speed and privacy part of the architecture.",
                icon: <Lock size={18} />,
            },
        ],
    },
    "linky-kabootr": {
        eyebrow: "Edge link platform",
        metrics: [
            { value: "<10ms", label: "edge redirect" },
            { value: "QR", label: "per link" },
            { value: "D1", label: "edge data" },
        ],
        features: [
            {
                title: "Smart short links",
                body: "Create branded short links with custom slugs, targeting, expiration, and password controls.",
                icon: <Link2 size={18} />,
            },
            {
                title: "QR studio",
                body: "Generate QR codes from the same link object so print and digital sharing share analytics.",
                icon: <QrCode size={18} />,
            },
            {
                title: "Deep analytics",
                body: "Track clicks, geography, devices, referrers, and UTM attribution with privacy-first handling.",
                icon: <BarChart3 size={18} />,
            },
        ],
    },
}

export default function UtilityProductLayout({ project, detail }: Props) {
    const highlights = utilityHighlights[project.slug]

    return (
        <AnimatedPage className="w-full flex flex-col gap-16 lg:gap-20 mt-16 lg:mt-10 mb-20 px-2 lg:px-4">
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <BackLink />

                    <FadeIn delay={0.14}>
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                            {highlights?.eyebrow ?? "Utility product"}
                        </span>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <h1
                            className={cn(
                                "text-zinc-900 dark:text-white text-[clamp(2.6rem,5.4vw,5rem)] leading-[1.02] tracking-tight",
                                adlam_display.className
                            )}
                        >
                            {project.title}
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.28}>
                        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                            {project.tagline}
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.34}>
                        <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                            {project.description}
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.4}>
                        <div className="flex flex-wrap items-center gap-3">
                            <ExternalLinks project={project} />
                        </div>
                    </FadeIn>
                </div>

                <FadeIn delay={0.3} className="lg:col-span-5">
                    <div className="grid grid-cols-3 gap-3">
                        {(highlights?.metrics ?? []).map((metric) => (
                            <div
                                key={metric.label}
                                className="rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 p-4 bg-zinc-50/70 dark:bg-zinc-950/60"
                            >
                                <div className="font-mono text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                    {metric.value}
                                </div>
                                <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                                    {metric.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </FadeIn>
            </section>

            <FadeInView>
                <div className="relative w-full rounded-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-100 dark:bg-zinc-900 aspect-[3/2] sm:aspect-[16/9]">
                    <Image
                        src={project.image}
                        alt={`${project.title} product screenshot`}
                        fill
                        className={cn(project.slug === "nuvyam" ? "object-contain bg-[#080d1c]" : "object-cover")}
                        priority
                    />
                </div>
            </FadeInView>

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start" aria-label="Product highlights">
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        01 - Product shape
                    </span>
                    <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {detail.vision}
                    </p>
                </div>

                <StaggerContainer className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4 self-start">
                    {(highlights?.features ?? []).map((feature) => (
                        <StaggerItem key={feature.title}>
                            <article className="flex min-h-[15rem] flex-col gap-4 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 p-5 bg-white/50 dark:bg-zinc-950/40">
                                <div className="grid h-10 w-10 place-items-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                                    {feature.icon}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{feature.title}</h2>
                                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                        {feature.body}
                                    </p>
                                </div>
                            </article>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </section>

            <section className="flex flex-col gap-8" aria-label="Goals">
                <SectionRule index="02" label="Build goals" />
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {detail.goals.map((goal, i) => (
                        <StaggerItem key={i}>
                            <div className="flex h-full gap-4 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 p-5">
                                <span className="font-mono text-[11px] tracking-[0.18em] text-zinc-400 dark:text-zinc-600 shrink-0">
                                    G{String(i + 1).padStart(2, "0")}
                                </span>
                                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{goal}</p>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </section>

            <FadeInView>
                <ProjectChallenges detail={detail} title="Product and engineering decisions" />
            </FadeInView>

            <section className="flex flex-col gap-8" aria-label="Build notes">
                <SectionRule index="04" label="Build notes" />
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {detail.vlog.map((v) => (
                        <StaggerItem key={v.title}>
                            <article className="flex h-full flex-col gap-3 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 p-5 bg-zinc-50/60 dark:bg-zinc-950/50">
                                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                    {v.date}
                                </span>
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{v.title}</h3>
                                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{v.body}</p>
                            </article>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 p-6 sm:p-8 bg-zinc-50/60 dark:bg-zinc-950/60" aria-label="Lessons">
                <div className="lg:col-span-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        05 - Lessons
                    </span>
                </div>
                <ul className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-5">
                    {detail.learnings.map((learning, i) => (
                        <li
                            key={i}
                            className={cn(
                                "text-base sm:text-lg leading-snug text-zinc-900 dark:text-zinc-100",
                                adlam_display.className
                            )}
                        >
                            <span className="font-mono text-[10px] text-zinc-500 mr-2">L{i + 1}</span>
                            {learning}
                        </li>
                    ))}
                </ul>
            </section>
        </AnimatedPage>
    )
}

function SectionRule({ index, label }: { index: string; label: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                {index} - {label}
            </span>
            <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>
    )
}
