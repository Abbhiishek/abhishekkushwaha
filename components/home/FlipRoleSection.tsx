import { FlipWords } from "@/components/ui/flip-words";
import { cn } from "@/utils/cn";
import { aclonica } from "@/utils/font";

function FlipRoleSection() {
    const words = ["GitHub Campus Expert", "Software Developer", "Mentor", "Web Developer"];
    return (
        <div className="lg:h-full h-[4rem] flex justify-center items-center lg:px-4 px-2" >
            <div className={cn(`lg:text-2xl text-xl mx-auto font-normal text-white`, aclonica.className)}>
                <FlipWords words={words} />
            </div>
        </div >
    )
}

export default FlipRoleSection