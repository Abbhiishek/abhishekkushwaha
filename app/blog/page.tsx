import { AnimatedPage } from "@/components/AnimatedList"
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { getAllBlogPosts } from "@/lib/blogs"
import { pageSocialMetadata } from "@/lib/og-metadata"
import type { BlogPost } from "@/lib/types"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { ArrowUpRight, Calendar, Clock } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Blog",
    description: "Four focused essays on real-time AI systems, LLM evaluation, semantic caching, and multi-tenant AI SaaS.",
    ...pageSocialMetadata({
        page: "blogs",
        title: "Blog",
        description: "Four focused essays on real-time AI systems, LLM evaluation, semantic caching, and multi-tenant AI SaaS.",
    }),
}

export default function Blogs() {
    const posts = getAllBlogPosts()
    const featured = posts.filter((p) => p.featured)
    const archive = posts.filter((p) => !p.featured)
    const archiveByYear = groupByYear(archive)
    const years = Object.keys(archiveByYear).sort((a, b) => Number(b) - Number(a))

    return (
        <AnimatedPage className="w-full min-h-screen h-full p-4 lg:p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full mt-16 lg:mt-0 gap-16 lg:gap-20 mb-20">
                <header className="flex flex-col gap-4 max-w-3xl">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Writing
                    </span>
                    <h1
                        className={cn(
                            "text-zinc-900 dark:text-zinc-100 leading-none text-5xl lg:text-6xl tracking-tight",
                            adlam_display.className
                        )}
                    >
                        Blog
                    </h1>
                    <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed">
                        Four focused essays on the engineering work behind AI products: real-time voice systems, LLM evaluation, semantic caching, and the SaaS infrastructure that keeps everything safe to scale.
                    </p>
                    <Stats total={posts.length} featured={featured.length} />
                </header>

                {featured.length > 0 && (
                    <FadeInView>
                        <section className="flex flex-col gap-8">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-pink dark:text-brand-peach">
                                    01 / Core essays
                                </span>
                                <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                            </div>
                            <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
                                {featured.map((post) => (
                                    <StaggerItem key={post.slug}>
                                        <FeaturedPostCard post={post} />
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                        </section>
                    </FadeInView>
                )}

                {years.map((year, gi) => (
                    <FadeInView key={year}>
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-500">
                                    {String(gi + 2).padStart(2, "0")} / {year}
                                </span>
                                <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                    {archiveByYear[year].length} posts
                                </span>
                            </div>
                            <StaggerContainer className="flex flex-col border-t border-zinc-200 dark:border-zinc-800">
                                {archiveByYear[year].map((post, i) => (
                                    <StaggerItem key={post.slug}>
                                        <ArchivePostRow post={post} index={i} />
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                        </section>
                    </FadeInView>
                ))}
            </section>
        </AnimatedPage>
    )
}

function FeaturedPostCard({ post }: { post: BlogPost }) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group relative flex flex-col gap-4 p-6 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white dark:bg-zinc-950/40 hover:ring-brand-pink/40 dark:hover:ring-brand-peach/40 transition-colors h-full overflow-hidden"
        >
            <span
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-pink/0 via-brand-pink/70 to-brand-pink/0 dark:from-brand-peach/0 dark:via-brand-peach/70 dark:to-brand-peach/0"
            />
            <header className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                    <Calendar size={12} />
                    {formatDate(post.date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} />
                    {post.readingTime}m
                </span>
            </header>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 leading-tight tracking-tight group-hover:text-brand-pink dark:group-hover:text-brand-peach transition-colors">
                {post.title}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">{post.description}</p>
            <ul className="flex flex-wrap gap-1.5 mt-auto">
                {post.tags.slice(0, 3).map((tag) => (
                    <li
                        key={tag}
                        className="font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                    >
                        {tag}
                    </li>
                ))}
            </ul>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.18em] text-brand-pink dark:text-brand-peach group-hover:translate-x-0.5 transition-transform">
                Read
                <ArrowUpRight size={12} />
            </span>
        </Link>
    )
}

function ArchivePostRow({ post, index }: { post: BlogPost; index: number }) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group grid grid-cols-[3rem_1fr_4rem] sm:grid-cols-[3rem_1fr_10rem_4rem] items-center gap-3 sm:gap-6 py-5 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors -mx-2 px-2 rounded"
        >
            <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 dark:text-zinc-600 group-hover:text-brand-pink dark:group-hover:text-brand-peach transition-colors">
                {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-1 min-w-0">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-brand-pink dark:group-hover:text-brand-peach transition-colors truncate">
                    {post.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">{post.description}</p>
            </div>
            <div className="hidden sm:flex flex-wrap gap-1.5 justify-end">
                {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-500">
                        {tag}
                    </span>
                ))}
            </div>
            <div className="flex items-center justify-end gap-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
                <span>{post.readingTime}m</span>
                <ArrowUpRight
                    size={14}
                    className="text-zinc-400 dark:text-zinc-600 group-hover:text-brand-pink dark:group-hover:text-brand-peach group-hover:translate-x-0.5 transition-all"
                />
            </div>
        </Link>
    )
}

function Stats({ total, featured }: { total: number; featured: number }) {
    return (
        <div className="grid grid-cols-3 gap-x-6 gap-y-2 max-w-md font-mono text-[10px] uppercase tracking-[0.18em] pt-3">
            <Stat label="Essays" value={total} />
            <Stat label="Core" value={featured} />
            <Stat label="Topics" value="AI / Systems / SaaS" small />
        </div>
    )
}

function Stat({ label, value, small }: { label: string; value: number | string; small?: boolean }) {
    return (
        <div className="flex flex-col">
            <span className={cn("text-zinc-900 dark:text-zinc-100 font-sans", small ? "text-sm" : "text-lg")}>
                {value}
            </span>
            <span className="text-zinc-500 dark:text-zinc-500">{label}</span>
        </div>
    )
}

function groupByYear(posts: BlogPost[]): Record<string, BlogPost[]> {
    return posts.reduce<Record<string, BlogPost[]>>((acc, post) => {
        const year = post.date ? new Date(post.date).getFullYear().toString() : "Undated"
        if (!acc[year]) acc[year] = []
        acc[year].push(post)
        return acc
    }, {})
}

function formatDate(date: string) {
    if (!date) return ""
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
