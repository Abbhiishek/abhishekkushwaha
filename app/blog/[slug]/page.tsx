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
        <AnimatedPage className="flex flex-col gap-8 mb-20 mt-28 lg:mt-10 w-full max-w-4xl mx-auto">
            <Link
                href="/blog"
                className="flex items-center gap-2 text-sm dark:text-zinc-400 text-zinc-600 hover:text-brand-purple dark:hover:text-brand-pink transition-colors w-fit"
            >
                <ArrowLeft size={16} />
                Back to Blog
            </Link>

            <header className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                        <span
                            key={tag}
                            className="text-xs px-2.5 py-1 rounded-full bg-brand-purple/10 text-brand-purple dark:text-brand-pink font-medium"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <h1 className={cn("text-3xl sm:text-4xl lg:text-5xl dark:text-white text-zinc-900 leading-tight", adlam_display.className)}>
                    {post.title}
                </h1>

                <div className="flex items-center gap-4 text-sm dark:text-zinc-500 text-zinc-500">
                    <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {post.readingTime} min read
                    </span>
                </div>
            </header>

            <div
                className="prose prose-lg max-w-none w-full prose-zinc dark:prose-invert prose-h1:mb-4 prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 dark:prose-h1:text-zinc-200 prose-h1:text-zinc-900 dark:prose-h2:text-brand-pink prose-h2:text-brand-purple dark:prose-h3:text-zinc-400 prose-h3:text-zinc-800 prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-a:text-brand-pink prose-a:decoration-wavy prose-a:decoration-brand-peach prose-a:underline-offset-2 hover:prose-a:text-brand-peach prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:bg-brand-purple/10 dark:prose-code:bg-brand-purple/20 prose-code:text-brand-pink prose-code:font-normal prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-950 prose-pre:rounded-xl prose-strong:text-zinc-900 dark:prose-strong:text-zinc-200 prose-li:text-zinc-700 dark:prose-li:text-zinc-300 prose-img:rounded-xl prose-img:w-full prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: post.html }}
            />
        </AnimatedPage>
    )
}
