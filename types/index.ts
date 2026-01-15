// Core type definitions for the AI Startup Orchestration Platform

export interface Project {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    createdAt: string;
    updatedAt: string;
    idea: string;
    aiAnalysis?: AIAnalysis;
    marketInsights?: MarketInsight[];
    team?: TeamMember[];
    documents?: Document[];
    automationLogs?: AutomationLog[];
}

export type ProjectStatus =
    | "ideation"
    | "analyzing"
    | "planning"
    | "in-progress"
    | "completed"
    | "paused";

export interface AIAnalysis {
    id: string;
    projectId: string;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    viabilityScore: number; // 0-100
    marketFitScore: number; // 0-100
    innovationScore: number; // 0-100
    recommendations: Recommendation[];
    generatedAt: string;
}

export interface Recommendation {
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: "technical" | "business" | "market" | "team";
}

export interface MarketInsight {
    id: string;
    type: "trend" | "competitor" | "opportunity" | "risk";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    source?: string;
    confidence: number; // 0-100
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    expertise: string[];
    avatar?: string;
    bio: string;
    aiGenerated: boolean;
    skills: Skill[];
}

export interface Skill {
    name: string;
    level: number; // 0-100
}

export interface Document {
    id: string;
    title: string;
    type: "business-plan" | "pitch-deck" | "technical-spec" | "market-research" | "financial-model";
    description: string;
    createdAt: string;
    fileSize?: string;
    downloadUrl?: string;
}

export interface AutomationLog {
    id: string;
    timestamp: string;
    action: string;
    status: "success" | "pending" | "failed" | "in-progress";
    details: string;
    duration?: number; // in seconds
    metadata?: Record<string, any>;
}

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: string;
}

// Animation-related types
export interface AnimationVariant {
    hidden: any;
    visible: any;
    exit?: any;
}

export interface ScrollAnimationConfig {
    threshold?: number;
    triggerOnce?: boolean;
    rootMargin?: string;
}
