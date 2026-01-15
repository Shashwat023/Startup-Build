import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

/**
 * Format a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(dateString);
}

/**
 * Get status color for badges
 */
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        ideation: "bg-neutral-500",
        analyzing: "bg-primary-500",
        planning: "bg-secondary-500",
        "in-progress": "bg-accent-500",
        completed: "bg-green-500",
        paused: "bg-yellow-500",
        success: "bg-green-500",
        pending: "bg-yellow-500",
        failed: "bg-red-500",
    };

    return colors[status] || "bg-neutral-500";
}

/**
 * Truncate text to a specified length
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + "...";
}

/**
 * Generate a random ID (for mock data)
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}
