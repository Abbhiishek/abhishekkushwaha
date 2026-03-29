import { NavbarItems } from "@/lib/nav";
import { useKBar } from "kbar";
import { Command, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavBar({ path }: { path: string }) {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { query } = useKBar();
    const [mounted, setMounted] = useState(false);
    const [tooltipVisibility, setTooltipVisibility] = useState([
        false,
        false,
        false,
        false,
        false,
        false,
        false,
    ]);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard pattern
    useEffect(() => { setMounted(true); }, []);

    // function handleThemeBtnCLick() {
    //   // console.log("ok")
    //   themeIcon === "dark" ? setThemeIcon("light") : setThemeIcon("dark");
    // }

    return (
        <div className="w-full min-h-full h-full flex flex-col justify-start items-center pt-6">
            <div className="flex flex-col gap-4">
                {NavbarItems.map((item, index) => {
                    return (
                        <div key={item.slug}>
                            {path === item.slug ? (
                                <button
                                    key={index}
                                    className="w-full flex justify-center items-center bg-brand-purple/20 ring-1 ring-brand-purple/40 shadow hover:shadow-xl rounded hover:scale-110 duration-300 ease-in-out relative"
                                    onMouseLeave={() => {
                                        const temp = [...tooltipVisibility];
                                        temp[index] = false;
                                        setTooltipVisibility(temp);
                                    }}
                                    onMouseEnter={() => {
                                        const temp = [...tooltipVisibility];
                                        temp[index] = true;
                                        setTooltipVisibility(temp);
                                    }}
                                    onClick={() => router.push(item.slug)}
                                >
                                    <div className="p-2">
                                        <item.icon size="1rem" className="text-brand-pink" />
                                    </div>
                                    {tooltipVisibility[index] && (
                                        <span className="absolute min-w-full text-[0.75rem] leading-none left-10 p-[0.62rem] rounded shadow-xl text-zinc-200 bg-brand-purple">
                                            {item.name}
                                        </span>
                                    )}
                                </button>
                            ) : (
                                <button
                                    key={index}
                                    className="w-full flex justify-center items-center dark:bg-zinc-800 dark:hover:bg-zinc-700 shadow hover:shadow-xl rounded hover:scale-110 duration-300 ease-in-out dark:focus:bg-zinc-700 bg-zinc-200 hover:bg-zinc-300 focus:bg-zinc-300 hover:ring-1 hover:ring-brand-purple/30 relative"
                                    onMouseLeave={() => {
                                        const temp = [...tooltipVisibility];
                                        temp[index] = false;
                                        setTooltipVisibility(temp);
                                    }}
                                    onMouseEnter={() => {
                                        const temp = [...tooltipVisibility];
                                        temp[index] = true;
                                        setTooltipVisibility(temp);
                                    }}
                                    onClick={() => router.push(item.slug)}
                                >
                                    <div className="p-2">
                                        <item.icon size="1rem" className="dark:text-zinc-100 text-zinc-700" />
                                    </div>
                                    {tooltipVisibility[index] && (
                                        <span className="absolute text-[0.75rem] leading-none left-10 p-[0.62rem] rounded shadow-xl text-zinc-200 dark:bg-zinc-700 bg-zinc-800">
                                            {item.name}
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
                <div className="flex flex-col gap-4">
                    {mounted === true && (
                        <button
                            className="w-full flex justify-center items-center dark:bg-zinc-800 dark:hover:bg-zinc-700 bg-zinc-200 hover:bg-zinc-300 shadow hover:shadow-xl rounded hover:scale-110 duration-300 ease-in-out hover:ring-1 hover:ring-brand-purple/30"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            <div className="p-2 dark:text-zinc-100 text-zinc-700">
                                {theme === "dark" ? <Sun /> : <Moon />}
                            </div>
                        </button>
                    )}
                    <button
                        className="w-full flex justify-center items-center dark:bg-zinc-800 dark:hover:bg-zinc-700 bg-zinc-200 hover:bg-zinc-300 shadow hover:shadow-xl rounded hover:scale-110 duration-300 ease-in-out hover:ring-1 hover:ring-brand-purple/30"
                        //   onClick={() => router.push(item.slug)}
                        onClick={query.toggle}
                    >
                        <div className="p-2">
                            <Command size="1rem" className="dark:text-zinc-100 text-zinc-700" />
                        </div>
                    </button>
                </div>
            </div>
            <div className="w-[2px] h-full mt-4 bg-gradient-to-b from-brand-purple/40 via-brand-pink/20 to-transparent"></div>
        </div>
    );
}
