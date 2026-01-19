"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
    Send,
    Loader2,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    Mail,
} from "lucide-react";

interface FormData {
    startup_name: string;
    problem: string;
    solution: string;
    target_market: string;
    traction: string;
    revenue_model: string;
    funding_stage_and_ask: string;
    founder_background: string;
    contact_email: string;
}

export default function InvestorPage() {
    const [formData, setFormData] = useState<FormData>({
        startup_name: "",
        problem: "",
        solution: "",
        target_market: "",
        traction: "",
        revenue_model: "",
        funding_stage_and_ask: "",
        founder_background: "",
        contact_email: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const isEmailValid = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isFormValid = (): boolean => {
        return (
            Object.values(formData).every((value) => value.trim() !== "") &&
            isEmailValid(formData.contact_email)
        );
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!isFormValid()) {
            setError("Please fill in all fields with valid information.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                process.env.NEXT_PUBLIC_N8N_URL || "",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to submit your startup details. Please try again.");
            }

            setSuccess(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            startup_name: "",
            problem: "",
            solution: "",
            target_market: "",
            traction: "",
            revenue_model: "",
            funding_stage_and_ask: "",
            founder_background: "",
            contact_email: "",
        });
        setSuccess(false);
        setError(null);
    };

    return (
        <main className="min-h-screen bg-[#020617]">
            <Navbar />

            <div className="pt-32 pb-24 px-6">
                <div className="container mx-auto max-w-4xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F0C37A] to-[#D4A84A] mb-6">
                            <TrendingUp className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                            Connect with{" "}
                            <span className="bg-gradient-to-r from-[#F0C37A] via-[#E8B960] to-[#D4A84A] text-transparent bg-clip-text">
                                Investors
                            </span>
                        </h1>
                        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                            Share your startup details and we'll connect you with relevant investors who can help bring your vision to life.
                        </p>
                    </motion.div>

                    {/* Success State */}
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                <CardContent className="pt-12 pb-12 text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-4">
                                        Congrats! 🎉
                                    </h2>
                                    <p className="text-xl text-neutral-300 mb-8">
                                        Your startup idea has been sent to relevant investors.
                                    </p>
                                    <p className="text-neutral-400 mb-8">
                                        Our team will review your submission and connect you with suitable investors. You'll hear from us soon at{" "}
                                        <span className="text-[#F0C37A] font-medium">{formData.contact_email}</span>
                                    </p>
                                    <Button
                                        onClick={resetForm}
                                        className="bg-gradient-to-r from-[#F0C37A] to-[#D4A84A] hover:from-[#E8B960] hover:to-[#C99A3A] text-black font-semibold"
                                    >
                                        Submit Another Startup
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-white">Startup Details</CardTitle>
                                    <CardDescription className="text-neutral-400">
                                        Fill in the details below to connect with investors
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Startup Name */}
                                        <div>
                                            <label htmlFor="startup_name" className="block text-sm font-medium text-neutral-300 mb-2">
                                                Startup Name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="startup_name"
                                                name="startup_name"
                                                required
                                                value={formData.startup_name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all"
                                                placeholder="e.g., FreshFarm Connect"
                                            />
                                        </div>

                                        {/* Problem */}
                                        <div>
                                            <label htmlFor="problem" className="block text-sm font-medium text-neutral-300 mb-2">
                                                Problem <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                id="problem"
                                                name="problem"
                                                required
                                                value={formData.problem}
                                                onChange={handleChange}
                                                rows={4}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all resize-none"
                                                placeholder="What problem are you solving?"
                                            />
                                            <p className="text-sm text-neutral-500 mt-2">
                                                {formData.problem.length} characters
                                            </p>
                                        </div>

                                        {/* Solution */}
                                        <div>
                                            <label htmlFor="solution" className="block text-sm font-medium text-neutral-300 mb-2">
                                                Solution <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                id="solution"
                                                name="solution"
                                                required
                                                value={formData.solution}
                                                onChange={handleChange}
                                                rows={4}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all resize-none"
                                                placeholder="How does your startup solve this problem?"
                                            />
                                            <p className="text-sm text-neutral-500 mt-2">
                                                {formData.solution.length} characters
                                            </p>
                                        </div>

                                        {/* Target Market */}
                                        <div>
                                            <label htmlFor="target_market" className="block text-sm font-medium text-neutral-300 mb-2">
                                                Target Market <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                id="target_market"
                                                name="target_market"
                                                required
                                                value={formData.target_market}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all resize-none"
                                                placeholder="Who are your target customers?"
                                            />
                                            <p className="text-sm text-neutral-500 mt-2">
                                                {formData.target_market.length} characters
                                            </p>
                                        </div>

                                        {/* Traction */}
                                        <div>
                                            <label htmlFor="traction" className="block text-sm font-medium text-neutral-300 mb-2">
                                                Traction <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                id="traction"
                                                name="traction"
                                                required
                                                value={formData.traction}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all resize-none"
                                                placeholder="What traction have you achieved? (users, revenue, partnerships, etc.)"
                                            />
                                            <p className="text-sm text-neutral-500 mt-2">
                                                {formData.traction.length} characters
                                            </p>
                                        </div>

                                        {/* Revenue Model */}
                                        <div>
                                            <label htmlFor="revenue_model" className="block text-sm font-medium text-neutral-300 mb-2">
                                                Revenue Model <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                id="revenue_model"
                                                name="revenue_model"
                                                required
                                                value={formData.revenue_model}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all resize-none"
                                                placeholder="How do you make money?"
                                            />
                                            <p className="text-sm text-neutral-500 mt-2">
                                                {formData.revenue_model.length} characters
                                            </p>
                                        </div>

                                        {/* Funding Stage & Ask */}
                                        <div>
                                            <label htmlFor="funding_stage_and_ask" className="block text-sm font-medium text-neutral-300 mb-2">
                                                Funding Stage & Ask <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="funding_stage_and_ask"
                                                name="funding_stage_and_ask"
                                                required
                                                value={formData.funding_stage_and_ask}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all"
                                                placeholder="e.g., Seed round, raising $500K"
                                            />
                                        </div>

                                        {/* Founder Background */}
                                        <div>
                                            <label htmlFor="founder_background" className="block text-sm font-medium text-neutral-300 mb-2">
                                                Founder Background <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                id="founder_background"
                                                name="founder_background"
                                                required
                                                value={formData.founder_background}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all resize-none"
                                                placeholder="Tell us about your background and expertise"
                                            />
                                            <p className="text-sm text-neutral-500 mt-2">
                                                {formData.founder_background.length} characters
                                            </p>
                                        </div>

                                        {/* Contact Email */}
                                        <div>
                                            <label htmlFor="contact_email" className="block text-sm font-medium text-neutral-300 mb-2">
                                                Contact Email <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                                <input
                                                    type="email"
                                                    id="contact_email"
                                                    name="contact_email"
                                                    required
                                                    value={formData.contact_email}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all"
                                                    placeholder="founder@startup.com"
                                                />
                                            </div>
                                            {formData.contact_email && !isEmailValid(formData.contact_email) && (
                                                <p className="text-sm text-red-400 mt-2">
                                                    Please enter a valid email address
                                                </p>
                                            )}
                                        </div>

                                        {/* Error Message */}
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start space-x-3"
                                            >
                                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                                <p className="text-red-300 text-sm">{error}</p>
                                            </motion.div>
                                        )}

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            disabled={loading || !isFormValid()}
                                            className="w-full bg-gradient-to-r from-[#F0C37A] to-[#D4A84A] hover:from-[#E8B960] hover:to-[#C99A3A] text-black font-semibold text-lg h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" />
                                                    Connect with Investors
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
