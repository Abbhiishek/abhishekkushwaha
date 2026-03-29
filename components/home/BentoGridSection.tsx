import FlipRoleSection from "@/components/home/FlipRoleSection"
import { cn } from "@/utils/cn"
import { adlam_display } from "@/utils/font"
import { Bookmark, Code, Flame, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { FollowerPointerCard } from "../ui/following-pointer"

const navCards = [
    {
        title: "About",
        description: "Know more about me",
        href: "/about",
        icon: User,
        color: "from-sky-500/20 to-blue-600/20 dark:from-sky-500/10 dark:to-blue-600/10",
        ring: "ring-sky-500/30",
    },
    {
        title: "Projects",
        description: "Things I've built",
        href: "/project",
        icon: Code,
        color: "from-emerald-500/20 to-green-600/20 dark:from-emerald-500/10 dark:to-green-600/10",
        ring: "ring-emerald-500/30",
    },
    {
        title: "Blog",
        description: "Writings & snippets",
        href: "/blog",
        icon: Bookmark,
        color: "from-violet-500/20 to-purple-600/20 dark:from-violet-500/10 dark:to-purple-600/10",
        ring: "ring-violet-500/30",
    },
    {
        title: "Tech",
        description: "Tools I use daily",
        href: "/tech",
        icon: Flame,
        color: "from-amber-500/20 to-orange-600/20 dark:from-amber-500/10 dark:to-orange-600/10",
        ring: "ring-amber-500/30",
    },
]

function BentoGridHeroSection() {
    return (
        <main className="flex flex-col gap-6 w-full">
            {/* Hero section: stacks on mobile, side-by-side on desktop */}
            <div className="flex flex-col lg:flex-row gap-6 w-full">
                {/* Photo */}
                <div className="w-full lg:w-5/12 shrink-0">
                    <FollowerPointerCard title={<p>Abhishek Kushwaha</p>}>
                        <Image
                            src="/thumbnail.jpg"
                            alt="Abhishek Kushwaha"
                            width={1000}
                            height={700}
                            className="w-full h-[300px] sm:h-[400px] lg:h-[600px] object-cover rounded-3xl grayscale hover:grayscale-0 transition duration-500 ease-in-out"
                            priority
                        />
                    </FollowerPointerCard>
                </div>

                {/* Right side: Name + Role + Cards */}
                <div className="flex flex-col gap-4 w-full lg:w-7/12">
                    {/* Name banner */}
                    <div
                        className={cn(
                            "rounded-3xl dark:bg-neutrals-12/40 bg-brand-dark ring ring-neutrals-10 flex justify-center items-center py-6 lg:py-8 text-white text-2xl sm:text-3xl lg:text-4xl",
                            adlam_display.className
                        )}
                    >
                        Abhishek Kushwaha
                    </div>

                    {/* Flip role */}
                    <div className="rounded-3xl dark:bg-neutrals-12/40 bg-brand-dark ring-1 ring-navy-blue-400 flex justify-center items-center py-4 lg:py-6">
                        <FlipRoleSection />
                    </div>

                    {/* Nav cards grid */}
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        {navCards.map((card) => (
                            <Link
                                key={card.href}
                                href={card.href}
                                className={cn(
                                    "group relative rounded-2xl bg-gradient-to-br p-4 sm:p-5 lg:p-6 ring-1 flex flex-col justify-between gap-3 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg dark:hover:shadow-zinc-800/50",
                                    card.color,
                                    card.ring
                                )}
                            >
                                <card.icon
                                    size={28}
                                    className="dark:text-zinc-300 text-zinc-700 group-hover:scale-110 transition-transform duration-300"
                                />
                                <div>
                                    <h3 className="dark:text-zinc-200 text-zinc-800 font-semibold text-base sm:text-lg">
                                        {card.title}
                                    </h3>
                                    <p className="dark:text-zinc-400 text-zinc-600 text-xs sm:text-sm mt-0.5">
                                        {card.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default BentoGridHeroSection
