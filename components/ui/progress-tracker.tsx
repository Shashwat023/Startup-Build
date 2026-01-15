"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Section {
    id: string;
    label: string;
}

interface ProgressTrackerProps {
    sections: Section[];
    className?: string;
}

/**
 * Sticky progress tracker that highlights the current section based on scroll position
 * Used in the project detail page
 */
export function ProgressTracker({ sections, className }: ProgressTrackerProps) {
    const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "");

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200; // Offset for better UX

            // Find which section is currently in view
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = document.getElementById(sections[i].id);
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i].id);
                    break;
                }
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => window.removeEventListener("scroll", handleScroll);
    }, [sections]);

    const scrollToSection = (sectionId: string) => {
        const section = document.getElementById(sectionId);
        if (section) {
            const offset = 100; // Offset from top
            const elementPosition = section.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <nav className={cn("sticky top-24 space-y-2", className)}>
            {sections.map((section) => {
                const isActive = activeSection === section.id;

                return (
                    <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                            "relative flex w-full items-center py-2 pl-4 text-left text-sm transition-colors",
                            isActive ? "text-primary-600 font-medium" : "text-neutral-600 hover:text-neutral-900"
                        )}
                    >
                        {/* Active indicator line */}
                        {isActive && (
                            <motion.div
                                layoutId="activeSection"
                                className="absolute left-0 h-full w-1 bg-primary-600 rounded-r"
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                        )}

                        <span className="ml-3">{section.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
