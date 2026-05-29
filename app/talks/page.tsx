import { AnimatedPage } from "@/components/AnimatedList"
import { pageSocialMetadata } from "@/lib/og-metadata"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { ArrowUpRight, Mic } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Talks, notes & field demos",
    ...pageSocialMetadata({
        page: "talks",
        title: "Talks",
        description: "Practitioner talks and notes on building real-time AI systems.",
    }),
    description: "Practitioner talks and notes on building real-time AI systems — voice agents, LLM evaluation, guardrails, and the production realities behind them.",
}

interface Talk {
    title: string
    venue: string
    date: string
    summary: string
    tags: string[]
    href?: string
}

const featuredTalk: Talk = {
    title: "Building AI agents for real-world applications",
    venue: "Developer meetup · Kolkata",
    date: "Q1 2026",
    summary:
        "What changes when an AI agent has to hold a real conversation under a latency budget, evaluate the response, and not say anything reckless on the way out. Practitioner notes from shipping the HyrecruitAI voice agent.",
    tags: ["AI agents", "Voice", "LLM evaluation", "Guardrails"],
}

const otherTalks: Talk[] = []

export default function Talks() {
    return (
        <AnimatedPage className="w-full min-h-screen h-full p-4 lg:p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full mt-16 lg:mt-0 gap-10 mb-12">
                <div className="flex flex-col gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Field notes
                    </span>
                    <h1
                        className={cn(
                            "dark:text-zinc-200 text-zinc-900 leading-none text-5xl lg:text-6xl tracking-tight",
                            adlam_display.className
                        )}
                    >
                        Talks, notes &amp; field demos
                    </h1>
                    <p className="dark:text-zinc-400 text-zinc-700 leading-relaxed max-w-2xl">
                        Practitioner talks and notes on building real-time AI systems. Most of the time I write instead of present — but when a talk surfaces, it lives here.
                    </p>
                </div>

                <FeaturedTalk talk={featuredTalk} />

                {otherTalks.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                            More talks
                        </span>
                        <div className="flex flex-col gap-3">
                            {otherTalks.map((t) => (
                                <TalkRow key={t.title} talk={t} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <EmptyState />
                )}
            </section>
        </AnimatedPage>
    )
}

function FeaturedTalk({ talk }: { talk: Talk }) {
    return (
        <article className="relative overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 p-6 sm:p-8 bg-zinc-50/60 dark:bg-zinc-950/60">
            <header className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    <Mic size={12} />
                    Featured · {talk.date}
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-peach" />
                    Delivered
                </div>
            </header>

            <h2
                className={cn(
                    "text-2xl sm:text-3xl tracking-tight text-zinc-900 dark:text-zinc-100 mb-2",
                    adlam_display.className
                )}
            >
                {talk.title}
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500 mb-4">{talk.venue}</p>
            <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-2xl">
                {talk.summary}
            </p>

            <ul className="flex flex-wrap gap-1.5 mt-5">
                {talk.tags.map((tag) => (
                    <li
                        key={tag}
                        className="font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded ring-1 ring-zinc-200 dark:ring-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                        {tag}
                    </li>
                ))}
            </ul>
        </article>
    )
}

function TalkRow({ talk }: { talk: Talk }) {
    return (
        <div className="flex items-center justify-between gap-3 py-4 px-4 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-800">
            <div className="flex flex-col gap-1 min-w-0">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{talk.title}</h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                    {talk.venue} · {talk.date}
                </span>
            </div>
            {talk.href && (
                <Link
                    href={talk.href}
                    className="inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                    Notes
                    <ArrowUpRight size={14} />
                </Link>
            )}
        </div>
    )
}

function EmptyState() {
    return (
        <div className="flex flex-col gap-3 p-6 rounded-xl ring-1 ring-dashed ring-zinc-300 dark:ring-zinc-700">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Next up
            </span>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-2xl">
                More talks land here as they happen. In the meantime, the longer-form versions live on{" "}
                <Link href="/blog" className="text-brand-pink dark:text-brand-peach hover:underline underline-offset-4">
                    the blog
                </Link>
                . If you&apos;d like to invite me to speak,{" "}
                <a
                    href="mailto:abhishekkushwaha1479@gmail.com"
                    className="text-brand-pink dark:text-brand-peach hover:underline underline-offset-4"
                >
                    drop a note
                </a>
                .
            </p>
        </div>
    )
}
