import FlipRoleSection from "@/components/home/FlipRoleSection"
import LogoHighlight from "@/components/home/LogoHighlight"
import Image from "next/image"

function BentoGridHeroSection() {
    return (
        <main className="grid grid-cols-12 grid-rows-7 gap-10 place-content-center">
            <div className="col-span-5 row-span-7 rounded-3xl">
                <Image
                    src="/thumbnail.jpg"
                    alt="hero" width={1000} height={100}
                    className="w-[1200px] h-[700px] object-cover rounded-3xl grayscale hover:grayscale-0 transition duration-500 ease-in-out"
                />
            </div>
            <div
                className="col-span-5 row-span-2 col-start-6  rounded-3xl flex justify-center items-center bg-brand-brand-blue-chill">
                <FlipRoleSection />
            </div>
            <div
                className="col-span-2 row-span-2 col-start-11 rounded-full bg-Neutrals-neutrals-12">
                <LogoHighlight />
            </div>
            <div className="col-span-3 row-span-3 col-start-6 row-start-3">Projects</div>
            <div className="col-span-4 row-span-3 col-start-9 row-start-3">Blogs/socials</div>
            <div className="col-span-7 row-span-2 col-start-6 row-start-6">My name</div>

        </main>
    )
}

export default BentoGridHeroSection