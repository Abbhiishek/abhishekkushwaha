"use client"

import { motion, type Variants } from "framer-motion"
import type { ReactNode } from "react"

// ── Fade in from bottom ──
interface FadeInProps {
    children: ReactNode
    className?: string
    delay?: number
    duration?: number
    y?: number
}

export function FadeIn({ children, className, delay = 0, duration = 0.5, y = 20 }: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// ── Fade in when scrolled into view ──
interface FadeInViewProps {
    children: ReactNode
    className?: string
    delay?: number
    duration?: number
    y?: number
}

export function FadeInView({ children, className, delay = 0, duration = 0.5, y = 30 }: FadeInViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// ── Stagger container + children ──
const staggerContainerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const staggerItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" },
    },
}

interface StaggerContainerProps {
    children: ReactNode
    className?: string
    delay?: number
    stagger?: number
}

export function StaggerContainer({ children, className, delay = 0, stagger = 0.1 }: StaggerContainerProps) {
    return (
        <motion.div
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: stagger,
                        delayChildren: delay,
                    },
                },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <motion.div variants={staggerItemVariants} className={className}>
            {children}
        </motion.div>
    )
}

// ── Scale on hover ──
export function ScaleOnHover({ children, className, scale = 1.03 }: { children: ReactNode; className?: string; scale?: number }) {
    return (
        <motion.div
            whileHover={{ scale }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// ── Page wrapper for fade-in on mount ──
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
