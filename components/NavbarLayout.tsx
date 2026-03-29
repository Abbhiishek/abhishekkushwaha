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
            <main className="flex selection:bg-brand-magenta selection:text-white flex-col overflow-x-hidden min-h-screen items-center max-h-auto relative">
                <Palette />
                <div className="flex w-full h-full max-w-7xl mx-auto px-4 lg:px-8 lg:pl-16">
                    <div className="w-[6%] fixed left-0 h-full z-50 hidden lg:block md:block">
                        <NavBar path={currentRoute} />
                    </div>
                    <div className="fixed bottom-0 w-full z-50 block lg:hidden md:hidden px-4 pb-3">
                        <MobileNavBar path={currentRoute} />
                    </div>
                    {children}
                </div>
            </main>
        </KBarProvider>
    )
}

export default NavbarLayout