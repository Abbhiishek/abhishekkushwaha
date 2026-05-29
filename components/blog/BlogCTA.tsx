import LabCard from "@/components/ui/lab-card"
import { ArrowUpRight, BriefcaseBusiness, Mail } from "lucide-react"
import Link from "next/link"

export default function BlogCTA() {
    return (
        <LabCard
            tone="strong"
            className="mt-4"
            contentClassName="grid gap-7 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end"
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-sky-900/60 dark:text-sky-100/45">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-peach" />
                    Senior AI / product engineering
                </div>
                <div className="flex flex-col gap-3">
                    <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-zinc-950 dark:text-white">
                        Building something with agents, evaluation, voice, or AI infrastructure?
                    </h2>
                    <p className="max-w-2xl text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                        I write about the parts of AI products that survive production: latency, reliability,
                        evaluation quality, guardrails, tenant safety, and cost control.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <a
                    href="mailto:abhishekkushwaha1479@gmail.com?subject=Senior%20AI%20engineering%20conversation"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                    <Mail size={16} />
                    Start a conversation
                </a>
                <Link
                    href="/work"
                    className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-zinc-800 ring-1 ring-sky-950/15 transition-colors hover:bg-white/55 dark:text-zinc-200 dark:ring-white/15 dark:hover:bg-white/10"
                >
                    <BriefcaseBusiness size={16} />
                    See work proof
                    <ArrowUpRight size={14} />
                </Link>
            </div>
        </LabCard>
    )
}
