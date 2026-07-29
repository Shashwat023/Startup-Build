"use client";

import { useInView as useFramerInView } from "framer-motion";
import { useRef, RefObject } from "react";

type FramerInViewOptions = NonNullable<Parameters<typeof useFramerInView>[1]>;

interface UseInViewOptions {
    once?: boolean;
    margin?: FramerInViewOptions["margin"];
    amount?: "some" | "all" | number;
}

/**
 * Custom hook wrapper around Framer Motion's useInView
 * Provides consistent animation trigger behavior across the app
 */
export function useInView(options: UseInViewOptions = {}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useFramerInView(ref, {
        once: options.once ?? true,
        margin: options.margin ?? "-100px",
        amount: options.amount ?? 0.3,
    });

    return { ref, isInView };
}
