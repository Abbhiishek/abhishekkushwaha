"use client";

import { actions } from "@/lib/actions";
import { KBarProvider } from "kbar";
import { usePathname } from "next/navigation";
import Palette from "./CMD";
import NavigationDock from "./NavigationDock";

function NavbarLayout({ children }: { children: React.ReactNode }) {

    const currentRoute = usePathname()
    return (
        <KBarProvider actions={actions}>
            <main className="flex selection:bg-brand-magenta selection:text-white flex-col overflow-x-hidden min-h-screen items-center max-h-auto relative">
                <Palette />
                <NavigationDock path={currentRoute} />
                <div className="flex w-full h-full max-w-7xl mx-auto px-4 pb-24 lg:px-8 lg:pl-20 lg:pb-0">
                    {children}
                </div>
            </main>
        </KBarProvider>
    )
}

export default NavbarLayout
