"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to track scroll progress from 0 to 1
 * Useful for scroll progress indicators and scroll-based animations
 */
export function useScrollProgress(): number {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const updateScrollProgress = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            const progress = scrollHeight > 0 ? scrolled / scrollHeight : 0;
            setScrollProgress(Math.min(Math.max(progress, 0), 1));
        };

        // Initial calculation
        updateScrollProgress();

        // Update on scroll
        window.addEventListener("scroll", updateScrollProgress, { passive: true });
        window.addEventListener("resize", updateScrollProgress, { passive: true });

        return () => {
            window.removeEventListener("scroll", updateScrollProgress);
            window.removeEventListener("resize", updateScrollProgress);
        };
    }, []);

    return scrollProgress;
}
