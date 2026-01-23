"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Rocket, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

/**
 * Sticky navigation bar with gold accents and auth state
 */
export function Navbar() {
    const scrollProgress = useScrollProgress();
    const isScrolled = scrollProgress > 0.01;
    const { data: session, status } = useSession();

    return (
        <motion.header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled ? "bg-black/50 backdrop-blur-md border-b border-white/10" : "bg-transparent"
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {/* Scroll progress indicator */}
            <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#F0C37A] to-[#D4A84A]"
                style={{ width: `${scrollProgress * 100}%` }}
            />

            <nav className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#F0C37A] to-[#D4A84A] group-hover:scale-110 transition-transform">
                            <Rocket className="w-6 h-6 text-black" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-[#F0C37A] to-[#D4A84A] bg-clip-text text-transparent">
                            StartupAI
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/crew"
                            className="text-neutral-300 hover:text-[#F0C37A] transition-colors font-medium"
                        >
                            Board Panel Advisory
                        </Link>
                        <Link
                            href="/enhance"
                            className="text-neutral-300 hover:text-[#F0C37A] transition-colors font-medium"
                        >
                            Enhance Idea
                        </Link>
                        <Link
                            href="/investor"
                            className="text-neutral-300 hover:text-[#F0C37A] transition-colors font-medium"
                        >
                            Investor
                        </Link>
                        <Link
                            href="/predictor"
                            className="text-neutral-300 hover:text-[#F0C37A] transition-colors font-medium"
                        >
                            Predictor
                        </Link>
                        <Link
                            href="/rag"
                            className="text-neutral-300 hover:text-[#F0C37A] transition-colors font-medium"
                        >
                            Chatbot
                        </Link>
                        <Link
                            href="/pitcher"
                            className="text-neutral-300 hover:text-[#F0C37A] transition-colors font-medium"
                        >
                            Pitcher
                        </Link>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex items-center space-x-4">
                        {status === "loading" ? (
                            <div className="text-neutral-400 text-sm">Loading...</div>
                        ) : session ? (
                            <>
                                <div className="hidden md:flex items-center space-x-2 text-neutral-300">
                                    <span className="text-sm">Hi, {session.user?.name?.split(" ")[0]}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="md"
                                    className="text-white hover:text-[#F0C37A] hover:bg-white/10"
                                    onClick={() => signOut()}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="md" className="text-white hover:text-[#F0C37A] hover:bg-white/10">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button size="md" className="bg-[#F0C37A] hover:bg-[#E8B960] text-black border-0 font-semibold">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </motion.header>
    );
}
