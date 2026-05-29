import { NavbarItems } from "@/lib/nav";
import { cn } from "@/utils/cn";
import { useKBar } from "kbar";
import { Command, MoreHorizontal, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const primarySlugs = ["/", "/about", "/project", "/blog", "/work"];

function isRouteActive(path: string, slug: string) {
    return path === slug || (slug !== "/" && path.startsWith(`${slug}/`));
}

export default function MobileNavBar({ path }: { path: string }) {
    const { query } = useKBar();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const primaryItems = NavbarItems.filter((item) => primarySlugs.includes(item.slug));
    const secondaryItems = NavbarItems.filter((item) => !primarySlugs.includes(item.slug));
    const secondaryActive = secondaryItems.some((item) => isRouteActive(path, item.slug));

    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard pattern
    useEffect(() => setMounted(true), []);

    return (
        <div className="flex w-full flex-col gap-2">
            {moreOpen && (
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/90 p-2 shadow-lg ring-1 ring-brand-purple/20 backdrop-blur-xl dark:bg-zinc-900/90">
                    {secondaryItems.map((item) => {
                        const isActive = isRouteActive(path, item.slug);
                        return (
                            <button
                                key={item.slug}
                                onClick={() => {
                                    router.push(item.slug);
                                    setMoreOpen(false);
                                }}
                                aria-label={item.name}
                                className={cn(
                                    "flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-all duration-200",
                                    isActive
                                        ? "bg-brand-purple/20 ring-1 ring-brand-purple/40"
                                        : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                )}
                            >
                                <item.icon
                                    size={16}
                                    className={cn(
                                        "shrink-0",
                                        isActive
                                            ? "text-brand-pink"
                                            : "text-zinc-600 dark:text-zinc-400"
                                    )}
                                />
                                <span className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}
                    {mounted && (
                        <button
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-all duration-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <Sun size={16} className="shrink-0 text-zinc-400" />
                            ) : (
                                <Moon size={16} className="shrink-0 text-zinc-600" />
                            )}
                            <span className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Theme
                            </span>
                        </button>
                    )}
                </div>
            )}
            <div className="grid w-full grid-cols-7 items-center gap-1 rounded-2xl bg-white/85 px-2 py-2 shadow-lg ring-1 ring-brand-purple/20 backdrop-blur-xl dark:bg-zinc-900/85">
                {primaryItems.map((item) => {
                    const isActive = isRouteActive(path, item.slug);
                    return (
                        <button
                            key={item.slug}
                            onClick={() => {
                                router.push(item.slug);
                                setMoreOpen(false);
                            }}
                            aria-label={item.name}
                            className={cn(
                                "flex h-10 min-w-0 items-center justify-center rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-brand-purple/20 ring-1 ring-brand-purple/40"
                                    : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            )}
                        >
                            <item.icon
                                size={18}
                                className={cn(
                                    isActive
                                        ? "text-brand-pink"
                                        : "text-zinc-600 dark:text-zinc-400"
                                )}
                            />
                        </button>
                    );
                })}
                <button
                    className={cn(
                        "flex h-10 min-w-0 items-center justify-center rounded-xl transition-all duration-200",
                        moreOpen || secondaryActive
                            ? "bg-brand-purple/20 ring-1 ring-brand-purple/40"
                            : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    )}
                    onClick={() => setMoreOpen((value) => !value)}
                    aria-label={moreOpen ? "Close more navigation" : "Open more navigation"}
                    aria-expanded={moreOpen}
                >
                    {moreOpen ? (
                        <X size={18} className="text-brand-pink" />
                    ) : (
                        <MoreHorizontal
                            size={19}
                            className={secondaryActive ? "text-brand-pink" : "text-zinc-600 dark:text-zinc-400"}
                        />
                    )}
                </button>
                <button
                    className="flex h-10 min-w-0 items-center justify-center rounded-xl transition-all duration-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    onClick={query.toggle}
                    aria-label="Open command menu"
                >
                    <Command size={18} className="dark:text-zinc-400 text-zinc-600" />
                </button>
            </div>
        </div>
    );
}
