import { cn } from "@/utils/cn"
import Image from "next/image"
import Link from "next/link"
import { WobbleCard } from "./ui/wobble-card"

interface ProjectsWobbleCardProps {
    url: string,
    title: string,
    description: string,
    image: string,
    gridSpan: string,
    backgroundColor: string,
    imageposition: string
}

function ProjectsWobbleCard({ url, title, description, image, gridSpan, backgroundColor, imageposition }: ProjectsWobbleCardProps) {
    return (
        <Link href={url} target="_blank" passHref className={cn(`h-full  min-h-[500px] lg:min-h-[300px] group`, gridSpan, backgroundColor)}>
            <WobbleCard
                containerClassName={cn(`h-full  min-h-[500px] lg:min-h-[300px] group`, gridSpan, backgroundColor)}
                className=""
            >
                <div className="max-w-xs">
                    <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white font-acme">
                        {title}
                    </h2>
                    <p className="mt-4 text-left  text-base/6 text-neutral-200 font-clash">
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