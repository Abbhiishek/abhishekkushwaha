import { AnimatedGrid, AnimatedItem, AnimatedPage } from "@/components/AnimatedList"
import { workExperiences } from "@/lib/work"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
    title: "Work",
    description: "A summary of my work and contributions.",
}

const typeBadgeColors: Record<string, string> = {
    "Full-time": "bg-brand-purple/10 text-brand-purple dark:text-brand-pink",
    Internship: "bg-brand-pink/10 text-brand-pink dark:text-brand-peach",
    Contract: "bg-brand-magenta/10 text-brand-magenta",
    Freelance: "bg-brand-peach/10 text-brand-peach",
    Volunteer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
}

export default function Work() {
    return (
        <AnimatedPage className="w-full min-h-screen h-full p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full justify-between mt-16 lg:mt-0 md:mt-0 gap-8 mb-12">
                <div>
                    <h1 className={cn("dark:text-zinc-200 text-zinc-900 leading-none mb-3 text-5xl lg:text-6xl", adlam_display.className)}>
                        Work
                    </h1>
                    <p className="dark:text-zinc-400 text-zinc-700 leading-relaxed max-w-2xl">
                        On a mission to build products developers love, and along the way, teach the next generation of developers.
                    </p>
                </div>

                <AnimatedGrid className="flex flex-col gap-6">
                    {workExperiences.map((work, i) => (
                        <AnimatedItem key={i}>
                        <div
                            className="flex gap-5 p-6 rounded-2xl ring-1 ring-neutrals-5 dark:ring-neutrals-10 hover:ring-brand-purple/30 dark:hover:ring-brand-purple/30 transition-all duration-300"
                        >
                            {/* Logo */}
                            <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-neutrals-4 dark:bg-neutrals-11 flex items-center justify-center">
                                <Image
                                    src={work.logo}
                                    alt={work.company}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-contain p-1"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-2 flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                    <h2 className="font-semibold text-lg text-brand-pink dark:text-brand-peach">
                                        {work.url ? (
                                            <a href={work.url} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-wavy decoration-brand-peach underline-offset-2">
                                                {work.company}
                                            </a>
                                        ) : (
                                            work.company
                                        )}
                                    </h2>
                                    <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full w-fit", typeBadgeColors[work.type] ?? "bg-zinc-500/10 text-zinc-500")}>
                                        {work.type}
                                    </span>
                                </div>

                                <p className="font-medium dark:text-zinc-200 text-zinc-900 text-sm">
                                    {work.role}
                                </p>

                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs dark:text-zinc-500 text-zinc-500">
                                    <span>{work.duration}</span>
                                    <span>·</span>
                                    <span>{work.location}</span>
                                </div>

                                <div className="flex flex-col gap-2 mt-2">
                                    {work.description.map((para, j) => (
                                        <p key={j} className="text-sm leading-relaxed dark:text-zinc-400 text-zinc-600">
                                            {para}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        </AnimatedItem>
                    ))}
                </AnimatedGrid>
            </section>
        </AnimatedPage>
    )
}
