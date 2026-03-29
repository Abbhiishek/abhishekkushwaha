"use client"

import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import type { ReactNode } from "react"

export function AnimatedPage({ children, className }: { children: ReactNode; className?: string }) {
    return <PageTransition className={className}>{children}</PageTransition>
}

export function AnimatedGrid({ children, className }: { children: ReactNode; className?: string }) {
    return <StaggerContainer className={className}>{children}</StaggerContainer>
}

export function AnimatedItem({ children, className }: { children: ReactNode; className?: string }) {
    return <StaggerItem className={className}>{children}</StaggerItem>
}
