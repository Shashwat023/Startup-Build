"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    StartupInput,
    RoadmapResults,
    CrewAnalysisResponse,
} from "@/types/crew";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

function RoadmapContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<RoadmapResults | null>(null);
    const [analysisId, setAnalysisId] = useState<string>("");

    useEffect(() => {
        const loadAndAnalyze = async () => {
            try {
                // Try to retrieve data from database first
                const dbResponse = await fetch('/api/crew/get-form');
                let startupData: StartupInput | null = null;

                if (dbResponse.ok) {
                    const data = await dbResponse.json();
                    startupData = data.formData;
                }

                // Fallback to localStorage if database fails
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

                // Call the API
                fetch("/api/crew/roadmap", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ startup_data: startupData }),
                })
                    .then((res) => res.json())
                    .then((data: CrewAnalysisResponse<RoadmapResults>) => {
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
                <div className="flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Generating Your Roadmap...
                        </h2>
                        <p className="text-gray-300">
                            Our AI agents are analyzing your startup data
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
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        { key: "marketing_roadmap", title: "Marketing Roadmap", icon: "📢", color: "from-pink-500 to-pink-700" },
        { key: "tech_roadmap", title: "Tech Roadmap", icon: "💻", color: "from-blue-500 to-blue-700" },
        { key: "org_hr_roadmap", title: "Org/HR Roadmap", icon: "👥", color: "from-green-500 to-green-700" },
        { key: "competitive_roadmap", title: "Competitive Roadmap", icon: "🎯", color: "from-orange-500 to-orange-700" },
        { key: "finance_roadmap", title: "Finance Roadmap", icon: "💰", color: "from-purple-500 to-purple-700" },
    ];

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col">
            <Navbar />
            <div className="flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 pt-24 pb-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">📅</div>
                        <h1 className="text-4xl font-bold text-white mb-3">
                            Your Next Month Roadmap
                        </h1>
                        <p className="text-gray-300 mb-2">
                            4-week action plan across all key areas
                        </p>
                        <p className="text-sm text-gray-400">Analysis ID: {analysisId}</p>
                    </div>

                    {/* Results */}
                    <div className="space-y-6 mb-8">
                        {categories.map((category) => {
                            const items = results?.[category.key as keyof RoadmapResults] || [];
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
                                                    className="bg-white/5 p-4 rounded-lg border border-white/10"
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                                                            {idx + 1}
                                                        </div>
                                                        <p className="text-white flex-1">{item}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 italic">No roadmap items available</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => router.push("/crew")}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            ← Edit Startup Data
                        </button>
                        <button
                            onClick={() => {
                                // Navigate to agent selection screen
                                router.push("/crew?select=true");
                            }}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

export default function RoadmapPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020617] flex flex-col">
                <Navbar />
                <div className="flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center pt-24">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
                </div>
                <Footer />
            </div>
        }>
            <RoadmapContent />
        </Suspense>
    );
}
