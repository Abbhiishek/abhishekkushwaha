import { NavbarItems } from "@/lib/nav";
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

    useEffect(() => setMounted(true), []);

    return (
        <div className="min-w-full min-h-full h-full flex overflow-x-scroll dark:bg-zinc-800/50 bg-zinc-500/50 justify-center items-center py-1 rounded-lg shadow-xl gap-4">
            <div className="flex justify-evenly gap-4 pl-24">
                {NavbarItems.map((item, index) => {
                    return (
                        <button
                            key={index}
                            className="w-full h-12 flex justify-center items-center"
                        >
                            {path === item.slug ? (
                                <item.icon
                                    size="2rem"
                                    className="text-zinc-100 rounded dark:bg-zinc-700 bg-zinc-800 dark:hover:bg-zinc-700 hover:bg-zinc-800 py-2 cursor-pointer hover:scale-110 duration-300 ease-in-out shadow hover:shadow-xl"
                                    onClick={() => router.push(item.slug)}
                                />
                            ) : (
                                <item.icon
                                    size="2rem"
                                    className="text-zinc-100 rounded dark:bg-zinc-800 bg-zinc-700 dark:hover:bg-zinc-700 hover:bg-zinc-800 py-2 cursor-pointer hover:scale-110 duration-300 ease-in-out shadow hover:shadow-xl"
                                    onClick={() => router.push(item.slug)}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
            <div className="flex gap-4 pr-4">
                {mounted && (
                    <button
                        className="w-full flex justify-center items-center dark:bg-zinc-800 bg-zinc-700 dark:hover:bg-zinc-700 hover:bg-zinc-800 shadow hover:shadow-xl rounded hover:scale-110 duration-300 ease-in-out"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        <div className="p-2 text-zinc-100">
                            {theme === "dark" ? <Sun /> : <Moon />}
                        </div>
                    </button>
                )}
                <button
                    className="w-full flex justify-center items-center dark:bg-zinc-800 bg-zinc-700 dark:hover:bg-zinc-700 hover:bg-zinc-800 shadow hover:shadow-xl rounded hover:scale-110 duration-300 ease-in-out"
                    //   onClick={() => router.push(item.slug)}
                    onClick={query.toggle}
                >
                    <div className="p-2">
                        <Command size="1rem" className="text-zinc-100" />
                    </div>
                </button>
            </div>
        </div>
    );
}
