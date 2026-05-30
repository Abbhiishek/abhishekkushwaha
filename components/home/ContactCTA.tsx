"use client"

import { FadeInView } from "@/components/ui/motion"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { ArrowUpRight, Mail } from "lucide-react"
import Link from "next/link"

export default function ContactCTA() {
    return (
        <FadeInView>
            <section
                className="rounded-2xl border border-zinc-200 bg-white/60 p-8 sm:p-12 dark:border-zinc-800 dark:bg-zinc-950/35"
                aria-label="Contact"
            >
                <div className="flex flex-col gap-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        06 · Talk shop
                    </span>
                    <h2
                        className={cn(
                            "text-3xl sm:text-4xl lg:text-5xl tracking-tight text-zinc-900 dark:text-white max-w-2xl",
                            adlam_display.className
                        )}
                    >
                        Open to senior AI / product engineer roles.
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
                        Strongest fit: teams building real-time agents, LLM evaluation systems, AI guardrails, or developer-facing AI infrastructure where product quality and systems judgment both matter.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <a
                            href="mailto:abhishekkushwaha1479@gmail.com"
                            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors"
                        >
                            <Mail size={15} />
                            Email about a role
                        </a>
                        <Link
                            href="/work"
                            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-md ring-1 ring-zinc-300 dark:ring-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:ring-zinc-900 dark:hover:ring-zinc-100 transition-colors"
                        >
                            View work proof
                            <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>
        </FadeInView>
    )
}
