import { AnimatedGrid, AnimatedItem, AnimatedPage } from "@/components/AnimatedList"
import { getBooksByStatus } from "@/lib/bookshelf"
import type { BookItem, ReadingStatus } from "@/lib/bookshelf"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { BookOpen, ExternalLink, Bookmark, Clock } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Bookshelf",
    description: "Books, blogs, and papers that inspire my work.",
}

const sections: { status: ReadingStatus; label: string; icon: typeof BookOpen; accent: string }[] = [
    { status: "reading", label: "Currently Reading", icon: BookOpen, accent: "text-brand-pink border-brand-pink/30" },
    { status: "completed", label: "Finished", icon: Bookmark, accent: "text-brand-purple border-brand-purple/30" },
    { status: "want-to-read", label: "Up Next", icon: Clock, accent: "text-brand-peach border-brand-peach/30" },
]

function BookCard({ item, accent }: { item: BookItem; accent: string }) {
    const Wrapper = item.url ? "a" : "div"
    const wrapperProps = item.url ? { href: item.url, target: "_blank", rel: "noopener noreferrer" } : {}

    return (
        <Wrapper
            {...wrapperProps}
            className="group flex flex-col gap-3 p-5 rounded-2xl ring-1 ring-neutrals-5 dark:ring-neutrals-10 hover:ring-brand-purple/40 dark:hover:ring-brand-purple/40 transition-all duration-300 hover:shadow-lg dark:hover:shadow-brand-purple/5"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h3 className="font-semibold dark:text-zinc-200 text-zinc-900 group-hover:text-brand-pink dark:group-hover:text-brand-peach transition-colors">
                        {item.title}
                    </h3>
                    <p className="text-sm dark:text-zinc-500 text-zinc-500">
                        {item.author}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border", accent)}>
                        {item.type}
                    </span>
                    {item.url && <ExternalLink size={14} className="dark:text-zinc-500 text-zinc-400" />}
                </div>
            </div>
            {item.note && (
                <p className="text-sm dark:text-zinc-400 text-zinc-600 leading-relaxed italic">
                    &ldquo;{item.note}&rdquo;
                </p>
            )}
        </Wrapper>
    )
}

export default function Bookshelf() {
    return (
        <AnimatedPage className="flex flex-col gap-12 mb-20 mt-28 lg:mt-10">
            <div>
                <h1 className={cn("dark:text-zinc-200 text-zinc-900 leading-none mb-3 text-5xl lg:text-6xl", adlam_display.className)}>
                    Bookshelf
                </h1>
                <p className="dark:text-zinc-400 text-zinc-700 leading-relaxed max-w-2xl">
                    Books, blogs, and papers that shape how I think about engineering, leadership, and building products.
                </p>
            </div>

            {sections.map(({ status, label, icon: Icon, accent }) => {
                const items = getBooksByStatus(status)
                if (items.length === 0) return null

                return (
                    <section key={status} className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Icon size={20} className={accent.split(" ")[0]} />
                            <h2 className={cn("text-xl font-semibold dark:text-zinc-200 text-zinc-900", adlam_display.className)}>
                                {label}
                            </h2>
                        </div>
                        <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {items.map((item) => (
                                <AnimatedItem key={item.title}>
                                    <BookCard item={item} accent={accent} />
                                </AnimatedItem>
                            ))}
                        </AnimatedGrid>
                    </section>
                )
            })}
        </AnimatedPage>
    )
}
