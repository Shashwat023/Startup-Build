from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class ProductTechnology(BaseModel):
    product_type: Literal["Web", "Mobile", "SaaS", "Hardware", "AI"]
    current_features: List[str] = Field(default_factory=list)
    tech_stack: List[str] = Field(default_factory=list)
    data_strategy: Literal["None", "User Data", "External APIs", "Proprietary"]
    ai_usage: Literal["None", "Planned", "In Production"]
    tech_challenges: str = ""


class MarketingGrowth(BaseModel):
    current_marketing_channels: List[str] = Field(default_factory=list)
    monthly_users: int = 0
    customer_acquisition_cost: str = ""
    retention_strategy: str = ""
    growth_problems: str = ""


class TeamOrganization(BaseModel):
    team_size: int = 0
    founder_roles: List[str] = Field(default_factory=list)
    hiring_plan_next_3_months: str = ""
    org_challenges: str = ""


class CompetitionMarket(BaseModel):
    known_competitors: List[str] = Field(default_factory=list)
    unique_advantage: str = ""
    pricing_model: str = ""
    market_risks: str = ""


class FinanceRunway(BaseModel):
    monthly_burn: str = ""
    current_revenue: str = ""
    funding_status: Literal["Bootstrapped", "Angel", "Seed", "Series A"]
    runway_months: str = ""
    financial_concerns: str = ""


class StartupInput(BaseModel):
    product_technology: ProductTechnology
    marketing_growth: MarketingGrowth
    team_organization: TeamOrganization
    competition_market: CompetitionMarket
    finance_runway: FinanceRunway


# Pydantic models for structured LLM output
class AgentRoadmap(BaseModel):
    """Structured output model for agent roadmap."""
    agent_name: str = Field(description="Name of the agent")
    next_month_roadmap: List[str] = Field(description="List of 4 weekly action items")


class RoadmapResults(BaseModel):
    """Complete roadmap results from all agents."""
    marketing_roadmap: List[str] = Field(default_factory=list, description="Marketing weekly roadmap")
    tech_roadmap: List[str] = Field(default_factory=list, description="Tech weekly roadmap")
    org_hr_roadmap: List[str] = Field(default_factory=list, description="Org/HR weekly roadmap")
    competitive_roadmap: List[str] = Field(default_factory=list, description="Competitive analysis weekly roadmap")
    finance_roadmap: List[str] = Field(default_factory=list, description="Finance weekly roadmap")


class AgentStatus(BaseModel):
    """Status of a single agent in the pipeline."""
    agent_name: str
    display_name: str
    status: Literal["pending", "running", "cooling_down", "completed", "failed", "retrying"]
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    cooldown_remaining: Optional[int] = None
    attempt: int = 1
    error: Optional[str] = None
    result: Optional[List[str]] = None


class PipelineStatus(BaseModel):
    """Full pipeline execution status."""
    analysis_id: str
    pipeline_status: Literal["queued", "running", "completed", "failed"]
    current_agent: Optional[str] = None
    current_phase: Optional[Literal["running", "cooling_down"]] = None
    agents: List[AgentStatus] = []
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    total_cooldown_seconds: int = 15


class AnalysisResult(BaseModel):
    """Complete analysis result with metadata."""
    analysis_id: str
    status: str
    submitted_at: str
    completed_at: Optional[str] = None
    result: Optional[RoadmapResults] = None
    error: Optional[str] = None
    pipeline: Optional[PipelineStatus] = None
