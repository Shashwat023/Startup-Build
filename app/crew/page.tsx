"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartupInput } from "@/types/crew";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function CrewInputPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<StartupInput>({
        product_technology: {
            product_type: "Web",
            current_features: [],
            tech_stack: [],
            data_strategy: "None",
            ai_usage: "None",
            tech_challenges: "",
        },
        marketing_growth: {
            current_marketing_channels: [],
            monthly_users: 0,
            customer_acquisition_cost: "",
            retention_strategy: "",
            growth_problems: "",
        },
        team_organization: {
            team_size: 0,
            founder_roles: [],
            hiring_plan_next_3_months: "",
            org_challenges: "",
        },
        competition_market: {
            known_competitors: [],
            unique_advantage: "",
            pricing_model: "",
            market_risks: "",
        },
        finance_runway: {
            monthly_burn: "",
            current_revenue: "",
            funding_status: "Bootstrapped",
            runway_months: "",
            financial_concerns: "",
        },
    });

    const [currentSection, setCurrentSection] = useState(0);
    const [showAgentSelection, setShowAgentSelection] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Multi-input handlers
    const [featureInput, setFeatureInput] = useState("");
    const [techStackInput, setTechStackInput] = useState("");
    const [channelInput, setChannelInput] = useState("");
    const [roleInput, setRoleInput] = useState("");
    const [competitorInput, setCompetitorInput] = useState("");

    const sections = [
        "Product & Technology",
        "Marketing & Growth",
        "Team & Organization",
        "Competition & Market",
        "Finance & Runway",
    ];

    const handleNext = () => {
        if (currentSection < sections.length - 1) {
            setCurrentSection(currentSection + 1);
        } else {
            setShowAgentSelection(true);
        }
    };

    const handleBack = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
        }
    };

    const addItem = (array: string[], value: string, setter: (val: string) => void) => {
        if (value.trim()) {
            return [...array, value.trim()];
        }
        return array;
    };

    const removeItem = (array: string[], index: number) => {
        return array.filter((_, i) => i !== index);
    };

    // Save form data to MongoDB
    const saveFormData = async (data: StartupInput) => {
        try {
            setIsSaving(true);
            // Save to localStorage first (instant)
            localStorage.setItem('crewai_startup_data', JSON.stringify(data));

            // Then save to database (async)
            const response = await fetch('/api/crew/save-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formData: data }),
            });

            if (!response.ok) {
                console.error('Failed to save to database');
            }
        } catch (error) {
            console.error('Error saving form data:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Load form data from database on mount
    useEffect(() => {
        const loadFormData = async () => {
            try {
                setIsLoading(true);

                // Try to load from database first
                const response = await fetch('/api/crew/get-form');
                if (response.ok) {
                    const data = await response.json();
                    if (data.formData) {
                        setFormData(data.formData);
                        // Update localStorage too
                        localStorage.setItem('crewai_startup_data', JSON.stringify(data.formData));
                        return;
                    }
                }

                // Fallback to localStorage if database fails
                const storedData = localStorage.getItem('crewai_startup_data');
                if (storedData) {
                    setFormData(JSON.parse(storedData));
                }
            } catch (error) {
                console.error('Error loading form data:', error);
                // Fallback to localStorage
                const storedData = localStorage.getItem('crewai_startup_data');
                if (storedData) {
                    setFormData(JSON.parse(storedData));
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadFormData();
    }, []);

    // Check for agent selection parameter
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('select') === 'true') {
            setShowAgentSelection(true);
        }
    }, []);

    // Auto-save when formData changes (debounced)
    useEffect(() => {
        if (isLoading) return; // Don't save during initial load

        const timeoutId = setTimeout(() => {
            saveFormData(formData);
        }, 1000); // Save 1 second after user stops typing

        return () => clearTimeout(timeoutId);
    }, [formData, isLoading]);

    const navigateToAgent = (agent: string) => {
        // Data is already saved, just navigate
        router.push(`/crew/${agent}`);
    };

    if (showAgentSelection) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col">
                <Navbar />
                <div className="flex-1 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 pt-24 pb-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-white mb-3">
                                Select Analysis Type
                            </h1>
                            <p className="text-gray-300">
                                Choose which AI agent you'd like to run on your startup data
                            </p>
                            <button
                                onClick={() => setShowAgentSelection(false)}
                                className="mt-4 text-purple-300 hover:text-purple-100 underline"
                            >
                                ← Edit Startup Data
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Roadmap Card */}
                            <button
                                onClick={() => navigateToAgent("roadmap")}
                                className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                            >
                                <div className="text-white">
                                    <div className="text-3xl mb-3">📅</div>
                                    <h3 className="text-2xl font-bold mb-2">Next Month Roadmap</h3>
                                    <p className="text-blue-100">
                                        Get a detailed 4-week action plan across all key areas
                                    </p>
                                </div>
                            </button>

                            {/* Strengths Card */}
                            <button
                                onClick={() => navigateToAgent("strengths")}
                                className="bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                            >
                                <div className="text-white">
                                    <div className="text-3xl mb-3">💪</div>
                                    <h3 className="text-2xl font-bold mb-2">Analyze Strengths</h3>
                                    <p className="text-green-100">
                                        Identify your competitive advantages and what you're doing right
                                    </p>
                                </div>
                            </button>

                            {/* Weaknesses Card */}
                            <button
                                onClick={() => navigateToAgent("weaknesses")}
                                className="bg-gradient-to-br from-orange-500 to-orange-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                            >
                                <div className="text-white">
                                    <div className="text-3xl mb-3">🔍</div>
                                    <h3 className="text-2xl font-bold mb-2">Analyze Weaknesses</h3>
                                    <p className="text-orange-100">
                                        Find critical areas for improvement and potential risks
                                    </p>
                                </div>
                            </button>

                            {/* Suggestions Card */}
                            <button
                                onClick={() => navigateToAgent("suggestions")}
                                className="bg-gradient-to-br from-purple-500 to-purple-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                            >
                                <div className="text-white">
                                    <div className="text-3xl mb-3">💡</div>
                                    <h3 className="text-2xl font-bold mb-2">Get Suggestions</h3>
                                    <p className="text-purple-100">
                                        Receive actionable recommendations to accelerate growth
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col">
            <Navbar />
            <div className="flex-1 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 pt-24 pb-12">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-3">
                            Startup Board Panel
                        </h1>
                        <p className="text-gray-300">
                            Tell us about your startup to get AI-powered insights
                        </p>
                        {isSaving && (
                            <p className="text-purple-400 text-sm mt-2 flex items-center justify-center gap-2">
                                <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                                Saving...
                            </p>
                        )}
                        {!isSaving && !isLoading && (
                            <p className="text-green-400 text-sm mt-2 flex items-center justify-center gap-2">
                                <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                                All changes saved
                            </p>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {sections.map((section, idx) => (
                                <div
                                    key={idx}
                                    className={`text-xs ${idx <= currentSection ? "text-purple-300" : "text-gray-500"
                                        }`}
                                >
                                    {idx + 1}
                                </div>
                            ))}
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                            />
                        </div>
                        <p className="text-center text-gray-300 mt-2 text-sm">
                            {sections[currentSection]}
                        </p>
                    </div>

                    {/* Form sections */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl">
                        {/* Section 0: Product & Technology */}
                        {currentSection === 0 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    Product & Technology
                                </h2>

                                <div>
                                    <label className="block text-white mb-2">Product Type</label>
                                    <select
                                        value={formData.product_technology.product_type}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                product_technology: {
                                                    ...formData.product_technology,
                                                    product_type: e.target.value as any,
                                                },
                                            })
                                        }
                                        className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/30 focus:border-purple-500 focus:outline-none cursor-pointer"
                                        style={{ colorScheme: 'dark' }}
                                    >
                                        <option value="Web" className="bg-slate-800 text-white">Web</option>
                                        <option value="Mobile" className="bg-slate-800 text-white">Mobile</option>
                                        <option value="SaaS" className="bg-slate-800 text-white">SaaS</option>
                                        <option value="Hardware" className="bg-slate-800 text-white">Hardware</option>
                                        <option value="AI" className="bg-slate-800 text-white">AI</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Current Features</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={featureInput}
                                            onChange={(e) => setFeatureInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    setFormData({
                                                        ...formData,
                                                        product_technology: {
                                                            ...formData.product_technology,
                                                            current_features: addItem(
                                                                formData.product_technology.current_features,
                                                                featureInput,
                                                                setFeatureInput
                                                            ),
                                                        },
                                                    });
                                                    setFeatureInput("");
                                                }
                                            }}
                                            placeholder="Type a feature and press Enter"
                                            className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        />
                                        <button
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    product_technology: {
                                                        ...formData.product_technology,
                                                        current_features: addItem(
                                                            formData.product_technology.current_features,
                                                            featureInput,
                                                            setFeatureInput
                                                        ),
                                                    },
                                                });
                                                setFeatureInput("");
                                            }}
                                            className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.product_technology.current_features.map((feature, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                            >
                                                {feature}
                                                <button
                                                    onClick={() =>
                                                        setFormData({
                                                            ...formData,
                                                            product_technology: {
                                                                ...formData.product_technology,
                                                                current_features: removeItem(
                                                                    formData.product_technology.current_features,
                                                                    idx
                                                                ),
                                                            },
                                                        })
                                                    }
                                                    className="text-white hover:text-red-300"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Tech Stack</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={techStackInput}
                                            onChange={(e) => setTechStackInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    setFormData({
                                                        ...formData,
                                                        product_technology: {
                                                            ...formData.product_technology,
                                                            tech_stack: addItem(
                                                                formData.product_technology.tech_stack,
                                                                techStackInput,
                                                                setTechStackInput
                                                            ),
                                                        },
                                                    });
                                                    setTechStackInput("");
                                                }
                                            }}
                                            placeholder="e.g. React, Node.js, PostgreSQL"
                                            className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        />
                                        <button
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    product_technology: {
                                                        ...formData.product_technology,
                                                        tech_stack: addItem(
                                                            formData.product_technology.tech_stack,
                                                            techStackInput,
                                                            setTechStackInput
                                                        ),
                                                    },
                                                });
                                                setTechStackInput("");
                                            }}
                                            className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.product_technology.tech_stack.map((tech, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                            >
                                                {tech}
                                                <button
                                                    onClick={() =>
                                                        setFormData({
                                                            ...formData,
                                                            product_technology: {
                                                                ...formData.product_technology,
                                                                tech_stack: removeItem(
                                                                    formData.product_technology.tech_stack,
                                                                    idx
                                                                ),
                                                            },
                                                        })
                                                    }
                                                    className="text-white hover:text-red-300"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Data Strategy</label>
                                    <select
                                        value={formData.product_technology.data_strategy}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                product_technology: {
                                                    ...formData.product_technology,
                                                    data_strategy: e.target.value as any,
                                                },
                                            })
                                        }
                                        className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/30 focus:border-purple-500 focus:outline-none cursor-pointer"
                                        style={{ colorScheme: 'dark' }}
                                    >
                                        <option value="None" className="bg-slate-800 text-white">None</option>
                                        <option value="User Data" className="bg-slate-800 text-white">User Data</option>
                                        <option value="External APIs" className="bg-slate-800 text-white">External APIs</option>
                                        <option value="Proprietary" className="bg-slate-800 text-white">Proprietary</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-white mb-2">AI Usage</label>
                                    <select
                                        value={formData.product_technology.ai_usage}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                product_technology: {
                                                    ...formData.product_technology,
                                                    ai_usage: e.target.value as any,
                                                },
                                            })
                                        }
                                        className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/30 focus:border-purple-500 focus:outline-none cursor-pointer"
                                        style={{ colorScheme: 'dark' }}
                                    >
                                        <option value="None" className="bg-slate-800 text-white">None</option>
                                        <option value="Planned" className="bg-slate-800 text-white">Planned</option>
                                        <option value="In Production" className="bg-slate-800 text-white">In Production</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Tech Challenges</label>
                                    <textarea
                                        value={formData.product_technology.tech_challenges}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                product_technology: {
                                                    ...formData.product_technology,
                                                    tech_challenges: e.target.value,
                                                },
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        placeholder="Describe any technical challenges you're facing"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Section 1: Marketing & Growth */}
                        {currentSection === 1 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    Marketing & Growth
                                </h2>

                                <div>
                                    <label className="block text-white mb-2">Marketing Channels</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={channelInput}
                                            onChange={(e) => setChannelInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    setFormData({
                                                        ...formData,
                                                        marketing_growth: {
                                                            ...formData.marketing_growth,
                                                            current_marketing_channels: addItem(
                                                                formData.marketing_growth.current_marketing_channels,
                                                                channelInput,
                                                                setChannelInput
                                                            ),
                                                        },
                                                    });
                                                    setChannelInput("");
                                                }
                                            }}
                                            placeholder="e.g. Social Media, SEO, Email"
                                            className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        />
                                        <button
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    marketing_growth: {
                                                        ...formData.marketing_growth,
                                                        current_marketing_channels: addItem(
                                                            formData.marketing_growth.current_marketing_channels,
                                                            channelInput,
                                                            setChannelInput
                                                        ),
                                                    },
                                                });
                                                setChannelInput("");
                                            }}
                                            className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.marketing_growth.current_marketing_channels.map(
                                            (channel, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                                >
                                                    {channel}
                                                    <button
                                                        onClick={() =>
                                                            setFormData({
                                                                ...formData,
                                                                marketing_growth: {
                                                                    ...formData.marketing_growth,
                                                                    current_marketing_channels: removeItem(
                                                                        formData.marketing_growth.current_marketing_channels,
                                                                        idx
                                                                    ),
                                                                },
                                                            })
                                                        }
                                                        className="text-white hover:text-red-300"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Monthly Active Users</label>
                                    <input
                                        type="number"
                                        value={formData.marketing_growth.monthly_users}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                marketing_growth: {
                                                    ...formData.marketing_growth,
                                                    monthly_users: parseInt(e.target.value) || 0,
                                                },
                                            })
                                        }
                                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">
                                        Customer Acquisition Cost (CAC)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.marketing_growth.customer_acquisition_cost}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                marketing_growth: {
                                                    ...formData.marketing_growth,
                                                    customer_acquisition_cost: e.target.value,
                                                },
                                            })
                                        }
                                        placeholder="e.g. $50 per customer"
                                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Retention Strategy</label>
                                    <textarea
                                        value={formData.marketing_growth.retention_strategy}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                marketing_growth: {
                                                    ...formData.marketing_growth,
                                                    retention_strategy: e.target.value,
                                                },
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        placeholder="How do you retain users?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Growth Problems</label>
                                    <textarea
                                        value={formData.marketing_growth.growth_problems}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                marketing_growth: {
                                                    ...formData.marketing_growth,
                                                    growth_problems: e.target.value,
                                                },
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        placeholder="What are your biggest growth challenges?"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Section 2: Team & Organization */}
                        {currentSection === 2 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    Team & Organization
                                </h2>

                                <div>
                                    <label className="block text-white mb-2">Team Size</label>
                                    <input
                                        type="number"
                                        value={formData.team_organization.team_size}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                team_organization: {
                                                    ...formData.team_organization,
                                                    team_size: parseInt(e.target.value) || 0,
                                                },
                                            })
                                        }
                                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Founder Roles</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={roleInput}
                                            onChange={(e) => setRoleInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    setFormData({
                                                        ...formData,
                                                        team_organization: {
                                                            ...formData.team_organization,
                                                            founder_roles: addItem(
                                                                formData.team_organization.founder_roles,
                                                                roleInput,
                                                                setRoleInput
                                                            ),
                                                        },
                                                    });
                                                    setRoleInput("");
                                                }
                                            }}
                                            placeholder="e.g. CEO, CTO, CMO"
                                            className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        />
                                        <button
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    team_organization: {
                                                        ...formData.team_organization,
                                                        founder_roles: addItem(
                                                            formData.team_organization.founder_roles,
                                                            roleInput,
                                                            setRoleInput
                                                        ),
                                                    },
                                                });
                                                setRoleInput("");
                                            }}
                                            className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.team_organization.founder_roles.map((role, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                            >
                                                {role}
                                                <button
                                                    onClick={() =>
                                                        setFormData({
                                                            ...formData,
                                                            team_organization: {
                                                                ...formData.team_organization,
                                                                founder_roles: removeItem(
                                                                    formData.team_organization.founder_roles,
                                                                    idx
                                                                ),
                                                            },
                                                        })
                                                    }
                                                    className="text-white hover:text-red-300"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white mb-2">
                                        Hiring Plan (Next 3 Months)
                                    </label>
                                    <textarea
                                        value={formData.team_organization.hiring_plan_next_3_months}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                team_organization: {
                                                    ...formData.team_organization,
                                                    hiring_plan_next_3_months: e.target.value,
                                                },
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        placeholder="Who do you plan to hire?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">
                                        Organizational Challenges
                                    </label>
                                    <textarea
                                        value={formData.team_organization.org_challenges}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                team_organization: {
                                                    ...formData.team_organization,
                                                    org_challenges: e.target.value,
                                                },
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        placeholder="What organizational issues are you facing?"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Section 3: Competition & Market */}
                        {currentSection === 3 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    Competition & Market
                                </h2>

                                <div>
                                    <label className="block text-white mb-2">Known Competitors</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={competitorInput}
                                            onChange={(e) => setCompetitorInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    setFormData({
                                                        ...formData,
                                                        competition_market: {
                                                            ...formData.competition_market,
                                                            known_competitors: addItem(
                                                                formData.competition_market.known_competitors,
                                                                competitorInput,
                                                                setCompetitorInput
                                                            ),
                                                        },
                                                    });
                                                    setCompetitorInput("");
                                                }
                                            }}
                                            placeholder="Competitor name"
                                            className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        />
                                        <button
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    competition_market: {
                                                        ...formData.competition_market,
                                                        known_competitors: addItem(
                                                            formData.competition_market.known_competitors,
                                                            competitorInput,
                                                            setCompetitorInput
                                                        ),
                                                    },
                                                });
                                                setCompetitorInput("");
                                            }}
                                            className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.competition_market.known_competitors.map(
                                            (competitor, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                                >
                                                    {competitor}
                                                    <button
                                                        onClick={() =>
                                                            setFormData({
                                                                ...formData,
                                                                competition_market: {
                                                                    ...formData.competition_market,
                                                                    known_competitors: removeItem(
                                                                        formData.competition_market.known_competitors,
                                                                        idx
                                                                    ),
                                                                },
                                                            })
                                                        }
                                                        className="text-white hover:text-red-300"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Unique Advantage</label>
                                    <textarea
                                        value={formData.competition_market.unique_advantage}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                competition_market: {
                                                    ...formData.competition_market,
                                                    unique_advantage: e.target.value,
                                                },
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        placeholder="What makes you special?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Pricing Model</label>
                                    <input
                                        type="text"
                                        value={formData.competition_market.pricing_model}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                competition_market: {
                                                    ...formData.competition_market,
                                                    pricing_model: e.target.value,
                                                },
                                            })
                                        }
                                        placeholder="e.g. Freemium, Subscription, One-time"
                                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Market Risks</label>
                                    <textarea
                                        value={formData.competition_market.market_risks}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                competition_market: {
                                                    ...formData.competition_market,
                                                    market_risks: e.target.value,
                                                },
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        placeholder="What are the biggest risks to your business?"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Section 4: Finance & Runway */}
                        {currentSection === 4 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    Finance & Runway
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white mb-2">Monthly Burn Rate</label>
                                        <input
                                            type="text"
                                            value={formData.finance_runway.monthly_burn}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    finance_runway: {
                                                        ...formData.finance_runway,
                                                        monthly_burn: e.target.value,
                                                    },
                                                })
                                            }
                                            placeholder="e.g. $10,000"
                                            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white mb-2">Current Revenue</label>
                                        <input
                                            type="text"
                                            value={formData.finance_runway.current_revenue}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    finance_runway: {
                                                        ...formData.finance_runway,
                                                        current_revenue: e.target.value,
                                                    },
                                                })
                                            }
                                            placeholder="e.g. $2,000/mo"
                                            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Funding Status</label>
                                    <select
                                        value={formData.finance_runway.funding_status}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                finance_runway: {
                                                    ...formData.finance_runway,
                                                    funding_status: e.target.value as any,
                                                },
                                            })
                                        }
                                        className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/30 focus:border-purple-500 focus:outline-none cursor-pointer"
                                        style={{ colorScheme: 'dark' }}
                                    >
                                        <option value="Bootstrapped" className="bg-slate-800 text-white">Bootstrapped</option>
                                        <option value="Pre-seed" className="bg-slate-800 text-white">Pre-seed</option>
                                        <option value="Seed" className="bg-slate-800 text-white">Seed</option>
                                        <option value="Series A+" className="bg-slate-800 text-white">Series A+</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Runway (Months)</label>
                                    <input
                                        type="text"
                                        value={formData.finance_runway.runway_months}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                finance_runway: {
                                                    ...formData.finance_runway,
                                                    runway_months: e.target.value,
                                                },
                                            })
                                        }
                                        placeholder="e.g. 12 months"
                                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Financial Concerns</label>
                                    <textarea
                                        value={formData.finance_runway.financial_concerns}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                finance_runway: {
                                                    ...formData.finance_runway,
                                                    financial_concerns: e.target.value,
                                                },
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-400"
                                        placeholder="Any specific financial worries?"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={handleBack}
                            disabled={currentSection === 0}
                            className={`px-6 py-2 rounded-lg border border-white/30 text-white ${currentSection === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"
                                }`}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors"
                        >
                            {currentSection === sections.length - 1 ? "Choose Agent" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
