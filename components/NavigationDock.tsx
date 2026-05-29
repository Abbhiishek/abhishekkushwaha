"use client"

import { NavbarItems } from "@/lib/nav"
import { cn } from "@/utils/cn"
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion"
import { useKBar } from "kbar"
import { Command, MoreHorizontal, Moon, Sun, X } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

const primaryMobileSlugs = ["/", "/about", "/project", "/blog", "/work"]
const dockDistance = 92
const dockSize = 34
const dockMagnification = 48

function isRouteActive(path: string, slug: string) {
    return path === slug || (slug !== "/" && path.startsWith(`${slug}/`))
}

export default function NavigationDock({ path }: { path: string }) {
    return (
        <>
            <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-3 lg:hidden">
                <MobileDock path={path} />
            </div>
            <div className="pointer-events-none fixed left-5 top-1/2 z-50 hidden -translate-y-1/2 lg:flex">
                <DesktopDock path={path} />
            </div>
        </>
    )
}

function DesktopDock({ path }: { path: string }) {
    const mouseY = useMotionValue(Number.POSITIVE_INFINITY)
    const router = useRouter()
    const { query } = useKBar()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard pattern
    useEffect(() => setMounted(true), [])

    return (
        <motion.nav
            aria-label="Primary navigation"
            onMouseMove={(event) => mouseY.set(event.clientY)}
            onMouseLeave={() => mouseY.set(Number.POSITIVE_INFINITY)}
            className="pointer-events-auto flex flex-col items-center gap-1.5 rounded-2xl border border-white/40 bg-white/72 p-2 shadow-[0_18px_60px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/72 dark:shadow-black/45"
        >
            {NavbarItems.map((item) => (
                <DockButton
                    key={item.slug}
                    axis="y"
                    mouse={mouseY}
                    label={item.name}
                    active={isRouteActive(path, item.slug)}
                    onClick={() => router.push(item.slug)}
                >
                    <item.icon size={16} />
                </DockButton>
            ))}

            <span className="my-1 h-px w-6 bg-zinc-300/80 dark:bg-zinc-700/80" />

            {mounted && (
                <DockButton
                    axis="y"
                    mouse={mouseY}
                    label="Theme"
                    active={false}
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </DockButton>
            )}
            <DockButton
                axis="y"
                mouse={mouseY}
                label="Command"
                active={false}
                onClick={query.toggle}
            >
                <Command size={16} />
            </DockButton>
        </motion.nav>
    )
}

function MobileDock({ path }: { path: string }) {
    const mouseX = useMotionValue(Number.POSITIVE_INFINITY)
    const router = useRouter()
    const { query } = useKBar()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [moreOpen, setMoreOpen] = useState(false)

    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard pattern
    useEffect(() => setMounted(true), [])

    const primaryItems = useMemo(
        () => NavbarItems.filter((item) => primaryMobileSlugs.includes(item.slug)),
        []
    )
    const secondaryItems = useMemo(
        () => NavbarItems.filter((item) => !primaryMobileSlugs.includes(item.slug)),
        []
    )
    const secondaryActive = secondaryItems.some((item) => isRouteActive(path, item.slug))

    return (
        <div className="pointer-events-auto flex w-full max-w-[25rem] flex-col items-center gap-2">
            {moreOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="grid w-full grid-cols-4 gap-1.5 rounded-2xl border border-white/50 bg-white/82 p-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/82 dark:shadow-black/45"
                >
                    {secondaryItems.map((item) => {
                        const active = isRouteActive(path, item.slug)
                        return (
                            <button
                                key={item.slug}
                                aria-label={item.name}
                                onClick={() => {
                                    router.push(item.slug)
                                    setMoreOpen(false)
                                }}
                                className={cn(
                                    "flex h-10 items-center justify-center rounded-xl transition-colors",
                                    active
                                        ? "bg-brand-purple/20 text-brand-pink ring-1 ring-brand-purple/35"
                                        : "text-zinc-600 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-white/10"
                                )}
                            >
                                <item.icon size={17} />
                            </button>
                        )
                    })}
                </motion.div>
            )}

            <motion.nav
                aria-label="Primary navigation"
                onMouseMove={(event) => mouseX.set(event.clientX)}
                onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
                className="flex items-center gap-1.5 rounded-2xl border border-white/50 bg-white/78 p-2 shadow-[0_18px_60px_rgba(15,23,42,0.2)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/78 dark:shadow-black/45"
            >
                {primaryItems.map((item) => (
                    <DockButton
                        key={item.slug}
                        axis="x"
                        mouse={mouseX}
                        label={item.name}
                        active={isRouteActive(path, item.slug)}
                        onClick={() => {
                            router.push(item.slug)
                            setMoreOpen(false)
                        }}
                    >
                        <item.icon size={16} />
                    </DockButton>
                ))}

                <DockButton
                    axis="x"
                    mouse={mouseX}
                    label={moreOpen ? "Close" : "More"}
                    active={moreOpen || secondaryActive}
                    onClick={() => setMoreOpen((value) => !value)}
                >
                    {moreOpen ? <X size={16} /> : <MoreHorizontal size={17} />}
                </DockButton>

                <span className="mx-0.5 h-6 w-px bg-zinc-300/80 dark:bg-zinc-700/80" />

                {mounted && (
                    <DockButton
                        axis="x"
                        mouse={mouseX}
                        label="Theme"
                        active={false}
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    </DockButton>
                )}
                <DockButton
                    axis="x"
                    mouse={mouseX}
                    label="Command"
                    active={false}
                    onClick={query.toggle}
                >
                    <Command size={16} />
                </DockButton>
            </motion.nav>
        </div>
    )
}

function DockButton({
    axis,
    mouse,
    label,
    active,
    onClick,
    children,
}: {
    axis: "x" | "y"
    mouse: MotionValue<number>
    label: string
    active: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    const ref = useRef<HTMLButtonElement>(null)
    const distance = useTransform(mouse, (value) => {
        const bounds = ref.current?.getBoundingClientRect()
        if (!bounds) return Number.POSITIVE_INFINITY

        const center = axis === "x"
            ? bounds.x + bounds.width / 2
            : bounds.y + bounds.height / 2

        return value - center
    })
    const sizeTransform = useTransform(
        distance,
        [-dockDistance, 0, dockDistance],
        [dockSize, dockMagnification, dockSize]
    )
    const size = useSpring(sizeTransform, {
        mass: 0.12,
        stiffness: 170,
        damping: 14,
    })
    const iconScale = useTransform(size, [dockSize, dockMagnification], [1, 1.12])

    return (
        <motion.button
            ref={ref}
            type="button"
            aria-label={label}
            onClick={onClick}
            style={{ width: size, height: size }}
            className={cn(
                "group relative grid shrink-0 place-items-center rounded-xl text-zinc-600 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand-pink/70 dark:text-zinc-400",
                active
                    ? "bg-brand-purple/20 text-brand-pink ring-1 ring-brand-purple/40"
                    : "hover:bg-zinc-200/70 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-100"
            )}
        >
            <motion.span
                className="grid place-items-center"
                style={{ scale: iconScale }}
            >
                {children}
            </motion.span>
            <span
                className={cn(
                    "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-zinc-950 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-white dark:text-zinc-950",
                    axis === "x"
                        ? "-top-9 left-1/2 -translate-x-1/2"
                        : "left-12 top-1/2 -translate-y-1/2"
                )}
            >
                {label}
            </span>
        </motion.button>
    )
}
