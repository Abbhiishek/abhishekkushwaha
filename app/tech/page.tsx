import { AnimatedPage } from "@/components/AnimatedList"
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { pageSocialMetadata } from "@/lib/og-metadata"
import { gadgets, stack, tools, type TechItem, type TechSection } from "@/lib/tech"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { ArrowUpRight } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Tech & gadgets",
    description: "Hardware, software, and the daily tooling I use to build AI product systems.",
    keywords: "tech, gadgets, tools, ai tools, llm tools, vector databases, tech stack",
    ...pageSocialMetadata({
        page: "tech",
        title: "Tech & gadgets",
        description: "Hardware, software, and the daily tooling I use to build AI product systems.",
    }),
}

const groups: { id: string; label: string; blurb: string; sections: TechSection[] }[] = [
    {
        id: "gadgets",
        label: "01 · Gadgets",
        blurb: "The physical kit on my desk.",
        sections: gadgets,
    },
    {
        id: "tools",
        label: "02 · Tools",
        blurb: "AI, LLM infra, vector databases, and daily-driver software.",
        sections: tools,
    },
    {
        id: "stack",
        label: "03 · Stack",
        blurb: "The product, backend, and infra choices I keep reaching for.",
        sections: stack,
    },
]

export default function TechPage() {
    return (
        <AnimatedPage className="w-full min-h-screen h-full p-4 lg:p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full mt-16 lg:mt-0 gap-16 lg:gap-20 mb-20">
                <header className="flex flex-col gap-4 max-w-3xl">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Daily kit
                    </span>
                    <h1
                        className={cn(
                            "text-zinc-900 dark:text-zinc-100 leading-none text-5xl lg:text-6xl tracking-tight",
                            adlam_display.className
                        )}
                    >
                        Tech &amp; gadgets
                    </h1>
                    <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed">
                        A living list of the hardware and software I use to build, ship, and ship again. I update this when something earns a permanent spot — not when a new launch happens.
                    </p>
                    <nav className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                        {groups.map((g) => (
                            <a
                                key={g.id}
                                href={`#${g.id}`}
                                className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                {g.label}
                            </a>
                        ))}
                    </nav>
                </header>

                {groups.map((group) => (
                    <TechGroup key={group.id} group={group} />
                ))}
            </section>
        </AnimatedPage>
    )
}

function TechGroup({ group }: { group: (typeof groups)[number] }) {
    return (
        <section id={group.id} className="flex flex-col gap-10 scroll-mt-10">
            <FadeInView>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                            {group.label}
                        </span>
                        <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">{group.blurb}</p>
                </div>
            </FadeInView>

            <div className="flex flex-col gap-12">
                {group.sections.map((section) => (
                    <TechSubsection key={section.id} section={section} />
                ))}
            </div>
        </section>
    )
}

function TechSubsection({ section }: { section: TechSection }) {
    return (
        <FadeInView>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                <header className="lg:col-span-3 flex flex-col gap-2">
                    <h2
                        className={cn(
                            "text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight",
                            adlam_display.className
                        )}
                    >
                        {section.title}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed">{section.blurb}</p>
                </header>
                <StaggerContainer className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                    {section.items.map((item) => (
                        <StaggerItem key={item.name}>
                            <TechCard item={item} />
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </FadeInView>
    )
}

function TechCard({ item }: { item: TechItem }) {
    const Wrapper: React.ElementType = item.url ? "a" : "div"
    const wrapperProps = item.url ? { href: item.url, target: "_blank", rel: "noopener noreferrer" } : {}
    const Icon = item.icon
    return (
        <Wrapper
            {...wrapperProps}
            className={cn(
                "group flex flex-col gap-2 p-5 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white/70 dark:bg-zinc-950/40 h-full",
                item.url && "hover:ring-zinc-400 dark:hover:ring-zinc-700 transition-colors"
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {Icon && (
                        <span className="shrink-0 w-9 h-9 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                            <Icon className="w-4 h-4" />
                        </span>
                    )}
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">{item.name}</h3>
                </div>
                {item.url && (
                    <ArrowUpRight
                        size={14}
                        className="text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 shrink-0 mt-1"
                    />
                )}
            </div>
            {item.detail && (
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {item.detail}
                </span>
            )}
            {item.purpose && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.purpose}</p>
            )}
            {item.note && (
                <p className="text-[12px] text-zinc-500 dark:text-zinc-500 leading-relaxed pt-1 border-t border-dashed border-zinc-200 dark:border-zinc-800 mt-1">
                    {item.note}
                </p>
            )}
        </Wrapper>
    )
}
