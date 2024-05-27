import { links } from "@/lib/links";
import Link from "next/link";

export default function LinksComponent() {
    return (
        <div className="w-full min-h-screen h-full p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full justify-between mt-16 lg:mt-0 md:mt-0 prose gap-6 mb-12">
                <div>
                    <h1 className="dark:text-zinc-200 text-zinc-900 leading-none mb-3 text-6xl font-adlam">Links</h1>
                    <p className="dark:text-zinc-400 text-zinc-800 m-0 leading-tight">
                        All my profile links to find me on the web.
                    </p>
                </div>
                <div className="dark:bg-gradient-to-r dark:from-neutral-800 dark:to-zinc-800 bg-gradient-to-r from-neutral-200 to-zinc-200 rounded-lg shadow-xl p-4 flex justify-between gap-2">
                    <div className="flex flex-col w-full gap-2">
                        {links.map((link, index) => (
                            <Link key={index} href={link.url}>
                                <div
                                    key={index}
                                    className="flex justify-between items-center dark:bg-zinc-900/60 bg-zinc-100/60 duration-200 p-2 rounded-lg hover:shadow-lg cursor-pointer w-full hover:-translate-y-1"
                                >
                                    <p className="dark:text-zinc-300 text-zinc-800 m-0 text-sm lg:text-base md:text-base">
                                        {link.name} <span className="dark:text-zinc-600 text-zinc-500">{" // "}</span>{" "}
                                        {link.value}
                                    </p>
                                    <p className="dark:text-zinc-300 text-zinc-800 m-0">{link.icon({})}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
