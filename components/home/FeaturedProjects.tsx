"use client"

import { FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import type { Project } from "@/lib/types"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { ArrowRight, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const cardAccents = [
    { border: "ring-brand-purple/30", hoverBorder: "hover:ring-brand-purple/60", title: "text-brand-purple dark:text-brand-pink", shadow: "dark:hover:shadow-brand-purple/10" },
    { border: "ring-brand-magenta/30", hoverBorder: "hover:ring-brand-magenta/60", title: "text-brand-magenta dark:text-brand-peach", shadow: "dark:hover:shadow-brand-magenta/10" },
    { border: "ring-brand-pink/30", hoverBorder: "hover:ring-brand-pink/60", title: "text-brand-pink dark:text-brand-peach", shadow: "dark:hover:shadow-brand-pink/10" },
]

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
    const featured = projects

    return (
        <section className="flex flex-col gap-6 w-full">
            <FadeInView>
                <div className="flex items-end justify-between">
                    <h2 className={cn("text-2xl sm:text-3xl dark:text-white text-neutrals-13", adlam_display.className)}>
                        Featured Projects
                    </h2>
                    <Link
                        href="/project"
                        className="group flex items-center gap-1.5 text-sm text-brand-pink hover:text-brand-peach transition-colors"
                    >
                        View all
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </FadeInView>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featured.map((project, i) => {
                    const accent = cardAccents[i % cardAccents.length]
                    return (
                        <StaggerItem key={project.title}>
                            <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "group flex flex-col gap-4 p-5 rounded-2xl ring-1 transition-all duration-300 hover:shadow-lg h-full",
                                    accent.border,
                                    accent.hoverBorder,
                                    accent.shadow
                                )}
                            >
                                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-neutrals-4 dark:bg-neutrals-11">
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <h3 className={cn("font-semibold transition-colors", accent.title)}>
                                            {project.title}
                                        </h3>
                                        <ExternalLink size={14} className="dark:text-zinc-500 text-zinc-400" />
                                    </div>
                                    <p className="text-sm dark:text-zinc-400 text-zinc-600 line-clamp-2">
                                        {project.description}
                                    </p>
                                </div>
                            </a>
                        </StaggerItem>
                    )
                })}
            </StaggerContainer>
        </section>
    )
}
