"use client"

import { FadeIn } from "@/components/ui/motion"
import { cn } from "@/utils/cn"
import { motion } from "framer-motion"

type ConsoleStatus = "live" | "active" | "watching"

interface ConsoleRow {
    label: string
    detail: string
    status: ConsoleStatus
}

const rows: ConsoleRow[] = [
    { label: "voice.pipeline", detail: "Sub-second turn-taking", status: "live" },
    { label: "llm.evaluation", detail: "Rubric-based scoring", status: "live" },
    { label: "guardrails", detail: "Multi-layer content policy", status: "live" },
    { label: "embeddings", detail: "pgvector + reranker", status: "live" },
    { label: "webrtc", detail: "Real-time video transport", status: "live" },
    { label: "multi_tenant.saas", detail: "Per-tenant isolation", status: "active" },
    { label: "product.ui", detail: "Next.js, design systems", status: "active" },
    { label: "dev.tooling", detail: "CLIs, SDKs, OSS", status: "watching" },
]

const statusDot: Record<ConsoleStatus, string> = {
    live: "bg-brand-peach",
    active: "bg-brand-pink",
    watching: "bg-zinc-400 dark:bg-zinc-600",
}

const statusLabel: Record<ConsoleStatus, string> = {
    live: "LIVE",
    active: "ACTIVE",
    watching: "WATCH",
}

const gridStyle: React.CSSProperties = {
    backgroundImage:
        "linear-gradient(to right, rgba(120,120,120,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,120,120,0.18) 1px, transparent 1px)",
    backgroundSize: "22px 22px",
    maskImage: "radial-gradient(circle at 60% 40%, black 0%, transparent 80%)",
    WebkitMaskImage: "radial-gradient(circle at 60% 40%, black 0%, transparent 80%)",
}

export default function SystemConsole() {
    return (
        <FadeIn delay={0.3} y={12}>
            <div
                className={cn(
                    "relative overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800",
                    "bg-white/70 dark:bg-zinc-950/60 backdrop-blur"
                )}
                aria-label="Systems Abhishek builds"
            >
                {/* Grid background */}
                <div className="absolute inset-0 pointer-events-none" style={gridStyle} aria-hidden />

                {/* Header */}
                <div className="relative flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                            ~/abhishek · systems
                        </span>
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500">
                        {rows.length} / {rows.length} online
                    </span>
                </div>

                {/* Rows */}
                <div className="relative divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                    {rows.map((row, i) => (
                        <motion.div
                            key={row.label}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.06, duration: 0.4, ease: "easeOut" }}
                            className="flex items-center justify-between gap-3 px-4 py-2.5"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="relative flex h-2 w-2 shrink-0">
                                    {row.status === "live" && (
                                        <span
                                            className={cn(
                                                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-60",
                                                statusDot[row.status]
                                            )}
                                        />
                                    )}
                                    <span className={cn("relative inline-flex h-2 w-2 rounded-full", statusDot[row.status])} />
                                </span>
                                <span className="font-mono text-[12px] sm:text-[13px] text-zinc-800 dark:text-zinc-200 truncate">
                                    {row.label}
                                </span>
                                <span className="hidden sm:inline-block text-[12px] text-zinc-500 dark:text-zinc-500 truncate">
                                    {row.detail}
                                </span>
                            </div>
                            <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-400 dark:text-zinc-500 shrink-0">
                                {statusLabel[row.status]}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 font-mono text-[10px] tracking-[0.18em] text-zinc-500">
                    <span>stack snapshot · v2026.05</span>
                    <SignalPath />
                </div>
            </div>
        </FadeIn>
    )
}

function SignalPath() {
    return (
        <svg width="72" height="10" viewBox="0 0 72 10" fill="none" aria-hidden className="text-brand-peach">
            <motion.path
                d="M0 5 H20 L24 1 H40 L44 9 H72"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0.3 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
        </svg>
    )
}
