"use client";

import { Brain, Zap, Users, FileText, TrendingUp, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RevealOnScroll } from "@/animations/scroll-animations";
import { StaggerChildren } from "@/animations/scroll-animations";
import { motion } from "framer-motion";
import { staggerItem } from "@/animations/variants";
import Link from "next/link";

const features = [
    {
        icon: Brain,
        title: "AI Idea Analysis",
        description: "Get instant, comprehensive analysis of your startup idea with SWOT, market fit scoring, and actionable recommendations.",
    },
    {
        icon: Users,
        title: "Board Panel Advisory",
        description: "Strategic insights from AI board advisors analyzing your startup across marketing, tech, operations, competition, and finance.",
        link: "/crew",
    },
    {
        icon: TrendingUp,
        title: "Market Insights",
        description: "Real-time market analysis, competitor tracking, and trend identification powered by ML algorithms.",
    },
    {
        icon: FileText,
        title: "Document Generation",
        description: "Automatically create business plans, pitch decks, technical specs, and financial models.",
    },
    {
        icon: Zap,
        title: "Automation Workflows",
        description: "Streamline repetitive tasks with intelligent automation that learns from your preferences.",
    },
    {
        icon: Target,
        title: "Success Prediction",
        description: "AI-powered predictions about your startup's future using advanced machine learning models trained on real startup data.",
        link: "/predictor",
    },
];

/**
 * Features section with gold accents
 */
export function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-[#020617] relative">
            {/* Subtle glow effect */}
            <div
                className="absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: `radial-gradient(circle 400px at 50% 50%, rgba(240,195,122,0.15), transparent)`,
                }}
            />

            <div className="container mx-auto px-6 relative z-10">
                <RevealOnScroll>
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                            Everything You Need to{" "}
                            <span className="bg-gradient-to-r from-[#F0C37A] via-[#E8B960] to-[#D4A84A] text-transparent bg-clip-text">Launch Faster</span>
                        </h2>
                        <p className="text-xl text-neutral-400">
                            Powerful AI tools that handle the heavy lifting, so you can focus on
                            building your vision.
                        </p>
                    </div>
                </RevealOnScroll>

                <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        const hasLink = feature.link;

                        const cardContent = (
                            <motion.div key={index} variants={staggerItem}>
                                <Card className={`h-full bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all ${hasLink ? 'cursor-pointer' : ''}`}>
                                    <CardContent className="pt-6">
                                        {/* Icon */}
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F0C37A] to-[#D4A84A] flex items-center justify-center mb-4">
                                            <Icon className="w-7 h-7 text-black" />
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                                        <p className="text-neutral-400">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );

                        return hasLink ? (
                            <Link key={index} href={feature.link}>
                                {cardContent}
                            </Link>
                        ) : (
                            cardContent
                        );
                    })}
                </StaggerChildren>
            </div>
        </section>
    );
}
