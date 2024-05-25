import Image from "next/image"


function LogoHighlight() {

    return (
        <div className="flex justify-center items-center px-4 h-full" >
            <div className="text-4xl mx-auto font-normal text-white">
                <Image src="/boy-with-laptop.png" alt="logo" width={100} height={100} className="w-40" />
            </div>
        </div >
    )
}

export default LogoHighlight