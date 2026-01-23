"use client";

import { useState, FormEvent } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
    Sparkles,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ThumbsUp,
    ThumbsDown,
    RefreshCw,
    Rocket,
} from "lucide-react";

type WorkflowStatus = "input" | "generating" | "review" | "approved" | "error";

interface Critique {
    scores?: {
        clarity?: number;
        problem?: number;
        solution?: number;
        uniqueness?: number;
        traction?: number;
        engagement?: number;
    };
    overall_score?: number;
    decision?: string;
    feedback?: string;
    strengths?: string[];
    weaknesses?: string[];
}

interface FinalPitchPackage {
    elevator_pitch?: string;
    executive_summary?: string;
    problem_statement?: string;
    solution?: string;
    unique_value_proposition?: string;
    traction_metrics?: any;
    market_opportunity?: any;
    business_model?: any;
    competitive_advantage?: string[];
    team_highlights?: string;
    funding_ask?: any;
    key_talking_points?: string[];
    anticipated_questions?: Array<{ question: string; answer: string }>;
    delivery_tips?: any;
}

export default function PitcherPage() {
    const [mvpDescription, setMvpDescription] = useState("");
    const [status, setStatus] = useState<WorkflowStatus>("input");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentPitch, setCurrentPitch] = useState("");
    const [critique, setCritique] = useState<Critique | null>(null);
    const [iteration, setIteration] = useState(0);
    const [finalPitch, setFinalPitch] = useState<FinalPitchPackage | null>(null);
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleStartWorkflow = async (e: FormEvent) => {
        e.preventDefault();

        if (!mvpDescription.trim()) {
            setError("Please provide an MVP description");
            return;
        }

        setLoading(true);
        setStatus("generating");
        setError(null);

        try {
            const response = await fetch("/api/pitcher/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mvp_description: mvpDescription }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to start pitch workflow");
            }

            setSessionId(data.session_id);
            setCurrentPitch(data.pitch);
            setCritique(data.critique);
            setIteration(data.iteration_count || 0);
            setStatus("review");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!sessionId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/pitcher/approve/${sessionId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ approved: true, feedback }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to approve pitch");
            }

            // Approved successfully - get final pitch
            if (data.status === "completed" && data.final_pitch_package) {
                setFinalPitch(data.final_pitch_package);
                setStatus("approved");

                // Clean up session
                try {
                    await fetch(`/api/pitcher/session/${sessionId}`, {
                        method: "DELETE",
                    });
                } catch (cleanupErr) {
                    console.error("Failed to cleanup session:", cleanupErr);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!sessionId) return;

        if (!feedback.trim()) {
            setError("Please provide feedback for improvement");
            return;
        }

        setLoading(true);
        setError(null);
        setStatus("generating");

        try {
            const response = await fetch(`/api/pitcher/approve/${sessionId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ approved: false, feedback }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to refine pitch");
            }

            // Updated pitch received
            setCurrentPitch(data.pitch);
            setCritique(data.critique);
            setIteration(data.iteration_count || 0);
            setFeedback(""); // Clear feedback for next iteration
            setStatus("review");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setMvpDescription("");
        setStatus("input");
        setSessionId(null);
        setCurrentPitch("");
        setCritique(null);
        setIteration(0);
        setFinalPitch(null);
        setFeedback("");
        setError(null);
    };

    return (
        <main className="min-h-screen bg-[#020617]">
            <Navbar />

            <div className="pt-32 pb-24 px-6">
                <div className="container mx-auto max-w-5xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F0C37A] to-[#D4A84A] mb-6">
                            <Sparkles className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                            Pitch{" "}
                            <span className="bg-gradient-to-r from-[#F0C37A] via-[#E8B960] to-[#D4A84A] text-transparent bg-clip-text">
                                Generator
                            </span>
                        </h1>
                        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                            Generate and refine your startup pitch with AI-powered iteration.
                            Human-in-the-loop approval ensures your pitch is perfect.
                        </p>
                    </motion.div>

                    {/* MVP Input State */}
                    {status === "input" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-white">Describe Your MVP</CardTitle>
                                    <CardDescription className="text-neutral-400">
                                        Tell us about your product. What problem does it solve? Who is it for?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleStartWorkflow} className="space-y-6">
                                        <div>
                                            <label htmlFor="mvp" className="block text-sm font-medium text-neutral-300 mb-2">
                                                MVP Overview <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                id="mvp"
                                                required
                                                value={mvpDescription}
                                                onChange={(e) => setMvpDescription(e.target.value)}
                                                rows={8}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all resize-none"
                                                placeholder="Example: We built a Chrome extension that automatically summarizes lengthy academic papers using AI. Users install the extension, navigate to any PDF research paper, and click our icon. Within seconds, they get a structured summary with key findings, methodology, and conclusions. Currently used by 2,000 graduate students across 15 universities."
                                            />
                                            <p className="text-sm text-neutral-500 mt-2">
                                                {mvpDescription.length} characters
                                            </p>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading || !mvpDescription.trim()}
                                            className="w-full bg-gradient-to-r from-[#F0C37A] to-[#D4A84A] hover:from-[#E8B960] hover:to-[#C99A3A] text-black font-semibold text-lg h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Rocket className="w-5 h-5 mr-2" />
                                            Generate Pitch
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Generating State */}
                    {status === "generating" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                <CardContent className="pt-12 pb-12 text-center">
                                    <Loader2 className="w-16 h-16 text-[#F0C37A] animate-spin mx-auto mb-6" />
                                    <h2 className="text-2xl font-bold text-white mb-3">
                                        Crafting Your Pitch...
                                    </h2>
                                    <p className="text-neutral-400">
                                        AI is analyzing your MVP and generating a compelling pitch
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Review State */}
                    {status === "review" && currentPitch && (
                        <div className="space-y-6">
                            {/* Iteration Counter */}
                            {iteration > 0 && (
                                <div className="flex items-center justify-center space-x-2 text-neutral-400">
                                    <RefreshCw className="w-4 h-4" />
                                    <span className="text-sm">Iteration {iteration}</span>
                                </div>
                            )}

                            {/* Pitch Display */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-2xl text-white">Generated Pitch</CardTitle>
                                        <CardDescription className="text-neutral-400">
                                            AI-crafted pitch for your startup
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose prose-invert max-w-none space-y-4">
                                            {currentPitch.split('\n\n').map((paragraph, idx) => (
                                                <p key={idx} className="text-neutral-200 text-base leading-relaxed">
                                                    {paragraph.trim()}
                                                </p>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Critique Display */}
                            {critique && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                >
                                    <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                        <CardHeader>
                                            <CardTitle className="text-2xl text-white">AI Critique</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Overall Score */}
                                            {critique.overall_score !== undefined && (
                                                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                                                    <span className="text-neutral-300">Overall Score</span>
                                                    <span className="text-3xl font-bold bg-gradient-to-r from-[#F0C37A] to-[#D4A84A] text-transparent bg-clip-text">
                                                        {critique.overall_score.toFixed(1)}/10
                                                    </span>
                                                </div>
                                            )}

                                            {/* Scores Grid */}
                                            {critique.scores && Object.keys(critique.scores).length > 0 && (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {Object.entries(critique.scores).map(([key, value]) => (
                                                        <div key={key} className="p-3 rounded-lg bg-white/5">
                                                            <div className="text-xs text-neutral-400 capitalize mb-1">
                                                                {key}
                                                            </div>
                                                            <div className="text-xl font-semibold text-[#F0C37A]">
                                                                {value}/10
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Feedback */}
                                            {critique.feedback && (
                                                <div className="p-4 rounded-lg bg-white/5">
                                                    <h4 className="text-sm font-medium text-neutral-300 mb-2">Feedback</h4>
                                                    <p className="text-neutral-400 text-sm leading-relaxed">
                                                        {critique.feedback}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Strengths & Weaknesses */}
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {critique.strengths && critique.strengths.length > 0 && (
                                                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                                        <h4 className="text-sm font-medium text-green-400 mb-3">Strengths</h4>
                                                        <ul className="space-y-2">
                                                            {critique.strengths.map((strength, idx) => (
                                                                <li key={idx} className="text-sm text-neutral-300 flex items-start">
                                                                    <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                                                                    {strength}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {critique.weaknesses && critique.weaknesses.length > 0 && (
                                                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                                        <h4 className="text-sm font-medium text-red-400 mb-3">Weaknesses</h4>
                                                        <ul className="space-y-2">
                                                            {critique.weaknesses.map((weakness, idx) => (
                                                                <li key={idx} className="text-sm text-neutral-300 flex items-start">
                                                                    <AlertCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                                                                    {weakness}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Decision Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-2xl text-white">Your Decision</CardTitle>
                                        <CardDescription className="text-neutral-400">
                                            Approve this pitch or request improvements
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Feedback Textarea */}
                                        <div>
                                            <label htmlFor="feedback" className="block text-sm font-medium text-neutral-300 mb-2">
                                                Feedback (optional for approve, required for reject)
                                            </label>
                                            <textarea
                                                id="feedback"
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                rows={4}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all resize-none"
                                                placeholder="e.g., Add more details about the market size and competitive advantage"
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Button
                                                onClick={handleReject}
                                                disabled={loading}
                                                variant="outline"
                                                className="h-14 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/70"
                                            >
                                                <ThumbsDown className="w-5 h-5 mr-2" />
                                                Reject & Improve
                                            </Button>
                                            <Button
                                                onClick={handleApprove}
                                                disabled={loading}
                                                className="h-14 bg-gradient-to-r from-[#F0C37A] to-[#D4A84A] hover:from-[#E8B960] hover:to-[#C99A3A] text-black font-semibold"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ThumbsUp className="w-5 h-5 mr-2" />
                                                        Approve Pitch
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    )}

                    {/* Approved State */}
                    {status === "approved" && finalPitch && (
                        <div className="space-y-6">
                            {/* Success Banner */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className="bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 border-2 border-green-400/50 shadow-2xl shadow-green-500/20">
                                    <CardContent className="pt-12 pb-12 text-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-6 shadow-lg shadow-green-500/50"
                                        >
                                            <CheckCircle2 className="w-14 h-14 text-white" />
                                        </motion.div>
                                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 text-transparent bg-clip-text mb-4">
                                            Pitch Approved! 🎉
                                        </h2>
                                        <p className="text-xl text-neutral-200 font-medium mb-2">
                                            Congratulations! Your final pitch package is ready
                                        </p>
                                        <p className="text-neutral-400">
                                            Scroll down to see your comprehensive pitch deck
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Final Pitch Package */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-2xl text-white">Final Pitch Package</CardTitle>
                                        <CardDescription className="text-neutral-400">
                                            Complete pitch with all essential components
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        {/* Elevator Pitch */}
                                        {finalPitch.elevator_pitch && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-[#F0C37A] mb-3">Elevator Pitch</h3>
                                                <p className="text-neutral-200 text-base leading-relaxed">
                                                    {finalPitch.elevator_pitch}
                                                </p>
                                            </div>
                                        )}

                                        {/* Executive Summary */}
                                        {finalPitch.executive_summary && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-[#F0C37A] mb-3">Executive Summary</h3>
                                                <p className="text-neutral-200 text-base leading-relaxed whitespace-pre-wrap">
                                                    {finalPitch.executive_summary}
                                                </p>
                                            </div>
                                        )}

                                        {/* Problem & Solution */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {finalPitch.problem_statement && (
                                                <div className="p-4 rounded-lg bg-white/5">
                                                    <h3 className="text-lg font-semibold text-[#F0C37A] mb-3">Problem</h3>
                                                    <p className="text-neutral-200 text-sm leading-relaxed">
                                                        {finalPitch.problem_statement}
                                                    </p>
                                                </div>
                                            )}

                                            {finalPitch.solution && (
                                                <div className="p-4 rounded-lg bg-white/5">
                                                    <h3 className="text-lg font-semibold text-[#F0C37A] mb-3">Solution</h3>
                                                    <p className="text-neutral-200 text-sm leading-relaxed">
                                                        {finalPitch.solution}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Unique Value Proposition */}
                                        {finalPitch.unique_value_proposition && (
                                            <div className="p-4 rounded-lg bg-gradient-to-br from-[#F0C37A]/10 to-[#D4A84A]/10 border border-[#F0C37A]/20">
                                                <h3 className="text-lg font-semibold text-[#F0C37A] mb-3">Unique Value Proposition</h3>
                                                <p className="text-neutral-200 text-base leading-relaxed">
                                                    {finalPitch.unique_value_proposition}
                                                </p>
                                            </div>
                                        )}

                                        {/* Competitive Advantage */}
                                        {finalPitch.competitive_advantage && finalPitch.competitive_advantage.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-[#F0C37A] mb-3">Competitive Advantages</h3>
                                                <ul className="space-y-2">
                                                    {finalPitch.competitive_advantage.map((advantage, idx) => (
                                                        <li key={idx} className="flex items-start text-neutral-200">
                                                            <CheckCircle2 className="w-5 h-5 text-[#F0C37A] mr-3 mt-0.5 flex-shrink-0" />
                                                            <span>{advantage}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Key Talking Points */}
                                        {finalPitch.key_talking_points && finalPitch.key_talking_points.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-[#F0C37A] mb-3">Key Talking Points</h3>
                                                <ul className="space-y-2">
                                                    {finalPitch.key_talking_points.map((point, idx) => (
                                                        <li key={idx} className="flex items-start text-neutral-200">
                                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F0C37A]/20 text-[#F0C37A] text-xs font-semibold mr-3 flex-shrink-0">
                                                                {idx + 1}
                                                            </span>
                                                            <span>{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Anticipated Questions */}
                                        {finalPitch.anticipated_questions && finalPitch.anticipated_questions.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-[#F0C37A] mb-3">Anticipated Questions & Answers</h3>
                                                <div className="space-y-4">
                                                    {finalPitch.anticipated_questions.map((qa, idx) => (
                                                        <div key={idx} className="p-4 rounded-lg bg-white/5">
                                                            <p className="text-neutral-200 font-medium mb-2">Q: {qa.question}</p>
                                                            <p className="text-neutral-400 text-sm">A: {qa.answer}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Reset Button */}
                            <div className="text-center">
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    className="border-white/10 text-neutral-300 hover:bg-white/5"
                                >
                                    Create Another Pitch
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {status === "error" && error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="bg-red-500/10 border-red-500/20">
                                <CardContent className="pt-8 pb-8">
                                    <div className="flex items-start space-x-4">
                                        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
                                            <p className="text-red-300/80 mb-6">{error}</p>
                                            <Button
                                                onClick={handleReset}
                                                variant="outline"
                                                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                            >
                                                Try Again
                                            </Button>
                                        </div>
                                    </div>
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
