"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    StartupInput,
    WeaknessesResults,
    CrewAnalysisResponse,
} from "@/types/crew";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

function WeaknessesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<WeaknessesResults | null>(null);
    const [analysisId, setAnalysisId] = useState<string>("");

    useEffect(() => {
        const loadAndAnalyze = async () => {
            try {
                const dbResponse = await fetch('/api/crew/get-form');
                let startupData: StartupInput | null = null;

                if (dbResponse.ok) {
                    const data = await dbResponse.json();
                    startupData = data.formData;
                }

                if (!startupData) {
                    const storedData = localStorage.getItem('crewai_startup_data');
                    if (!storedData) {
                        router.push("/crew");
                        return;
                    }
                    startupData = JSON.parse(storedData);
                }

                if (!startupData) {
                    router.push("/crew");
                    return;
                }

                fetch("/api/crew/weaknesses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ startup_data: startupData }),
                })
                    .then((res) => res.json())
                    .then((data: CrewAnalysisResponse<WeaknessesResults>) => {
                        if (data.status === "completed" && data.result) {
                            setResults(data.result);
                            setAnalysisId(data.analysis_id);
                            setLoading(false);
                        } else if (data.status === "failed") {
                            setError(data.error || "Analysis failed");
                            setLoading(false);
                        } else {
                            setError("Unexpected response status");
                            setLoading(false);
                        }
                    })
                    .catch((err) => {
                        setError(err.message);
                        setLoading(false);
                    });
            } catch (error: any) {
                console.error('Error loading startup data:', error);
                setError('Failed to load startup data');
                setLoading(false);
            }
        };

        loadAndAnalyze();
    }, [searchParams, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col">
                <Navbar />
                <div className="flex-1 bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center pt-24">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Analyzing Weaknesses...
                        </h2>
                        <p className="text-gray-300">
                            Identifying areas for improvement
                        </p>
                        <p className="text-gray-400 text-sm mt-2">This may take 1-2 minutes</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col">
                <Navbar />
                <div className="flex-1 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-6 pt-24">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-white mb-4">Analysis Failed</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <button
                            onClick={() => router.push("/crew")}
                            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const categories = [
        { key: "marketing_weaknesses", title: "Marketing", icon: "📢", color: "from-pink-500 to-pink-700" },
        { key: "tech_weaknesses", title: "Technology", icon: "💻", color: "from-blue-500 to-blue-700" },
        { key: "org_hr_weaknesses", title: "Organization & HR", icon: "👥", color: "from-green-500 to-green-700" },
        { key: "competitive_weaknesses", title: "Competitive Position", icon: "🎯", color: "from-orange-500 to-orange-700" },
        { key: "finance_weaknesses", title: "Finance", icon: "💰", color: "from-purple-500 to-purple-700" },
    ];

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col">
            <Navbar />
            <div className="flex-1 bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-6 pt-24 pb-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🔍</div>
                        <h1 className="text-4xl font-bold text-white mb-3">
                            Areas for Improvement
                        </h1>
                        <p className="text-gray-300 mb-2">
                            Critical weaknesses to address
                        </p>
                        <p className="text-sm text-gray-400">Analysis ID: {analysisId}</p>
                    </div>

                    <div className="space-y-6 mb-8">
                        {categories.map((category) => {
                            const items = results?.[category.key as keyof WeaknessesResults] || [];
                            return (
                                <div
                                    key={category.key}
                                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg"
                                >
                                    <div className={`bg-gradient-to-r ${category.color} -mx-6 -mt-6 mb-4 p-4 rounded-t-xl`}>
                                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <span>{category.icon}</span>
                                            {category.title}
                                        </h3>
                                    </div>
                                    <div className="space-y-3">
                                        {items.length > 0 ? (
                                            items.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-orange-900/30 p-4 rounded-lg border border-orange-500/30"
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="text-orange-400 text-xl flex-shrink-0">⚠</div>
                                                        <p className="text-white flex-1">{item}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 italic">No weaknesses identified</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => router.push("/crew")}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            ← Edit Startup Data
                        </button>
                        <button
                            onClick={() => {
                                router.push("/crew?select=true");
                            }}
                            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                            Run Another Analysis
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default function WeaknessesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020617] flex flex-col">
                <Navbar />
                <div className="flex-1 bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center pt-24">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
                </div>
                <Footer />
            </div>
        }>
            <WeaknessesContent />
        </Suspense>
    );
}
