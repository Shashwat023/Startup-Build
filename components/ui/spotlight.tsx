"use client";

import { cn } from "@/lib/utils";

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  return (
    <svg
      className={cn(
        "animate-pulse absolute pointer-events-none",
        className
      )}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={fill} stopOpacity="0.8" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="200" fill="url(#gradient)" />
    </svg>
  );
}
