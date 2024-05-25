import FlipRoleSection from "@/components/home/FlipRoleSection"
import LogoHighlight from "@/components/home/LogoHighlight"
import { cn } from "@/utils/cn"
import { acme, adlam_display } from "@/utils/font"
import Image from "next/image"
import Link from "next/link"
import { FollowerPointerCard } from "../ui/following-pointer"



function BentoGridHeroSection() {
    return (
        <main className="grid grid-cols-12 grid-rows-7 gap-6">
            <div className="col-span-5 row-span-7 rounded-3xl">
                <FollowerPointerCard
                    title={
                        <p>Abhishek Kushwaha</p>
                    }
                >
                    <Image
                        src="/thumbnail.jpg"
                        alt="hero" width={1000} height={100}
                        className="w-[1200px] h-[700px] object-cover rounded-3xl grayscale hover:grayscale-0 transition duration-500 ease-in-out"
                    />
                </FollowerPointerCard>
            </div>
            <div
                className="col-span-5 row-span-2 col-start-6  rounded-3xl flex justify-center items-center dark:bg-neutrals-12/40 bg-brand-dark  ring-1 ring-navy-blue-400">
                <FlipRoleSection />
            </div>
            <div
                className="col-span-2 row-span-2 col-start-11 rounded-full ring-neutrals-10 ring-4">
                <Link href={"/👀"} className=" flex justify-center items-center h-full">
                    <FollowerPointerCard
                        className="flex justify-center items-center h-full"
                        title={
                            <p>Know about me </p>
                        }
                    >
                        <LogoHighlight />
                    </FollowerPointerCard>
                </Link>
            </div>

            <div className="col-span-3 row-span-3 col-start-6  row-start-3 rounded-3xl ring-neutrals-11 ring-4">
                <Link href={"/🔥"} className=" flex justify-center items-center h-full">
                    <FollowerPointerCard
                        className="flex justify-center items-center h-full"
                        title={
                            <p>check out projects</p>
                        }
                    >
                        <div className="flex text-center flex-col text-9xl">
                            🔥
                        </div>
                    </FollowerPointerCard>
                </Link>
            </div>

            <div className="col-span-4 row-span-3 col-start-9 row-start-3 flex justify-center items-center rounded-3xl ring-neutrals-11 ring-4">

                <Link href={"/🔖"} className=" flex justify-center items-center h-full">
                    <FollowerPointerCard
                        className="flex justify-center items-center h-full"
                        title={
                            <p>checkout blogs and snippets</p>
                        }
                    >
                        <div className="flex text-center flex-col gap-5">
                            <p className={cn(`text-9xl font-extrabold font`, acme.className)}>
                                🔖
                            </p>
                        </div>
                    </FollowerPointerCard>
                </Link>
            </div>
            <div
                className={cn(`col-span-7 row-span-2 col-start-6 row-start-6 ring ring-neutrals-10 dark:bg-neutrals-12/40 bg-brand-dark flex justify-center items-center lg:text-5xl rounded-3xl`, adlam_display.className)}>
                Abhishek Kushwaha
            </div>

        </main>
    )
}

export default BentoGridHeroSection