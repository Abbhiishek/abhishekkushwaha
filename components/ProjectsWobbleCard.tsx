import { cn } from "@/utils/cn"
import Image from "next/image"
import Link from "next/link"
import { WobbleCard } from "./ui/wobble-card"

interface ProjectsWobbleCardProps {
    title: string,
    description: string,
    image: string,
    gridSpan: string,
    backgroundColor: string,
    imageposition: string,
    url: string
}

function ProjectsWobbleCard({ url, title, description, image, gridSpan, backgroundColor, imageposition }: ProjectsWobbleCardProps) {
    return (
        <Link href={url} className={cn(``, gridSpan)}>
            <WobbleCard
                containerClassName={cn(`h-full min-h-[400px] lg:min-h-[300px] group`, backgroundColor)}
                className=""
            >
                <div className="max-w-xs">
                    <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] dark:text-white text-neutral-500 hover:text-neutrals-9 font-acme">
                        {title}
                    </h2>
                    <p className="mt-4 text-left  text-base/6 dark:text-neutral-200 text-neutral-500 font-clash font-semibold">
                        {description}
                    </p>
                </div>
                <Image
                    src={image}
                    width={600}
                    height={600}
                    alt={title}
                    className={cn(`absolute  -z-40 grayscale group-hover:grayscale-0 filter object-contain rounded-2xl transition-all duration-200 ease-in-out`, imageposition)}
                />
            </WobbleCard>
        </Link>
    )
}

export default ProjectsWobbleCard