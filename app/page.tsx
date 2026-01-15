import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * Landing page with dark theme and gold accents
 */
export default function HomePage() {
    return (
        <main className="min-h-screen bg-[#020617]">
            <Navbar />

            {/* Hero Section */}
            <HeroSection />

            {/* Features Section */}
            <FeaturesSection />

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Final CTA Section */}
            <section className="py-24 bg-gradient-to-br from-[#F0C37A] via-[#E8B960] to-[#D4A84A] relative overflow-hidden">
                {/* Glow effect */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(circle 600px at 50% 50%, rgba(255,255,255,0.2), transparent)`,
                    }}
                />

                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                        Ready to Build Your Startup?
                    </h2>
                    <p className="text-xl text-black/80 mb-10 max-w-2xl mx-auto">
                        Join thousands of founders who are using AI to accelerate their startup
                        journey. Get started for free today.
                    </p>
                    <Link href="/auth/signup">
                        <Button
                            size="lg"
                            className="bg-black text-[#F0C37A] hover:bg-neutral-900 group border-0 font-semibold"
                        >
                            Start Building Now
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
