"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { fadeInUp } from "./variants";

interface RevealOnScrollProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

/**
 * Component that reveals its children when scrolled into view
 */
export function RevealOnScroll({ children, className, delay = 0 }: RevealOnScrollProps) {
    const { ref, isInView } = useInView({ once: true });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface ParallaxSectionProps {
    children: ReactNode;
    className?: string;
    offset?: number;
}

/**
 * Component that creates a parallax scroll effect
 * Elements move at different speeds based on scroll position
 */
export function ParallaxSection({ children, className, offset = 50 }: ParallaxSectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, offset]);

    return (
        <motion.div ref={ref} style={{ y }} className={className}>
            {children}
        </motion.div>
    );
}

interface StaggerChildrenProps {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
}

/**
 * Container that staggers the animation of its children
 */
export function StaggerChildren({ children, className, staggerDelay = 0.1 }: StaggerChildrenProps) {
    const { ref, isInView } = useInView({ once: true });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren: 0.1,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
