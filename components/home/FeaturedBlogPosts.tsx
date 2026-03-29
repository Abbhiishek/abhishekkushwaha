"use client"

import { FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import type { BlogPost } from "@/lib/types"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { ArrowRight, Calendar, Clock } from "lucide-react"
import Link from "next/link"

const cardAccents = [
    { border: "ring-brand-pink/30", hoverBorder: "hover:ring-brand-pink/60", title: "group-hover:text-brand-pink", dot: "bg-brand-pink" },
    { border: "ring-brand-peach/30", hoverBorder: "hover:ring-brand-peach/60", title: "group-hover:text-brand-peach", dot: "bg-brand-peach" },
    { border: "ring-brand-magenta/30", hoverBorder: "hover:ring-brand-magenta/60", title: "group-hover:text-brand-magenta", dot: "bg-brand-magenta" },
]

export default function FeaturedBlogPosts({ posts }: { posts: BlogPost[] }) {
    const featured = posts

    if (featured.length === 0) return null

    return (
        <section className="flex flex-col gap-6 w-full">
            <FadeInView>
                <div className="flex items-end justify-between">
                    <h2 className={cn("text-2xl sm:text-3xl dark:text-white text-neutrals-13", adlam_display.className)}>
                        Latest Writing
                    </h2>
                    <Link
                        href="/blog"
                        className="group flex items-center gap-1.5 text-sm text-brand-pink hover:text-brand-peach transition-colors"
                    >
                        Read all
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </FadeInView>

            <StaggerContainer className="flex flex-col gap-4">
                {featured.map((post, i) => {
                    const accent = cardAccents[i % cardAccents.length]
                    return (
                        <StaggerItem key={post.slug}>
                            <Link
                                href={`/blog/${post.slug}`}
                                className={cn(
                                    "group flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-5 rounded-2xl ring-1 transition-all duration-300 hover:shadow-lg",
                                    accent.border,
                                    accent.hoverBorder
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn("w-2 h-2 rounded-full mt-2.5 shrink-0", accent.dot)} />
                                    <div className="flex flex-col gap-1.5">
                                        <h3 className={cn("font-semibold dark:text-zinc-200 text-zinc-900 transition-colors", accent.title)}>
                                            {post.title}
                                        </h3>
                                        <p className="text-sm dark:text-zinc-400 text-zinc-600 line-clamp-1">
                                            {post.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs dark:text-zinc-500 text-zinc-500 shrink-0 pl-6 sm:pl-0">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={13} />
                                        {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={13} />
                                        {post.readingTime} min
                                    </span>
                                </div>
                            </Link>
                        </StaggerItem>
                    )
                })}
            </StaggerContainer>
        </section>
    )
}
