"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

/**
 * Hero section with radial glow background - Gold theme
 */
export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617]">
            {/* Radial Glow Background - Gold */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `radial-gradient(circle 500px at 50% 100px, rgba(240,195,122,0.25), transparent)`,
                }}
            />

            {/* Content overlay */}
            <div className="relative z-10 container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg border border-white/10"
                    >
                        <Sparkles className="w-4 h-4 text-[#F0C37A]" />
                        <span className="text-sm font-medium text-white">
                            AI-Powered Startup Orchestration
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white"
                    >
                        Transform Your{" "}
                        <span className="bg-gradient-to-r from-[#F0C37A] via-[#E8B960] to-[#D4A84A] text-transparent bg-clip-text">Startup Idea</span>
                        <br />
                        Into Reality
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-xl md:text-2xl text-neutral-300 mb-10 max-w-2xl mx-auto"
                    >
                        From ideation to launch, our AI analyzes your idea, builds your team,
                        and automates your startup journey.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/auth/signup">
                            <Button size="lg" className="group bg-[#F0C37A] hover:bg-[#E8B960] text-black border-0 font-semibold">
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="#features">
                            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                Learn More
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                    >
                        {[
                            { value: "10K+", label: "Startups Launched" },
                            { value: "95%", label: "Success Rate" },
                            { value: "24/7", label: "AI Support" },
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl font-bold bg-gradient-to-r from-[#F0C37A] via-[#E8B960] to-[#D4A84A] text-transparent bg-clip-text">{stat.value}</div>
                                <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
                >
                    <motion.div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                </motion.div>
            </motion.div>
        </section>
    );
}
