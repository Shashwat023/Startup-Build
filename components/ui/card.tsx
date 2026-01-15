"use client";

import { HTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { cardHover } from "@/animations/variants";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
}

/**
 * Card component with optional hover animation
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, hoverable = false, children, ...props }, ref) => {
        const Component = hoverable ? motion.div : "div";

        return (
            <Component
                ref={ref}
                className={cn(
                    "rounded-xl border border-neutral-200 bg-white p-6 shadow-sm",
                    className
                )}
                {...(hoverable && {
                    initial: "rest",
                    whileHover: "hover",
                    variants: cardHover,
                })}
                {...props}
            >
                {children}
            </Component>
        );
    }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex flex-col space-y-1.5", className)} {...props} />
    )
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn("text-xl font-semibold leading-none tracking-tight", className)} {...props} />
    )
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-sm text-neutral-600", className)} {...props} />
    )
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("pt-4", className)} {...props} />
    )
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex items-center pt-4", className)} {...props} />
    )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
