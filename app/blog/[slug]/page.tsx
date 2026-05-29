import { AnimatedPage } from "@/components/AnimatedList"
import BlogCTA from "@/components/blog/BlogCTA"
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blogs"
import { blogSocialMetadata } from "@/lib/og-metadata"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    const posts = getAllBlogPosts()
    return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const post = getBlogPostBySlug(slug)
    if (!post) return { title: "Post Not Found" }

    return {
        title: post.title,
        description: post.description,
        keywords: post.tags.join(", "),
        ...blogSocialMetadata({
            title: post.title,
            description: post.description,
        }),
    }
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params
    const post = getBlogPostBySlug(slug)

    if (!post) notFound()

    return (
        <AnimatedPage className="w-full flex flex-col gap-10 mb-24 mt-16 lg:mt-10 max-w-[92rem] mx-auto px-2 lg:px-4">
            <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors w-fit"
            >
                <ArrowLeft size={14} />
                Back to writing
            </Link>

            <header className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-[0_24px_90px_-70px_rgba(24,24,27,0.55)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/45 dark:shadow-black/35 sm:p-8">
                <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-peach/70 to-transparent"
                />
                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar size={12} />
                            {new Date(post.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                        <span>/</span>
                        <span className="inline-flex items-center gap-1.5">
                            <Clock size={12} />
                            {post.readingTime} min read
                        </span>
                        {post.featured && (
                            <>
                                <span>/</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand-peach" />
                                    Core essay
                                </span>
                            </>
                        )}
                    </div>

                    <h1
                        className={cn(
                            "max-w-4xl text-4xl sm:text-5xl lg:text-6xl dark:text-white text-zinc-900 leading-[1.02] tracking-tight",
                            adlam_display.className
                        )}
                    >
                        {post.title}
                    </h1>

                    {post.description && (
                        <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {post.description}
                        </p>
                    )}

                    <ul className="flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                            <li
                                key={tag}
                                className="font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded-md bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 dark:text-zinc-400"
                            >
                                {tag}
                            </li>
                        ))}
                    </ul>
                </div>
            </header>

            <article className="w-full rounded-2xl border border-zinc-200 bg-white/65 px-5 py-7 shadow-[0_26px_100px_-80px_rgba(24,24,27,0.55)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/35 sm:px-8 sm:py-10 lg:px-12">
                <div
                    className="blog-prose prose prose-lg max-w-none w-full prose-zinc dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: post.html }}
                />
            </article>

            <BlogCTA />

            <footer className="flex flex-col gap-4 pt-10 border-t border-zinc-200 dark:border-zinc-800">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    End of post
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    Found something useful or wrong? I&apos;d rather hear about it than not.{" "}
                    <a
                        href="mailto:abhishekkushwaha1479@gmail.com"
                        className="text-brand-pink dark:text-brand-peach hover:underline underline-offset-4"
                    >
                        abhishekkushwaha1479@gmail.com
                    </a>
                    .
                </p>
            </footer>
        </AnimatedPage>
    )
}
