import { AnimatedPage } from "@/components/AnimatedList"
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { bookshelf, getBooksByStatus, type BookItem, type ReadingStatus } from "@/lib/bookshelf"
import { pageSocialMetadata } from "@/lib/og-metadata"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { ArrowUpRight } from "lucide-react"
import { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
    title: "Bookshelf",
    description: "Books, blogs, and papers that shape how I think about AI systems, engineering, and the craft.",
    ...pageSocialMetadata({
        page: "bookshelf",
        title: "Bookshelf",
        description: "Books, blogs, and papers that shape how I think about AI systems, engineering, and the craft.",
    }),
}

const sections: { status: ReadingStatus; index: string; label: string; sublabel: string }[] = [
    { status: "reading", index: "01", label: "Reading now", sublabel: "Active on the desk" },
    { status: "completed", index: "02", label: "Finished", sublabel: "Lessons carried into the work" },
    { status: "want-to-read", index: "03", label: "Up next", sublabel: "Queued, in order of priority" },
]

const typeBadge: Record<BookItem["type"], string> = {
    book: "BOOK",
    blog: "ESSAY",
    paper: "PAPER",
}

export default function Bookshelf() {
    return (
        <AnimatedPage className="w-full min-h-screen h-full p-4 lg:p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full mt-16 lg:mt-0 gap-16 lg:gap-20 mb-20">
                <header className="flex flex-col gap-4 max-w-3xl">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Reading log
                    </span>
                    <h1
                        className={cn(
                            "text-zinc-900 dark:text-zinc-100 leading-none text-5xl lg:text-6xl tracking-tight",
                            adlam_display.className
                        )}
                    >
                        Bookshelf
                    </h1>
                    <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed">
                        Books, essays, and papers that shape how I think about AI systems, engineering craft, and the leadership work behind both. The notes are why something stayed — not a review.
                    </p>
                    <BookCounter />
                </header>

                {sections.map((section) => {
                    const items = getBooksByStatus(section.status)
                    if (items.length === 0) return null

                    return (
                        <FadeInView key={section.status}>
                            <section className="flex flex-col gap-8">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                                            {section.index} · {section.label}
                                        </span>
                                        <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                            {items.length} {items.length === 1 ? "item" : "items"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed">
                                        {section.sublabel}
                                    </p>
                                </div>

                                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                                    {items.map((item) => (
                                        <StaggerItem key={item.title}>
                                            <BookCard item={item} />
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            </section>
                        </FadeInView>
                    )
                })}
            </section>
        </AnimatedPage>
    )
}

function BookCounter() {
    const reading = bookshelf.filter((b) => b.status === "reading").length
    const finished = bookshelf.filter((b) => b.status === "completed").length
    const queued = bookshelf.filter((b) => b.status === "want-to-read").length
    return (
        <div className="grid grid-cols-3 gap-x-6 gap-y-2 max-w-md font-mono text-[10px] uppercase tracking-[0.18em] pt-3">
            <Stat label="Reading" value={reading} />
            <Stat label="Finished" value={finished} />
            <Stat label="Queued" value={queued} />
        </div>
    )
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex flex-col">
            <span className="text-zinc-900 dark:text-zinc-100 text-lg font-sans">{value}</span>
            <span className="text-zinc-500">{label}</span>
        </div>
    )
}

function BookCard({ item }: { item: BookItem }) {
    const Wrapper: React.ElementType = item.url ? "a" : "div"
    const wrapperProps = item.url ? { href: item.url, target: "_blank", rel: "noopener noreferrer" } : {}

    return (
        <Wrapper
            {...wrapperProps}
            className={cn(
                "group flex gap-5 p-5 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white/70 dark:bg-zinc-950/40 h-full",
                item.url && "hover:ring-zinc-400 dark:hover:ring-zinc-700 transition-colors"
            )}
        >
            <BookCover item={item} />
            <div className="flex flex-col gap-2 min-w-0 flex-1">
                <header className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                            {item.title}
                        </h3>
                        <span className="text-sm text-zinc-500 dark:text-zinc-500">{item.author}</span>
                    </div>
                    {item.url && (
                        <ArrowUpRight
                            size={14}
                            className="text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 shrink-0 mt-1"
                        />
                    )}
                </header>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-600">
                        {typeBadge[item.type]}
                    </span>
                    {item.topic && (
                        <>
                            <span className="font-mono text-[10px] text-zinc-300 dark:text-zinc-700">·</span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded ring-1 ring-zinc-200 dark:ring-zinc-800 text-zinc-500">
                                {item.topic}
                            </span>
                        </>
                    )}
                </div>
                {item.note && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic mt-1">
                        &ldquo;{item.note}&rdquo;
                    </p>
                )}
            </div>
        </Wrapper>
    )
}

function BookCover({ item }: { item: BookItem }) {
    if (item.cover) {
        return (
            <div className="shrink-0 relative w-20 sm:w-24 h-28 sm:h-32 rounded-md overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                <Image
                    src={item.cover}
                    alt={`${item.title} cover`}
                    fill
                    sizes="96px"
                    className="object-cover"
                />
            </div>
        )
    }
    // Typographic fallback — show first 1-2 letters of title in a stylized "spine"
    const initials = item.title
        .split(" ")
        .filter((w) => /^[A-Za-z]/.test(w))
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
    return (
        <div
            aria-hidden
            className="shrink-0 relative w-20 sm:w-24 h-28 sm:h-32 rounded-md overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 flex flex-col items-center justify-center gap-1"
        >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600">
                {typeBadge[item.type]}
            </span>
            <span
                className={cn(
                    "text-3xl text-zinc-700 dark:text-zinc-300 tracking-tight",
                    adlam_display.className
                )}
            >
                {initials || "·"}
            </span>
            <span className="absolute left-1 top-1 bottom-1 w-px bg-brand-peach/60" />
        </div>
    )
}
