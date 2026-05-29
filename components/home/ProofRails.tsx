"use client"

import { FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { proofRails } from "@/lib/case-studies"

export default function ProofRails() {
    return (
        <FadeInView>
            <section
                className="border-t border-b border-zinc-200 dark:border-zinc-800 py-10 lg:py-12"
                aria-label="Engineering range and authority"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 flex flex-col gap-5">
                        <SectionLabel index="01" label="Range" />
                        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
                            {proofRails.systems.map((s) => (
                                <StaggerItem key={s.label}>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-mono text-[12px] text-zinc-900 dark:text-zinc-100">
                                            {s.label}
                                        </span>
                                        <span className="text-[12px] text-zinc-500 dark:text-zinc-500 leading-relaxed">
                                            {s.note}
                                        </span>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>

                    <div className="flex flex-col gap-5">
                        <SectionLabel index="02" label="Authority" />
                        <div className="flex flex-col gap-3">
                            {proofRails.authority.map((a) => (
                                <div key={a.label} className="grid grid-cols-[5rem_auto_1fr] items-baseline gap-3">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                        {a.label}
                                    </span>
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {a.value}
                                    </span>
                                    <span className="text-[12px] text-zinc-500 dark:text-zinc-500 truncate">
                                        {a.note}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </FadeInView>
    )
}

function SectionLabel({ index, label }: { index: string; label: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                {index} · {label}
            </span>
            <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>
    )
}
