"use client";

import { RevealOnScroll } from "@/animations/scroll-animations";
import { CheckCircle2 } from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Share Your Idea",
        description: "Describe your startup concept in plain language. Our AI understands context, market dynamics, and technical feasibility.",
    },
    {
        number: "02",
        title: "AI Analysis & Planning",
        description: "Get comprehensive analysis including SWOT, market research, competitor insights, and viability scoring within minutes.",
    },
    {
        number: "03",
        title: "Team & Resources",
        description: "Receive AI-generated team composition, role definitions, and resource allocation recommendations tailored to your startup.",
    },
    {
        number: "04",
        title: "Launch & Automate",
        description: "Access generated documents, automation workflows, and ongoing AI support to accelerate your path to market.",
    },
];

/**
 * How It Works section with gold accents
 */
export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-24 bg-neutral-950">
            <div className="container mx-auto px-6">
                <RevealOnScroll>
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                            From Idea to Launch in{" "}
                            <span className="bg-gradient-to-r from-[#F0C37A] via-[#E8B960] to-[#D4A84A] text-transparent bg-clip-text">4 Simple Steps</span>
                        </h2>
                        <p className="text-xl text-neutral-400">
                            Our AI-powered platform guides you through every stage of your startup
                            journey.
                        </p>
                    </div>
                </RevealOnScroll>

                <div className="max-w-4xl mx-auto space-y-12">
                    {steps.map((step, index) => (
                        <RevealOnScroll key={index} delay={index * 0.1}>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Step number */}
                                <div className="flex-shrink-0">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F0C37A] to-[#D4A84A] flex items-center justify-center">
                                        <span className="text-2xl font-bold text-black">{step.number}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
                                        <CheckCircle2 className="w-6 h-6 text-[#F0C37A] flex-shrink-0" />
                                    </div>
                                    <p className="text-neutral-400 text-lg">{step.description}</p>
                                </div>
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>
            </div>
        </section>
    );
}
