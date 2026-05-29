import { cn } from "@/utils/cn"
import type { ElementType, HTMLAttributes, ReactNode } from "react"

type LabCardTone = "default" | "strong" | "quiet"

interface LabCardProps extends HTMLAttributes<HTMLElement> {
    as?: ElementType
    children: ReactNode
    contentClassName?: string
    corners?: boolean
    interactive?: boolean
    tone?: LabCardTone
}

const toneClassName: Record<LabCardTone, string> = {
    default:
        "bg-sky-50/70 text-zinc-900 ring-sky-950/10 shadow-[0_24px_80px_-54px_rgba(14,116,144,0.65)] dark:bg-[#071b2f] dark:text-zinc-100 dark:ring-sky-200/10",
    strong:
        "bg-[#e9f6ff] text-zinc-900 ring-sky-950/10 shadow-[0_26px_90px_-48px_rgba(14,116,144,0.75)] dark:bg-[#061b31] dark:text-zinc-100 dark:ring-sky-200/10",
    quiet:
        "bg-white/70 text-zinc-900 ring-zinc-200 shadow-[0_22px_70px_-58px_rgba(14,116,144,0.55)] dark:bg-zinc-950/55 dark:text-zinc-100 dark:ring-sky-200/10",
}

export default function LabCard({
    as: Component = "div",
    children,
    className,
    contentClassName,
    corners = true,
    interactive = false,
    tone = "default",
    ...props
}: LabCardProps) {
    return (
        <Component
            className={cn(
                "relative overflow-hidden rounded-2xl ring-1 backdrop-blur",
                toneClassName[tone],
                interactive && "transition-colors hover:ring-sky-400/50 dark:hover:ring-sky-200/25",
                className
            )}
            {...props}
        >
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-300/24 via-transparent to-brand-peach/12 dark:from-sky-400/10 dark:via-transparent dark:to-brand-peach/8"
            />
            <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent dark:via-sky-200/20"
            />
            {corners && <LabCorners />}
            <div className={cn("relative z-10 h-full", contentClassName)}>{children}</div>
        </Component>
    )
}

export function LabCorners() {
    return (
        <>
            <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-sky-700/30 dark:border-sky-200/25" />
            <span className="absolute top-3 right-3 w-3 h-3 border-t border-r border-sky-700/30 dark:border-sky-200/25" />
            <span className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-sky-700/30 dark:border-sky-200/25" />
            <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-sky-700/30 dark:border-sky-200/25" />
        </>
    )
}
