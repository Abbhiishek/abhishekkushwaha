import { AnimatedPage } from "@/components/AnimatedList"
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { pageSocialMetadata } from "@/lib/og-metadata"
import { profileImagePath } from "@/lib/site"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { ArrowUpRight, Mail } from "lucide-react"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
    title: "About",
    description: "Abhishek Kushwaha — AI product engineer building real-time intelligent systems. Writing, talks, community, and the work behind it.",
    keywords: "about, abhishek kushwaha, ai product engineer, llm evaluation, voice agents, webrtc, multi-tenant saas",
    ...pageSocialMetadata({
        page: "about",
        title: "About",
        description: "Abhishek Kushwaha - AI product engineer building real-time intelligent systems.",
    }),
}

const today = [
    {
        label: "Leading engineering at",
        value: "HyrecruitAI",
        note: "An AI interviewer running thousands of real conversations a week.",
        href: "https://hyrecruitai.com",
    },
    {
        label: "Shipping into",
        value: "Voice + LLM evals",
        note: "Sub-second voice turn-taking, multi-pass rubric scoring, guardrails between every LLM call and the candidate.",
    },
    {
        label: "Writing at",
        value: "/blog",
        note: "Posts on the unglamorous parts of shipping AI — guardrails, embeddings, semantic caches, prompt versioning.",
        href: "/blog",
    },
]

const community = [
    {
        role: "GDSC Lead",
        org: "Google Developer Student Club, JIS University",
        period: "2022 – 2023",
        impact: "Built and led a 400+ developer community on campus. Workshops, hackathons, the whole stack.",
    },
    {
        role: "GitHub Campus Expert",
        org: "GitHub Education",
        period: "2022 – present",
        impact: "Mentored students into shipping their first OSS PRs.",
    },
    {
        role: "Technical writer",
        org: "Scaler Academy",
        period: "2022 – 2023",
        impact: "Wrote Python tutorials that helped people cross the beginner-to-intermediate line.",
    },
]

const offEditor = [
    { label: "Cinema", body: "Anything Villeneuve. Anything that earns a second watch." },
    { label: "Books", body: "Re-reading The Three-Body Problem. Sci-fi that holds up the second time gets a third." },
    { label: "Cricket", body: "Watching > playing. Always wanted to play more." },
    { label: "Games", body: "Long single-player stories I can't skim — Plague Tale, Death Stranding." },
]

const photos = [
    { src: "/about1.jpg", caption: "Cloud Community Days · Kolkata · 2023", className: "md:col-span-2 md:row-span-2" },
    { src: "/about3.jpg", caption: "GDSC Graduation Ceremony · Bangalore · 2023", className: "md:col-span-1" },
    { src: "/about4.jpg", caption: "Hosting a Cloud Computing workshop · JIS University", className: "md:col-span-1" },
    { src: "/about5.jpg", caption: "Somewhere in Kolkata · 2022", className: "md:col-span-1" },
    { src: "/about6.jpg", caption: "With the senior I learned the most from", className: "md:col-span-1" },
]

export default function About() {
    return (
        <AnimatedPage className="w-full min-h-screen h-full p-4 lg:p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full mt-16 lg:mt-0 gap-16 lg:gap-20 mb-20">
                {/* Hero band */}
                <header className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-7 flex flex-col gap-5">
                        <FadeInView>
                            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                                About
                            </span>
                        </FadeInView>
                        <FadeInView>
                            <h1
                                className={cn(
                                    "text-zinc-900 dark:text-white text-5xl sm:text-6xl leading-none tracking-tight",
                                    adlam_display.className
                                )}
                            >
                                Abhishek Kushwaha
                            </h1>
                        </FadeInView>
                        <FadeInView>
                            <p className="text-lg sm:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                AI product engineer. I build voice agents, LLM evaluation pipelines, real-time video, semantic caches, and the multi-tenant SaaS infrastructure that makes them run.
                            </p>
                        </FadeInView>
                        <FadeInView>
                            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                I work at the interface where the model, the product, and the infrastructure all decide outcomes together. Latency budgets in the morning, rubric design at noon, billing edge cases in the afternoon. That&apos;s the part I enjoy most.
                            </p>
                        </FadeInView>
                    </div>
                    <FadeInView className="lg:col-span-5">
                        <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                            <Image
                                src={profileImagePath}
                                alt="Abhishek Kushwaha"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/85">
                                <span>Kolkata, IN</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand-peach" />
                                    Building
                                </span>
                            </div>
                        </div>
                    </FadeInView>
                </header>

                {/* Today band */}
                <Band index="01" label="Today">
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {today.map((t, i) => (
                            <StaggerItem key={i}>
                                <article className="flex flex-col gap-2 p-5 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 h-full">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                        {t.label}
                                    </span>
                                    {t.href ? (
                                        <Link
                                            href={t.href}
                                            target={t.href.startsWith("http") ? "_blank" : undefined}
                                            rel={t.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                            className="inline-flex items-center gap-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100 hover:text-brand-pink dark:hover:text-brand-peach transition-colors w-fit"
                                        >
                                            {t.value}
                                            <ArrowUpRight size={14} />
                                        </Link>
                                    ) : (
                                        <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                            {t.value}
                                        </span>
                                    )}
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        {t.note}
                                    </p>
                                </article>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </Band>

                {/* Long-form intro */}
                <Band index="02" label="The longer version">
                    <FadeInView className="max-w-3xl">
                        <div className="flex flex-col gap-5 text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            <p>
                                I started building software with Discord bots and Python tutorials, then found my way into web apps because I liked the idea of code that talks back to people. I wrote my first real program in class 10. I&apos;ve been chasing the same feeling since.
                            </p>
                            <p>
                                The site exists because the work deserved a home outside of Notion docs and PR descriptions. The blog is the home for the unglamorous parts — guardrails, embeddings precision, voice latency budgets, prompt versioning, the production decisions nobody puts on conference slides.
                            </p>
                            <p>
                                I code primarily in TypeScript and Python, dip into Go for systems work, and have been learning Rust. I prefer products that respect the user&apos;s time and infrastructure that respects the on-call engineer&apos;s sleep.
                            </p>
                        </div>
                    </FadeInView>
                </Band>

                {/* Community */}
                <Band index="03" label="Community track">
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-3xl mb-4 leading-relaxed">
                        Before AI products, I ran developer communities and wrote tutorials. That work taught me how to document like I&apos;m teaching the next person — because at some point I will be.
                    </p>
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {community.map((c) => (
                            <StaggerItem key={c.role}>
                                <article className="flex flex-col gap-2 p-5 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 h-full">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                        {c.period}
                                    </span>
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{c.role}</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-500">{c.org}</p>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                                        {c.impact}
                                    </p>
                                </article>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </Band>

                {/* Frames band */}
                <Band index="04" label="Frames from the journey">
                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {photos.map((p, i) => (
                            <StaggerItem key={p.src} className={p.className}>
                                <figure
                                    className={cn(
                                        "group relative overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-100 dark:bg-zinc-900",
                                        i === 0 ? "aspect-[4/3] md:aspect-auto md:h-full md:min-h-[24rem]" : "aspect-[4/3]"
                                    )}
                                >
                                    <Image
                                        src={p.src}
                                        alt={p.caption}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <figcaption className="absolute bottom-2 left-2 right-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/85 px-2 py-1 rounded bg-black/35 backdrop-blur-sm">
                                        {p.caption}
                                    </figcaption>
                                </figure>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </Band>

                {/* Off-editor */}
                <Band index="05" label="Off the editor">
                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {offEditor.map((o) => (
                            <StaggerItem key={o.label}>
                                <article className="flex flex-col gap-1.5 p-5 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 h-full">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                        {o.label}
                                    </span>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                        {o.body}
                                    </p>
                                </article>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </Band>

                {/* Contact band */}
                <FadeInView>
                    <section className="relative overflow-hidden rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 p-8 sm:p-10 bg-zinc-50/60 dark:bg-zinc-950/60">
                        <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-zinc-400 dark:border-zinc-600" />
                        <span className="absolute top-3 right-3 w-3 h-3 border-t border-r border-zinc-400 dark:border-zinc-600" />
                        <span className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-zinc-400 dark:border-zinc-600" />
                        <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-zinc-400 dark:border-zinc-600" />
                        <div className="flex flex-col gap-4">
                            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                                06 · Contact
                            </span>
                            <h2
                                className={cn(
                                    "text-2xl sm:text-3xl text-zinc-900 dark:text-white tracking-tight max-w-2xl",
                                    adlam_display.className
                                )}
                            >
                                Open to senior AI / product engineering conversations and collaborations.
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <a
                                    href="mailto:abhishekkushwaha1479@gmail.com"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors"
                                >
                                    <Mail size={15} />
                                    Email
                                </a>
                                <Link
                                    href="/links"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md ring-1 ring-zinc-300 dark:ring-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:ring-zinc-900 dark:hover:ring-zinc-100 transition-colors"
                                >
                                    All channels
                                    <ArrowUpRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </section>
                </FadeInView>
            </section>
        </AnimatedPage>
    )
}

function Band({
    index,
    label,
    children,
}: {
    index: string
    label: string
    children: React.ReactNode
}) {
    return (
        <FadeInView>
            <section className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        {index} · {label}
                    </span>
                    <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                </div>
                {children}
            </section>
        </FadeInView>
    )
}
