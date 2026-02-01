"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    StartupInput,
    RoadmapResults,
    PipelineStatus,
    AgentStatus,
} from "@/types/crew";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Agent status icon helper
function getStatusIcon(status: string) {
    switch (status) {
        case "completed": return "✓";
        case "running": return "▶";
        case "retrying": return "↻";
        case "cooling_down": return "⏳";
        case "failed": return "✗";
        case "pending": return "○";
        default: return "○";
    }
}

// Agent status color helper
function getStatusColor(status: string) {
    switch (status) {
        case "completed": return "text-green-400 bg-green-500/20";
        case "running": return "text-blue-400 bg-blue-500/20 animate-pulse";
        case "retrying": return "text-yellow-400 bg-yellow-500/20 animate-pulse";
        case "cooling_down": return "text-orange-400 bg-orange-500/20";
        case "failed": return "text-red-400 bg-red-500/20";
        case "pending": return "text-gray-400 bg-gray-500/20";
        default: return "text-gray-400 bg-gray-500/20";
    }
}

// Pipeline progress component
function PipelineProgress({ pipeline }: { pipeline: PipelineStatus }) {
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🔄</span> Pipeline Progress
            </h3>

            <div className="space-y-3">
                {pipeline.agents.map((agent, idx) => (
                    <div
                        key={agent.agent_name}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-all ${agent.status === "running" || agent.status === "retrying"
                            ? "bg-blue-500/10 border border-blue-500/30"
                            : agent.status === "cooling_down"
                                ? "bg-orange-500/10 border border-orange-500/30"
                                : "bg-white/5"
                            }`}
                    >
                        {/* Status icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${getStatusColor(agent.status)}`}>
                            {getStatusIcon(agent.status)}
                        </div>

                        {/* Agent info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{agent.display_name}</span>
                                {agent.attempt > 1 && (
                                    <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded">
                                        Attempt {agent.attempt}
                                    </span>
                                )}
                            </div>

                            {/* Status text */}
                            <div className="text-sm text-gray-400">
                                {agent.status === "running" && "Running analysis..."}
                                {agent.status === "retrying" && "Retrying after error..."}
                                {agent.status === "cooling_down" && agent.cooldown_remaining && (
                                    <span className="text-orange-400">
                                        Cooldown: {agent.cooldown_remaining}s remaining
                                    </span>
                                )}
                                {agent.status === "completed" && "Complete"}
                                {agent.status === "failed" && (
                                    <span className="text-red-400">Failed: {agent.error?.slice(0, 50)}...</span>
                                )}
                                {agent.status === "pending" && "Waiting..."}
                            </div>
                        </div>

                        {/* Step number */}
                        <div className="text-gray-500 text-sm">
                            Step {idx + 1}/{pipeline.agents.length}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pipeline status bar */}
            <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                        Pipeline: <span className={
                            pipeline.pipeline_status === "completed" ? "text-green-400" :
                                pipeline.pipeline_status === "running" ? "text-blue-400" :
                                    pipeline.pipeline_status === "failed" ? "text-red-400" :
                                        "text-gray-400"
                        }>{pipeline.pipeline_status.toUpperCase()}</span>
                    </span>
                    {pipeline.current_agent && (
                        <span className="text-gray-400">
                            Current: <span className="text-white">{pipeline.current_agent}</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function RoadmapContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "streaming" | "completed" | "failed">("loading");
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<RoadmapResults | null>(null);
    const [analysisId, setAnalysisId] = useState<string>("");
    const [pipeline, setPipeline] = useState<PipelineStatus | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const hasStartedRef = useRef(false); // Use ref to prevent re-runs

    useEffect(() => {
        // Guard against duplicate runs using ref (survives re-renders)
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

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

                // Submit analysis
                const response = await fetch("/api/crew/roadmap", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ startup_data: startupData }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to start analysis. Is the backend running?");
                }

                setAnalysisId(data.analysis_id);
                setStatus("streaming");

                // Connect to SSE stream for real-time progress
                const eventSource = new EventSource(`/api/crew/roadmap/stream?id=${data.analysis_id}`);
                eventSourceRef.current = eventSource;

                eventSource.onmessage = (event) => {
                    try {
                        const pipelineData: PipelineStatus = JSON.parse(event.data);
                        setPipeline(pipelineData);

                        // Check if pipeline is complete
                        if (pipelineData.pipeline_status === "completed" || pipelineData.pipeline_status === "failed") {
                            eventSource.close();
                            eventSourceRef.current = null;

                            // Fetch final results
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

                    // Try to fetch results anyway
                    fetchFinalResults(data.analysis_id);
                };

            } catch (error: any) {
                console.error('Error:', error);
                setError(error.message || 'Failed to start analysis');
                setStatus("failed");
                // Don't retry - show error to user
            }
        };

        const fetchFinalResults = async (id: string) => {
            try {
                const response = await fetch(`/api/crew/roadmap?id=${id}`);
                const data = await response.json();

                if (data.status === "completed" && data.result) {
                    setResults(data.result);
                    setStatus("completed");
                } else if (data.status === "failed") {
                    setError(data.error || "Analysis failed");
                    setStatus("failed");
                    // Still show partial results if available
                    if (data.result) {
                        setResults(data.result);
                    }
                }

                if (data.pipeline) {
                    setPipeline(data.pipeline);
                }
            } catch (e) {
                console.error("Error fetching final results:", e);
                setError("Failed to fetch results");
                setStatus("failed");
            }
        };

        loadAndAnalyze();

        // Cleanup on unmount
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, []); // Empty deps - run once on mount only

    // Loading/Streaming state with pipeline progress
    if (status === "loading" || status === "streaming") {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col">
                <Navbar />
                <div className="flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 pt-24">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {status === "loading" ? "Starting Pipeline..." : "Running Sequential Analysis..."}
                            </h2>
                            <p className="text-gray-300">
                                Each agent runs with a 15-second cooldown to protect API quotas
                            </p>
                            {analysisId && (
                                <p className="text-gray-400 text-sm mt-2">Analysis ID: {analysisId}</p>
                            )}
                        </div>

                        {/* Show pipeline progress */}
                        {pipeline && <PipelineProgress pipeline={pipeline} />}

                        <div className="text-center text-gray-400 text-sm">
                            <p>⚡ Sequential execution prevents API overload</p>
                            <p>⏱️ Total estimated time: ~2-3 minutes</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (status === "failed" && !results) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col">
                <Navbar />
                <div className="flex-1 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-6 pt-24">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-white mb-4">Analysis Failed</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        {pipeline && (
                            <div className="text-left mb-6">
                                <p className="text-sm text-gray-400 mb-2">Pipeline Status:</p>
                                {pipeline.agents.map(agent => (
                                    <div key={agent.agent_name} className="flex items-center gap-2 text-sm">
                                        <span className={getStatusColor(agent.status)}>{getStatusIcon(agent.status)}</span>
                                        <span className="text-gray-300">{agent.display_name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
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
        { key: "finance_roadmap", title: "Finance Roadmap", icon: "💰", color: "from-purple-500 to-purple-700" },
        { key: "marketing_roadmap", title: "Marketing Roadmap", icon: "📢", color: "from-pink-500 to-pink-700" },
        { key: "tech_roadmap", title: "Tech Roadmap", icon: "💻", color: "from-blue-500 to-blue-700" },
        { key: "org_hr_roadmap", title: "Org/HR Roadmap", icon: "👥", color: "from-green-500 to-green-700" },
        { key: "competitive_roadmap", title: "Competitive Roadmap", icon: "🎯", color: "from-orange-500 to-orange-700" },
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

                        {/* Partial results warning */}
                        {status === "failed" && results && (
                            <div className="mt-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 max-w-md mx-auto">
                                <p className="text-yellow-400 text-sm">
                                    ⚠️ Some agents failed. Showing partial results.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Results */}
                    <div className="space-y-6 mb-8">
                        {categories.map((category) => {
                            const items = results?.[category.key as keyof RoadmapResults] || [];
                            const agentStatus = pipeline?.agents.find(a =>
                                a.display_name.toLowerCase().includes(category.key.replace('_roadmap', '').replace('_', ' '))
                            );

                            return (
                                <div
                                    key={category.key}
                                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg"
                                >
                                    <div className={`bg-gradient-to-r ${category.color} -mx-6 -mt-6 mb-4 p-4 rounded-t-xl`}>
                                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <span>{category.icon}</span>
                                            {category.title}
                                            {agentStatus?.status === "failed" && (
                                                <span className="text-sm bg-red-500/50 px-2 py-1 rounded">Failed</span>
                                            )}
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
