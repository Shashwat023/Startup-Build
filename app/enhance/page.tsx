"use client";

import { useState, FormEvent } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
    Lightbulb,
    Loader2,
    AlertCircle,
    Target,
    Users,
    TrendingUp,
    DollarSign,
    Zap,
    CheckCircle2,
    BarChart3,
    Shield,
} from "lucide-react";

interface EnhancementResult {
    problem_statement: string;
    target_users: string;
    solution: string;
    value_proposition: string;
    key_assumptions: string[];
    feasibility_score: number;
    desirability_score: number;
    viability_score: number;
    market_type?: string;
    differentiation_strength: string;
    execution_complexity: string;
    competitors: Array<{
        name?: string;
        description?: string;
        strengths?: string;
        weaknesses?: string;
        gaps?: string;
        [key: string]: any;
    }>;
    market_size: {
        tam?: string;
        sam?: string;
        som?: string;
        TAM?: string;
        SAM?: string;
        SOM?: string;
    };
    next_best_action: string;
    validation_readiness?: string;
    revenue_streams: string[];
    key_metrics: string[];
    mvp_scope: string | { build_complexity?: string; core_features?: string[] };
    customer_acquisition_channels: string[];
    ethical_legal_sensitivity?: string;
    ethical_legal_sensitivity_level?: string;
    ethical_legal_sensitivity_explanation?: string;
    [key: string]: any;
}

export default function EnhancePage() {
    const [rawIdea, setRawIdea] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<EnhancementResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch("/api/enhance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ raw_idea: rawIdea }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Enhancement failed");
            }

            setResult(data.result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Convert score from 0-1 range to percentage
    const toPercentage = (score: number) => Math.round(score * 100);

    const getScoreColor = (score: number) => {
        const percentage = toPercentage(score);
        if (percentage >= 75) return "text-green-400";
        if (percentage >= 50) return "text-yellow-400";
        return "text-red-400";
    };

    const getScoreBgColor = (score: number) => {
        const percentage = toPercentage(score);
        if (percentage >= 75) return "bg-green-400";
        if (percentage >= 50) return "bg-yellow-400";
        return "bg-red-400";
    };

    return (
        <main className="min-h-screen bg-[#020617]">
            <Navbar />

            <div className="pt-32 pb-24 px-6">
                <div className="container mx-auto max-w-6xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F0C37A] to-[#D4A84A] mb-6">
                            <Lightbulb className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                            Startup Idea{" "}
                            <span className="bg-gradient-to-r from-[#F0C37A] via-[#E8B960] to-[#D4A84A] text-transparent bg-clip-text">
                                Enhancement
                            </span>
                        </h1>
                        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                            Transform your raw startup idea into a comprehensive, validated concept with AI-powered analysis.
                        </p>
                    </motion.div>

                    {/* Input Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-8">
                            <CardHeader>
                                <CardTitle className="text-2xl text-white">Describe Your Startup Idea</CardTitle>
                                <CardDescription className="text-neutral-400">
                                    Share your raw idea, and our AI will enhance it with detailed analysis
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <textarea
                                            required
                                            value={rawIdea}
                                            onChange={(e) => setRawIdea(e.target.value)}
                                            rows={6}
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all resize-none"
                                            placeholder="Example: A mobile app that connects local farmers directly with consumers, eliminating middlemen and ensuring fresh produce delivery within 24 hours..."
                                        />
                                        <p className="text-sm text-neutral-500 mt-2">
                                            {rawIdea.length} characters
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading || rawIdea.trim().length === 0}
                                        className="w-full bg-gradient-to-r from-[#F0C37A] to-[#D4A84A] hover:from-[#E8B960] hover:to-[#C99A3A] text-black font-semibold text-lg h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Enhancing Your Idea...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-5 h-5 mr-2" />
                                                Enhance Idea
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Results */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-8"
                        >
                            {/* Overview Section */}
                            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-white flex items-center">
                                        <Target className="w-6 h-6 mr-2 text-[#F0C37A]" />
                                        Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#F0C37A] mb-2">Problem Statement</h3>
                                        <p className="text-neutral-300">{result.problem_statement}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#F0C37A] mb-2">Target Users</h3>
                                        <p className="text-neutral-300">{result.target_users}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#F0C37A] mb-2">Solution</h3>
                                        <p className="text-neutral-300">{result.solution}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#F0C37A] mb-2">Value Proposition</h3>
                                        <p className="text-neutral-300">{result.value_proposition}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Scores Dashboard */}
                            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-white flex items-center">
                                        <BarChart3 className="w-6 h-6 mr-2 text-[#F0C37A]" />
                                        Viability Scores
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Feasibility */}
                                        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                                            <p className="text-sm text-neutral-400 mb-2">Feasibility</p>
                                            <p className={`text-4xl font-bold mb-4 ${getScoreColor(result.feasibility_score)}`}>
                                                {toPercentage(result.feasibility_score)}%
                                            </p>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${toPercentage(result.feasibility_score)}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`h-full ${getScoreBgColor(result.feasibility_score)} rounded-full`}
                                                />
                                            </div>
                                        </div>

                                        {/* Desirability */}
                                        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                                            <p className="text-sm text-neutral-400 mb-2">Desirability</p>
                                            <p className={`text-4xl font-bold mb-4 ${getScoreColor(result.desirability_score)}`}>
                                                {toPercentage(result.desirability_score)}%
                                            </p>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${toPercentage(result.desirability_score)}%` }}
                                                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                                    className={`h-full ${getScoreBgColor(result.desirability_score)} rounded-full`}
                                                />
                                            </div>
                                        </div>

                                        {/* Viability */}
                                        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                                            <p className="text-sm text-neutral-400 mb-2">Viability</p>
                                            <p className={`text-4xl font-bold mb-4 ${getScoreColor(result.viability_score)}`}>
                                                {toPercentage(result.viability_score)}%
                                            </p>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${toPercentage(result.viability_score)}%` }}
                                                    transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                                                    className={`h-full ${getScoreBgColor(result.viability_score)} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Market Analysis */}
                            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-white flex items-center">
                                        <TrendingUp className="w-6 h-6 mr-2 text-[#F0C37A]" />
                                        Market Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-sm font-semibold text-neutral-400 mb-2">Market Type</h3>
                                            <p className="text-lg text-white">{result.market_type}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-neutral-400 mb-2">Differentiation Strength</h3>
                                            <p className="text-lg text-white">{result.differentiation_strength}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-neutral-400 mb-2">Execution Complexity</h3>
                                            <p className="text-lg text-white">{result.execution_complexity}</p>
                                        </div>
                                    </div>

                                    {/* Market Size */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#F0C37A] mb-4">Market Size</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                <p className="text-sm text-neutral-400 mb-1">TAM</p>
                                                <p className="text-xl font-bold text-white">{result.market_size.TAM || result.market_size.tam || "N/A"}</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                <p className="text-sm text-neutral-400 mb-1">SAM</p>
                                                <p className="text-xl font-bold text-white">{result.market_size.SAM || result.market_size.sam || "N/A"}</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                <p className="text-sm text-neutral-400 mb-1">SOM</p>
                                                <p className="text-xl font-bold text-white">{result.market_size.SOM || result.market_size.som || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Competitors */}
                            {result.competitors && result.competitors.length > 0 && (
                                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-2xl text-white flex items-center">
                                            <Users className="w-6 h-6 mr-2 text-[#F0C37A]" />
                                            Competitors
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {result.competitors.map((competitor, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3"
                                                >
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {competitor.name || `Competitor ${index + 1}`}
                                                    </h3>

                                                    {competitor.strengths && (
                                                        <div>
                                                            <p className="text-sm font-semibold text-green-400 mb-1">Strengths</p>
                                                            <p className="text-sm text-neutral-300">{competitor.strengths}</p>
                                                        </div>
                                                    )}

                                                    {competitor.weaknesses && (
                                                        <div>
                                                            <p className="text-sm font-semibold text-red-400 mb-1">Weaknesses</p>
                                                            <p className="text-sm text-neutral-300">{competitor.weaknesses}</p>
                                                        </div>
                                                    )}

                                                    {competitor.gaps && (
                                                        <div>
                                                            <p className="text-sm font-semibold text-yellow-400 mb-1">Market Gaps</p>
                                                            <p className="text-sm text-neutral-300">{competitor.gaps}</p>
                                                        </div>
                                                    )}

                                                    {competitor.description && !competitor.strengths && !competitor.weaknesses && (
                                                        <p className="text-sm text-neutral-300">{competitor.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Strategic Insights */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Key Assumptions */}
                                {result.key_assumptions && result.key_assumptions.length > 0 && (
                                    <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                        <CardHeader>
                                            <CardTitle className="text-xl text-white flex items-center">
                                                <CheckCircle2 className="w-5 h-5 mr-2 text-[#F0C37A]" />
                                                Key Assumptions
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {result.key_assumptions.map((assumption, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="text-[#F0C37A] mr-2">•</span>
                                                        <span className="text-neutral-300">{assumption}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Revenue Streams */}
                                {result.revenue_streams && result.revenue_streams.length > 0 && (
                                    <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                        <CardHeader>
                                            <CardTitle className="text-xl text-white flex items-center">
                                                <DollarSign className="w-5 h-5 mr-2 text-[#F0C37A]" />
                                                Revenue Streams
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {result.revenue_streams.map((stream, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="text-[#F0C37A] mr-2">•</span>
                                                        <span className="text-neutral-300">{stream}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Key Metrics */}
                                {result.key_metrics && result.key_metrics.length > 0 && (
                                    <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                        <CardHeader>
                                            <CardTitle className="text-xl text-white flex items-center">
                                                <BarChart3 className="w-5 h-5 mr-2 text-[#F0C37A]" />
                                                Key Metrics
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {result.key_metrics.map((metric, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="text-[#F0C37A] mr-2">•</span>
                                                        <span className="text-neutral-300">{metric}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Customer Acquisition Channels */}
                                {result.customer_acquisition_channels && result.customer_acquisition_channels.length > 0 && (
                                    <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                        <CardHeader>
                                            <CardTitle className="text-xl text-white flex items-center">
                                                <Users className="w-5 h-5 mr-2 text-[#F0C37A]" />
                                                Acquisition Channels
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {result.customer_acquisition_channels.map((channel, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="text-[#F0C37A] mr-2">•</span>
                                                        <span className="text-neutral-300">{channel}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Next Steps */}
                            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-white flex items-center">
                                        <Zap className="w-6 h-6 mr-2 text-[#F0C37A]" />
                                        Next Steps
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* MVP Scope */}
                                    <div className="p-6 rounded-lg bg-gradient-to-br from-[#F0C37A]/10 to-[#D4A84A]/5 border border-[#F0C37A]/20">
                                        <h3 className="text-lg font-semibold text-[#F0C37A] mb-4 flex items-center">
                                            <Target className="w-5 h-5 mr-2" />
                                            MVP Scope
                                        </h3>
                                        {typeof result.mvp_scope === 'string' ? (
                                            <p className="text-neutral-300 leading-relaxed">{result.mvp_scope}</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {result.mvp_scope.build_complexity && (
                                                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                        <p className="text-sm font-semibold text-neutral-400 mb-2">Build Complexity</p>
                                                        <p className="text-white font-medium">{result.mvp_scope.build_complexity}</p>
                                                    </div>
                                                )}
                                                {result.mvp_scope.core_features && result.mvp_scope.core_features.length > 0 && (
                                                    <div>
                                                        <p className="text-sm font-semibold text-neutral-400 mb-3">Core Features</p>
                                                        <div className="grid gap-2">
                                                            {result.mvp_scope.core_features.map((feature, index) => (
                                                                <div key={index} className="flex items-start p-3 rounded-lg bg-white/5 border border-white/10">
                                                                    <CheckCircle2 className="w-4 h-4 text-[#F0C37A] mr-3 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-neutral-300">{feature}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Next Best Action */}
                                    <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                                        <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                                            <Zap className="w-5 h-5 mr-2" />
                                            Next Best Action
                                        </h3>
                                        <p className="text-neutral-300 leading-relaxed">{result.next_best_action}</p>
                                    </div>

                                    {/* Validation & Ethics Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                                            <h3 className="text-sm font-semibold text-neutral-400 mb-3">Validation Readiness</h3>
                                            <p className="text-2xl font-bold text-white">{result.validation_readiness || "N/A"}</p>
                                        </div>
                                        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                                            <h3 className="text-sm font-semibold text-neutral-400 mb-3">Ethical/Legal Sensitivity</h3>
                                            <p className="text-2xl font-bold text-white">
                                                {result.ethical_legal_sensitivity ||
                                                    result.ethical_legal_sensitivity_level ||
                                                    "N/A"}
                                            </p>
                                            {result.ethical_legal_sensitivity_explanation && (
                                                <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
                                                    {result.ethical_legal_sensitivity_explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start space-x-4">
                                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-400 font-semibold mb-1">Enhancement Failed</p>
                                    <p className="text-red-300/80">{error}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
