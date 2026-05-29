import { AnimatedPage } from "@/components/AnimatedList"
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blogs"
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
    }
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params
    const post = getBlogPostBySlug(slug)

    if (!post) notFound()

    return (
        <AnimatedPage className="w-full flex flex-col gap-10 mb-24 mt-16 lg:mt-10 max-w-4xl mx-auto px-2 lg:px-4">
            <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors w-fit"
            >
                <ArrowLeft size={14} />
                Back to writing
            </Link>

            <header className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    <span className="inline-flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(post.date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1.5">
                        <Clock size={12} />
                        {post.readingTime} min read
                    </span>
                    {post.featured && (
                        <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-peach" />
                                Pinned
                            </span>
                        </>
                    )}
                </div>

                <h1
                    className={cn(
                        "text-3xl sm:text-4xl lg:text-5xl dark:text-white text-zinc-900 leading-[1.1] tracking-tight",
                        adlam_display.className
                    )}
                >
                    {post.title}
                </h1>

                {post.description && (
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">{post.description}</p>
                )}

                <ul className="flex flex-wrap gap-1.5 mt-1">
                    {post.tags.map((tag) => (
                        <li
                            key={tag}
                            className="font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded ring-1 ring-zinc-200 dark:ring-zinc-800 text-zinc-600 dark:text-zinc-400"
                        >
                            {tag}
                        </li>
                    ))}
                </ul>
            </header>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            <div
                className="prose prose-lg max-w-none w-full prose-zinc dark:prose-invert prose-h1:mb-4 prose-h2:mt-10 prose-h2:mb-4 prose-h2:tracking-tight prose-h3:mt-6 prose-h3:tracking-tight dark:prose-h1:text-zinc-100 prose-h1:text-zinc-900 dark:prose-h2:text-zinc-100 prose-h2:text-zinc-900 dark:prose-h3:text-zinc-200 prose-h3:text-zinc-800 prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-a:text-brand-pink dark:prose-a:text-brand-peach prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:bg-zinc-100 dark:prose-code:bg-zinc-900 prose-code:text-zinc-900 dark:prose-code:text-zinc-100 prose-code:font-mono prose-code:text-[0.9em] prose-pre:bg-zinc-950 dark:prose-pre:bg-zinc-950 prose-pre:rounded-lg prose-pre:ring-1 prose-pre:ring-zinc-200 dark:prose-pre:ring-zinc-800 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-li:text-zinc-700 dark:prose-li:text-zinc-300 prose-blockquote:border-l-2 prose-blockquote:border-brand-peach prose-blockquote:not-italic prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300 prose-img:rounded-lg prose-img:w-full prose-img:ring-1 prose-img:ring-zinc-200 dark:prose-img:ring-zinc-800"
                dangerouslySetInnerHTML={{ __html: post.html }}
            />

            <footer className="flex flex-col gap-4 pt-10 border-t border-zinc-200 dark:border-zinc-800">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    End of post
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    Found something useful — or wrong? I&apos;d rather hear about it than not.{" "}
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
