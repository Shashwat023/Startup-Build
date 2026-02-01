// Common startup input types (matching backend Pydantic models)

export interface ProductTechnology {
    product_type: "Web" | "Mobile" | "SaaS" | "Hardware" | "AI";
    current_features: string[];
    tech_stack: string[];
    data_strategy: "None" | "User Data" | "External APIs" | "Proprietary";
    ai_usage: "None" | "Planned" | "In Production";
    tech_challenges: string;
}

export interface MarketingGrowth {
    current_marketing_channels: string[];
    monthly_users: number;
    customer_acquisition_cost: string;
    retention_strategy: string;
    growth_problems: string;
}

export interface TeamOrganization {
    team_size: number;
    founder_roles: string[];
    hiring_plan_next_3_months: string;
    org_challenges: string;
}

export interface CompetitionMarket {
    known_competitors: string[];
    unique_advantage: string;
    pricing_model: string;
    market_risks: string;
}

export interface FinanceRunway {
    monthly_burn: string;
    current_revenue: string;
    funding_status: "Bootstrapped" | "Angel" | "Seed" | "Series A";
    runway_months: string;
    financial_concerns: string;
}

export interface StartupInput {
    product_technology: ProductTechnology;
    marketing_growth: MarketingGrowth;
    team_organization: TeamOrganization;
    competition_market: CompetitionMarket;
    finance_runway: FinanceRunway;
}

// Agent-specific result types

export interface RoadmapResults {
    marketing_roadmap: string[];
    tech_roadmap: string[];
    org_hr_roadmap: string[];
    competitive_roadmap: string[];
    finance_roadmap: string[];
}

export interface StrengthsResults {
    marketing_strengths: string[];
    tech_strengths: string[];
    org_hr_strengths: string[];
    competitive_strengths: string[];
    finance_strengths: string[];
}

export interface WeaknessesResults {
    marketing_weaknesses: string[];
    tech_weaknesses: string[];
    org_hr_weaknesses: string[];
    competitive_weaknesses: string[];
    finance_weaknesses: string[];
}

export interface SuggestionsResults {
    marketing_suggestions: string[];
    tech_suggestions: string[];
    org_hr_suggestions: string[];
    competitive_suggestions: string[];
    finance_suggestions: string[];
}

// Common API response envelope

export interface CrewAnalysisResponse<T> {
    analysis_id: string;
    agent: "next-month-roadmap" | "strengths" | "weaknesses" | "suggestions";
    status: "completed" | "processing" | "failed" | "queued";
    submitted_at: string;
    completed_at?: string;
    result?: T;
    error?: string;
}

// Submission request type
export interface CrewAnalysisRequest {
    startup_data: StartupInput;
}

// Pipeline progress types (for sequential execution)
export type AgentStatusType = "pending" | "running" | "cooling_down" | "completed" | "failed" | "retrying";
export type PipelineStatusType = "queued" | "running" | "completed" | "failed";

export interface AgentStatus {
    agent_name: string;
    display_name: string;
    status: AgentStatusType;
    started_at?: string;
    completed_at?: string;
    cooldown_remaining?: number;
    attempt: number;
    error?: string;
    result?: string[];
}

export interface PipelineStatus {
    analysis_id: string;
    pipeline_status: PipelineStatusType;
    current_agent?: string;
    current_phase?: "running" | "cooling_down";
    agents: AgentStatus[];
    started_at?: string;
    completed_at?: string;
    total_cooldown_seconds: number;
}

// Extended response with pipeline info
export interface CrewAnalysisResponseWithPipeline<T> extends CrewAnalysisResponse<T> {
    pipeline?: PipelineStatus;
    stream_url?: string;
    message?: string;
}
