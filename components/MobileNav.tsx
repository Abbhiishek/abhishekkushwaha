import { NavbarItems } from "@/lib/nav";
import { cn } from "@/utils/cn";
import { useKBar } from "kbar";
import { Command, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MobileNavBar({ path }: { path: string }) {
    const { query } = useKBar();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard pattern
    useEffect(() => setMounted(true), []);

    return (
        <div className="w-full flex items-center gap-1 py-2 px-2 rounded-2xl dark:bg-zinc-900/80 bg-white/80 backdrop-blur-xl shadow-lg ring-1 ring-brand-purple/20 overflow-x-auto">
            <div className="flex items-center gap-1 flex-1 min-w-0">
                {NavbarItems.map((item, index) => {
                    const isActive = path === item.slug;
                    return (
                        <button
                            key={index}
                            onClick={() => router.push(item.slug)}
                            className={cn(
                                "shrink-0 p-2.5 rounded-xl transition-all duration-200",
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
                                        : "dark:text-zinc-400 text-zinc-600"
                                )}
                            />
                        </button>
                    );
                })}
            </div>
            <div className="flex items-center gap-1 shrink-0 border-l border-zinc-300 dark:border-zinc-700 pl-1">
                {mounted && (
                    <button
                        className="p-2.5 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all duration-200"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        {theme === "dark" ? (
                            <Sun size={18} className="text-zinc-400" />
                        ) : (
                            <Moon size={18} className="text-zinc-600" />
                        )}
                    </button>
                )}
                <button
                    className="p-2.5 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all duration-200"
                    onClick={query.toggle}
                >
                    <Command size={18} className="dark:text-zinc-400 text-zinc-600" />
                </button>
            </div>
        </div>
    );
}
