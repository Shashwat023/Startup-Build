"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    StartupInput,
    WeaknessesResults,
    PipelineStatus,
} from "@/types/crew";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

function WeaknessesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "streaming" | "completed" | "failed">("loading");
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<WeaknessesResults | null>(null);
    const [analysisId, setAnalysisId] = useState<string>("");
    const [pipeline, setPipeline] = useState<PipelineStatus | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const hasStartedRef = useRef(false);

    useEffect(() => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

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

                const response = await fetch("/api/crew/weaknesses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ startup_data: startupData }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to start analysis");
                }

                setAnalysisId(data.analysis_id);
                setStatus("streaming");

                const eventSource = new EventSource(`/api/crew/weaknesses/stream?id=${data.analysis_id}`);
                eventSourceRef.current = eventSource;

                eventSource.onmessage = (event) => {
                    try {
                        const pipelineData: PipelineStatus = JSON.parse(event.data);
                        setPipeline(pipelineData);

                        if (pipelineData.pipeline_status === "completed" || pipelineData.pipeline_status === "failed") {
                            eventSource.close();
                            eventSourceRef.current = null;
                            fetchFinalResults(data.analysis_id);
                        }
                    } catch (e) {
                        console.error("Error parsing SSE data:", e);
                    }
                };

                eventSource.onerror = (e) => {
                    console.error("SSE error:", e);
                    eventSource.close();
                    eventSourceRef.current = null;
                    fetchFinalResults(data.analysis_id);
                };

            } catch (error: any) {
                console.error('Error:', error);
                setError(error.message || 'Failed to start analysis');
                setStatus("failed");
            }
        };

        const fetchFinalResults = async (id: string) => {
            try {
                const response = await fetch(`/api/crew/weaknesses?id=${id}`);
                const data = await response.json();

                if (data.status === "completed" && data.result) {
                    setResults(data.result);
                    setStatus("completed");
                } else if (data.status === "failed") {
                    setError(data.error || "Analysis failed");
                    setStatus("failed");
                    if (data.result) setResults(data.result);
                }

                if (data.pipeline) setPipeline(data.pipeline);
            } catch (e) {
                console.error("Error fetching final results:", e);
                setError("Failed to fetch results");
                setStatus("failed");
            }
        };

        loadAndAnalyze();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, []);

    if (status === "loading" || status === "streaming") {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col">
                <Navbar />
                <div className="flex-1 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-6 pt-24">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h1 className="text-4xl font-bold text-white mb-3">
                                Analyzing Your Weaknesses
                            </h1>
                            <p className="text-gray-300">
                                Sequential pipeline with rate limiting
                            </p>
                        </div>

                        {pipeline && (
                            <div className="space-y-4">
                                {pipeline.agents.map((agent) => (
                                    <div
                                        key={agent.agent_name}
                                        className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border-2 ${agent.status === "running" || agent.status === "retrying"
                                                ? "border-red-500 shadow-lg shadow-red-500/50"
                                                : agent.status === "cooling_down"
                                                    ? "border-blue-500"
                                                    : agent.status === "completed"
                                                        ? "border-red-600/50"
                                                        : agent.status === "failed"
                                                            ? "border-red-800/50"
                                                            : "border-gray-700"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`text-3xl ${agent.status === "running" || agent.status === "retrying" ? "animate-pulse" : ""}`}>
                                                    {agent.status === "pending" && "○"}
                                                    {agent.status === "running" && "▶"}
                                                    {agent.status === "retrying" && "↻"}
                                                    {agent.status === "cooling_down" && "⏳"}
                                                    {agent.status === "completed" && "✓"}
                                                    {agent.status === "failed" && "✗"}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{agent.display_name}</h3>
                                                    <p className="text-sm text-gray-400">
                                                        {agent.status === "pending" && "Waiting..."}
                                                        {agent.status === "running" && `Running (Attempt ${agent.attempt})`}
                                                        {agent.status === "retrying" && `Retrying (Attempt ${agent.attempt})`}
                                                        {agent.status === "cooling_down" && `Cooling down: ${agent.cooldown_remaining}s`}
                                                        {agent.status === "completed" && "Completed"}
                                                        {agent.status === "failed" && "Failed"}
                                                    </p>
                                                </div>
                                            </div>
                                            {agent.status === "completed" && agent.result && (
                                                <div className="text-sm text-red-400">{agent.result.length} weaknesses found</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="text-center mt-6 text-sm text-gray-400">
                                    Status: <span className="text-white font-semibold">{pipeline.pipeline_status}</span>
                                    {pipeline.current_agent && <> | Current: <span className="text-red-400">{pipeline.current_agent}</span></>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error && !results) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col">
                <Navbar />
                <div className="flex-1 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-6 pt-24">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-white mb-4">Analysis Failed</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <button onClick={() => router.push("/crew")} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            Try Again
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const categories = [
        { key: "finance_weaknesses", title: "Finance", icon: "💰", color: "from-purple-500 to-purple-700" },
        { key: "marketing_weaknesses", title: "Marketing", icon: "📢", color: "from-pink-500 to-pink-700" },
        { key: "tech_weaknesses", title: "Technology", icon: "💻", color: "from-blue-500 to-blue-700" },
        { key: "org_hr_weaknesses", title: "Organization & HR", icon: "👥", color: "from-green-500 to-green-700" },
        { key: "competitive_weaknesses", title: "Competitive Position", icon: "🎯", color: "from-orange-500 to-orange-700" },
    ];

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col">
            <Navbar />
            <div className="flex-1 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-6 pt-24 pb-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-4xl font-bold text-white mb-3">Your Startup Weaknesses</h1>
                        <p className="text-gray-300 mb-2">Areas that need attention and improvement</p>
                        {error && <p className="text-sm text-yellow-400 mb-2">⚠️ {error} (showing partial results)</p>}
                        <p className="text-sm text-gray-400">Analysis ID: {analysisId}</p>
                    </div>

                    <div className="space-y-6 mb-8">
                        {categories.map((category) => {
                            const items = results?.[category.key as keyof WeaknessesResults] || [];
                            return (
                                <div key={category.key} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg">
                                    <div className={`bg-gradient-to-r ${category.color} -mx-6 -mt-6 mb-4 p-4 rounded-t-xl`}>
                                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <span>{category.icon}</span>
                                            {category.title}
                                        </h3>
                                    </div>
                                    <div className="space-y-3">
                                        {items.length > 0 ? (
                                            items.map((item, idx) => (
                                                <div key={idx} className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
                                                    <div className="flex gap-3">
                                                        <div className="text-red-400 text-xl flex-shrink-0">⚡</div>
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
                        <button onClick={() => router.push("/crew")} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            ← Edit Startup Data
                        </button>
                        <button onClick={() => router.push("/crew?select=true")} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
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
                <div className="flex-1 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center pt-24">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500"></div>
                </div>
                <Footer />
            </div>
        }>
            <WeaknessesContent />
        </Suspense>
    );
}
