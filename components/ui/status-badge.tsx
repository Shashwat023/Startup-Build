"use client";

import { cn, getStatusColor } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

interface StatusBadgeProps {
    status: ProjectStatus | "success" | "pending" | "failed" | "in-progress";
    className?: string;
}

/**
 * Status badge component with color coding
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
    const statusLabels: Record<string, string> = {
        ideation: "Ideation",
        analyzing: "Analyzing",
        planning: "Planning",
        "in-progress": "In Progress",
        completed: "Completed",
        paused: "Paused",
        success: "Success",
        pending: "Pending",
        failed: "Failed",
    };

    const colorClass = getStatusColor(status);

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white",
                colorClass,
                className
            )}
        >
            {statusLabels[status] || status}
        </span>
    );
}
