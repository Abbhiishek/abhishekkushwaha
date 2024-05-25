"use client";

import { actions } from "@/lib/actions";
import { KBarProvider } from "kbar";
import { usePathname } from "next/navigation";
import Palette from "./CMD";
import MobileNavBar from "./MobileNav";
import NavBar from "./Nav";

function NavbarLayout({ children }: { children: React.ReactNode }) {

    const currentRoute = usePathname()
    return (
        <KBarProvider actions={actions}>
            <main className="flex selection:bg-neutrals-12 flex-col overflow-x-hidden min-h-screen items-center max-h-auto relative">
                <Palette />
                <div className="flex w-full h-full lg:w-[60%] md:w-2/3">
                    <div className="w-[6%] fixed left-0 h-full z-50 hidden lg:block md:block">
                        <NavBar path={currentRoute} />
                    </div>
                    <div className="fixed top-0 w-full z-50 block lg:hidden md:hidden px-8 pt-4">
                        <MobileNavBar path={currentRoute} />
                    </div>
                    {children}
                </div>
            </main>
        </KBarProvider>
    )
}

export default NavbarLayout