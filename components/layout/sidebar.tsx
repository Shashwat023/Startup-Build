"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FolderKanban,
    Settings,
    User,
    PlusCircle,
} from "lucide-react";

const sidebarItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Projects",
        href: "/dashboard/projects",
        icon: FolderKanban,
    },
    {
        label: "New Project",
        href: "/dashboard/new",
        icon: PlusCircle,
    },
    {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
    {
        label: "Profile",
        href: "/dashboard/profile",
        icon: User,
    },
];

/**
 * Dashboard sidebar navigation with active state indicators
 */
export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-neutral-200 bg-white pt-20">
            <nav className="flex flex-col space-y-1 p-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                className={cn(
                                    "relative flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors",
                                    isActive
                                        ? "bg-primary-50 text-primary-700"
                                        : "text-neutral-700 hover:bg-neutral-100"
                                )}
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeSidebarItem"
                                        className="absolute left-0 h-full w-1 bg-primary-600 rounded-r"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}

                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
