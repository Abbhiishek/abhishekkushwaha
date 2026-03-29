"use client"

import { FollowerPointerCard } from "@/components/ui/following-pointer"
import { FadeIn } from "@/components/ui/motion"
import { links } from "@/lib/links"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const keywords = ["AI & ML", "System Architecture", "Engineering Leadership"]

function BentoGridHeroSection() {
    return (
        <section className="flex flex-col-reverse lg:flex-row items-center lg:items-start gap-8 lg:gap-10 w-full">
            {/* Content — LEFT */}
            <div className="flex flex-col gap-5 w-full lg:w-[58%] text-left">
                {/* Keyword chips */}
                <FadeIn delay={0.1}>
                    <div className="flex flex-wrap justify-start gap-2">
                        {keywords.map((kw, i) => (
                            <span key={kw} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-pink">
                                {kw}
                                {i < keywords.length - 1 && <span className="text-neutrals-7">·</span>}
                            </span>
                        ))}
                    </div>
                </FadeIn>

                {/* Headline */}
                <FadeIn delay={0.2}>
                    <h1
                        className={cn(
                            "text-xl sm:text-2xl lg:text-3xl text-neutrals-13 dark:text-white leading-snug",
                            adlam_display.className
                        )}
                    >
                        CTO & Co-founder at HyrecruitAI <br /> building the future of AI-powered hiring.
                    </h1>
                </FadeIn>

                {/* Description paragraphs */}
                <FadeIn delay={0.35}>
                    <div className="flex flex-col gap-4 text-base sm:text-lg leading-relaxed text-neutrals-7 dark:text-neutrals-6">
                        <p>
                            I lead engineering at{" "}
                            <span className="text-brand-purple dark:text-brand-pink font-medium">HyrecruitAI</span>,
                            where we are building an AI-powered interview and assessment platform.
                            From architecting the real-time video pipeline to designing our LLM evaluation engine,
                            I own the full technical stack — infrastructure, product, and team.
                        </p>
                        <p>
                            My work spans{" "}
                            <span className="text-brand-purple dark:text-brand-pink font-medium">system design</span>,{" "}
                            <span className="text-brand-purple dark:text-brand-pink font-medium">full-stack development</span>,{" "}
                            <span className="text-brand-purple dark:text-brand-pink font-medium">AI/ML integration</span>, and{" "}
                            <span className="text-brand-purple dark:text-brand-pink font-medium">engineering management</span>.
                            I have scaled teams from 2 to 15 engineers, shipped products used by thousands,
                            and built open-source tools adopted by the developer community.
                        </p>
                    </div>
                </FadeIn>

                {/* Social links */}
                <FadeIn delay={0.5}>
                    <div className="flex items-center justify-start gap-5 mt-2">
                        {links.slice(0, 5).map((link) => (
                            <motion.a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.name}
                                whileHover={{ scale: 1.2, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                className="text-neutrals-7 dark:text-neutrals-6 hover:text-brand-purple dark:hover:text-brand-pink transition-colors duration-200"
                            >
                                <link.icon size={22} />
                            </motion.a>
                        ))}
                    </div>
                </FadeIn>

                {/* CTAs */}
                <FadeIn delay={0.6}>
                    <div className="flex items-center justify-start gap-4 mt-2">
                        <Link
                            href="/about"
                            className="flex items-center gap-2 px-6 py-3 rounded-full ring-1 ring-neutrals-5 dark:ring-neutrals-10 text-neutrals-9 dark:text-neutrals-5 text-sm font-medium uppercase tracking-wide hover:ring-brand-purple/50 dark:hover:ring-brand-purple/50 transition-colors duration-200"
                        >
                            About Me
                        </Link>
                        <Link
                            href="/blog"
                            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-brand-purple text-white text-sm font-medium uppercase tracking-wide hover:bg-brand-magenta transition-colors duration-200"
                        >
                            Read Latest Blogs
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </FadeIn>
            </div>

            {/* Photo — RIGHT */}
            <FadeIn delay={0.3} y={0} className="w-full lg:w-[42%] shrink-0 overflow-hidden rounded-3xl">
                <FollowerPointerCard title={<p>Abhishek Kushwaha</p>}>
                    <Image
                        src="/thumbnail.jpg"
                        alt="Abhishek Kushwaha"
                        width={800}
                        height={800}
                        className="w-full h-auto rounded-3xl hover:scale-105 transition-transform duration-500 ease-in-out"
                        priority
                    />
                </FollowerPointerCard>
            </FadeIn>
        </section>
    )
}

export default BentoGridHeroSection
