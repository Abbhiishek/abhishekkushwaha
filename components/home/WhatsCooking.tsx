"use client"

import { FadeInView } from "@/components/ui/motion"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"

interface WhatsCookingProps {
    html: string
}

export default function WhatsCooking({ html }: WhatsCookingProps) {
    return (
        <FadeInView>
            <section className="flex flex-col gap-4 w-full p-6 sm:p-8 rounded-2xl ring-1 ring-brand-magenta/20 bg-brand-purple/5 dark:bg-brand-purple/5">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-pink opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-pink" />
                    </span>
                    <h2 className={cn("text-xl sm:text-2xl dark:text-white text-neutrals-13", adlam_display.className)}>
                        What&apos;s Cooking?
                    </h2>
                </div>
                <div
                    className="prose prose-sm max-w-none dark:prose-invert prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-strong:text-brand-pink dark:prose-strong:text-brand-peach prose-a:text-brand-pink prose-a:decoration-wavy prose-a:decoration-brand-peach prose-a:underline-offset-2"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </section>
        </FadeInView>
    )
}
