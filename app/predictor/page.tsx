"use client";

import { useState, FormEvent } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TrendingUp, Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface FormData {
    relationships: string;
    funding_rounds: string;
    funding_total_usd: string;
    milestones: string;
    has_VC: boolean;
    has_angel: boolean;
    avg_participants: string;
    startup_age: string;
    execution_velocity: string;
    rounds_per_year: string;
}

interface PredictionResult {
    prediction: string;
    probability_acquired: number;
}

export default function PredictorPage() {
    const [formData, setFormData] = useState<FormData>({
        relationships: "",
        funding_rounds: "",
        funding_total_usd: "",
        milestones: "",
        has_VC: false,
        has_angel: false,
        avg_participants: "",
        startup_age: "",
        execution_velocity: "",
        rounds_per_year: "",
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const payload = {
                relationships: parseFloat(formData.relationships),
                funding_rounds: parseFloat(formData.funding_rounds),
                funding_total_usd: parseFloat(formData.funding_total_usd),
                milestones: parseFloat(formData.milestones),
                has_VC: formData.has_VC ? 1 : 0,
                has_angel: formData.has_angel ? 1 : 0,
                avg_participants: parseFloat(formData.avg_participants),
                startup_age: parseFloat(formData.startup_age),
                execution_velocity: parseFloat(formData.execution_velocity),
                rounds_per_year: parseFloat(formData.rounds_per_year),
            };

            const response = await fetch("/api/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Prediction failed");
            }

            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const getPredictionIcon = (prediction: string) => {
        if (prediction.toLowerCase().includes("acquired")) return CheckCircle2;
        if (prediction.toLowerCase().includes("operating")) return TrendingUp;
        return XCircle;
    };

    const getPredictionColor = (prediction: string) => {
        if (prediction.toLowerCase().includes("acquired")) return "text-green-400";
        if (prediction.toLowerCase().includes("operating")) return "text-blue-400";
        return "text-red-400";
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
                            Startup Success{" "}
                            <span className="bg-gradient-to-r from-[#F0C37A] via-[#E8B960] to-[#D4A84A] text-transparent bg-clip-text">
                                Predictor
                            </span>
                        </h1>
                        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                            Leverage AI to predict your startup's future. Enter your metrics below to get
                            data-driven insights powered by machine learning.
                        </p>
                    </motion.div>

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="bg-white/5 backdrop-blur-md border-white/10">
                            <CardHeader>
                                <CardTitle className="text-2xl text-white">Enter Startup Metrics</CardTitle>
                                <CardDescription className="text-neutral-400">
                                    Fill in all fields to receive an accurate prediction
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Relationships */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                                Relationships
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                required
                                                value={formData.relationships}
                                                onChange={(e) => handleInputChange("relationships", e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all"
                                                placeholder="e.g., 5"
                                            />
                                        </div>

                                        {/* Funding Rounds */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                                Funding Rounds
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                required
                                                value={formData.funding_rounds}
                                                onChange={(e) => handleInputChange("funding_rounds", e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all"
                                                placeholder="e.g., 3"
                                            />
                                        </div>

                                        {/* Funding Total USD */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                                Total Funding (USD)
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                required
                                                value={formData.funding_total_usd}
                                                onChange={(e) => handleInputChange("funding_total_usd", e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all"
                                                placeholder="e.g., 1000000"
                                            />
                                        </div>

                                        {/* Milestones */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                                Milestones Achieved
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                required
                                                value={formData.milestones}
                                                onChange={(e) => handleInputChange("milestones", e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all"
                                                placeholder="e.g., 10"
                                            />
                                        </div>

                                        {/* Average Participants */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                                Avg. Participants per Round
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                required
                                                value={formData.avg_participants}
                                                onChange={(e) => handleInputChange("avg_participants", e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all"
                                                placeholder="e.g., 4"
                                            />
                                        </div>

                                        {/* Startup Age */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                                Startup Age (years)
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                required
                                                value={formData.startup_age}
                                                onChange={(e) => handleInputChange("startup_age", e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all"
                                                placeholder="e.g., 2"
                                            />
                                        </div>

                                        {/* Execution Velocity */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                                Execution Velocity (0-1)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="1"
                                                required
                                                value={formData.execution_velocity}
                                                onChange={(e) => handleInputChange("execution_velocity", e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all"
                                                placeholder="e.g., 0.8"
                                            />
                                        </div>

                                        {/* Rounds per Year */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                                Rounds per Year
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                required
                                                value={formData.rounds_per_year}
                                                onChange={(e) => handleInputChange("rounds_per_year", e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all"
                                                placeholder="e.g., 1.5"
                                            />
                                        </div>
                                    </div>

                                    {/* Checkboxes */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                        <label className="flex items-center space-x-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.has_VC}
                                                onChange={(e) => handleInputChange("has_VC", e.target.checked)}
                                                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#F0C37A] focus:ring-2 focus:ring-[#F0C37A] cursor-pointer"
                                            />
                                            <span className="text-neutral-300 group-hover:text-[#F0C37A] transition-colors">
                                                Has Venture Capital
                                            </span>
                                        </label>

                                        <label className="flex items-center space-x-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.has_angel}
                                                onChange={(e) => handleInputChange("has_angel", e.target.checked)}
                                                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#F0C37A] focus:ring-2 focus:ring-[#F0C37A] cursor-pointer"
                                            />
                                            <span className="text-neutral-300 group-hover:text-[#F0C37A] transition-colors">
                                                Has Angel Investment
                                            </span>
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-6">
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-[#F0C37A] to-[#D4A84A] hover:from-[#E8B960] hover:to-[#C99A3A] text-black font-semibold text-lg h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <TrendingUp className="w-5 h-5 mr-2" />
                                                    Predict Success
                                                </>
                                            )}
                                        </Button>
                                    </div>
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
                            className="mt-8"
                        >
                            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-white">Prediction Results</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Prediction Status */}
                                    <div className="flex items-center space-x-4 p-6 rounded-lg bg-white/5 border border-white/10">
                                        {(() => {
                                            const Icon = getPredictionIcon(result.prediction);
                                            const colorClass = getPredictionColor(result.prediction);
                                            return (
                                                <>
                                                    <Icon className={`w-12 h-12 ${colorClass}`} />
                                                    <div>
                                                        <p className="text-sm text-neutral-400 mb-1">Status</p>
                                                        <p className={`text-2xl font-bold ${colorClass}`}>
                                                            {result.prediction}
                                                        </p>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* Probability */}
                                    <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                                        <p className="text-sm text-neutral-400 mb-3">Acquisition Probability</p>
                                        <div className="flex items-end space-x-4">
                                            <p className="text-4xl font-bold bg-gradient-to-r from-[#F0C37A] to-[#D4A84A] text-transparent bg-clip-text">
                                                {(result.probability_acquired * 100).toFixed(2)}%
                                            </p>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="mt-4 h-3 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.probability_acquired * 100}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-[#F0C37A] to-[#D4A84A] rounded-full"
                                            />
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
                            className="mt-8"
                        >
                            <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start space-x-4">
                                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-400 font-semibold mb-1">Prediction Failed</p>
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
