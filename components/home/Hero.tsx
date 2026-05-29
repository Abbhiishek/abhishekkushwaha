"use client"

import SystemConsole from "@/components/home/SystemConsole"
import { FadeIn } from "@/components/ui/motion"
import { links } from "@/lib/links"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { motion } from "framer-motion"
import { ArrowRight, Mail } from "lucide-react"
import Link from "next/link"

const surfaceTags = ["Voice agents", "LLM evaluation", "WebRTC", "Multi-tenant SaaS"]

export default function Hero() {
    return (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start lg:items-center w-full pt-2 lg:pt-4">
            <div className="lg:col-span-7 flex flex-col gap-7 order-1">
                <FadeIn delay={0.05}>
                    <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-peach opacity-60" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-peach" />
                        </span>
                        <span>Online · Building from Kolkata, IN</span>
                    </div>
                </FadeIn>

                <FadeIn delay={0.15}>
                    <h1
                        className={cn(
                            "leading-[1.05] tracking-tight text-zinc-900 dark:text-white text-[clamp(2.1rem,4.4vw,3.6rem)]",
                            adlam_display.className
                        )}
                    >
                        AI product engineer
                        <br />
                        building real-time
                        <br />
                        <span className="text-brand-pink dark:text-brand-peach">intelligent systems.</span>
                    </h1>
                </FadeIn>

                <FadeIn delay={0.3}>
                    <p className="text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-xl">
                        I design, ship, and scale AI products — voice agents, LLM evaluation engines, real-time video, semantic caching, and the multi-tenant SaaS plumbing that lets them serve thousands of users. Currently leading engineering at{" "}
                        <Link
                            href="/work"
                            className="text-zinc-900 dark:text-zinc-100 underline decoration-zinc-400 dark:decoration-zinc-600 underline-offset-4 hover:decoration-brand-pink dark:hover:decoration-brand-peach transition-colors"
                        >
                            HyrecruitAI
                        </Link>
                        .
                    </p>
                </FadeIn>

                <FadeIn delay={0.4}>
                    <ul className="flex flex-wrap gap-x-2 gap-y-2" aria-label="Surface areas">
                        {surfaceTags.map((t) => (
                            <li
                                key={t}
                                className="font-mono text-[11px] uppercase tracking-[0.14em] px-2.5 py-1 rounded ring-1 ring-zinc-200 dark:ring-zinc-800 text-zinc-600 dark:text-zinc-400"
                            >
                                {t}
                            </li>
                        ))}
                    </ul>
                </FadeIn>

                <FadeIn delay={0.5}>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/work"
                            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors"
                        >
                            See the systems I&apos;ve shipped
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <a
                            href="mailto:abhishekkushwaha1479@gmail.com"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md ring-1 ring-zinc-300 dark:ring-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:ring-zinc-900 dark:hover:ring-zinc-100 transition-colors"
                        >
                            <Mail size={15} />
                            Talk shop
                        </a>
                    </div>
                </FadeIn>

                <FadeIn delay={0.6}>
                    <div className="flex items-center gap-5 pt-1">
                        {links.slice(0, 5).map((link) => (
                            <motion.a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.name}
                                whileHover={{ y: -2 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                <link.icon size={18} />
                            </motion.a>
                        ))}
                    </div>
                </FadeIn>
            </div>

            <div className="hidden lg:block lg:col-span-5 w-full order-2">
                <SystemConsole />
            </div>
        </section>
    )
}
