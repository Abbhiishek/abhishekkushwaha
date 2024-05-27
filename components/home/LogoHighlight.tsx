import Image from "next/image"


function LogoHighlight({ src }:
    { src: string }
) {

    return (
        <div className="flex justify-center items-center px-4 h-full" >
            <div className="text-4xl mx-auto font-normal text-white">
                <Image src={src} alt="logo" width={100} height={100} className="w-full h-full" />
            </div>
        </div >
    )
}

export default LogoHighlight