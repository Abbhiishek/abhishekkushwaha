"use client"

import { FadeInView } from "@/components/ui/motion"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"

export default function CurrentFocus({ html }: { html: string }) {
    return (
        <FadeInView>
            <section className="flex flex-col gap-5" aria-label="Current focus">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        05 · Now
                    </span>
                    <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <h2
                    className={cn(
                        "text-3xl sm:text-4xl lg:text-5xl tracking-tight text-zinc-900 dark:text-white",
                        adlam_display.className
                    )}
                >
                    Current focus
                </h2>
                <div
                    className="prose max-w-2xl dark:prose-invert prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-em:text-zinc-700 dark:prose-em:text-zinc-300 prose-a:text-brand-pink dark:prose-a:text-brand-peach prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </section>
        </FadeInView>
    )
}
