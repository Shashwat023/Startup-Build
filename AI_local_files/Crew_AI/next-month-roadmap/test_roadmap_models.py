"""
Unit tests for pydantic models and pure input-preparation logic.

These tests do NOT hit Groq/CrewAI - they only exercise validation and
data-transformation code that runs before any LLM call is made.

Run with: python -m pytest test_models.py -v
(from this project's root, so the "src" package resolves)
"""

import pytest
from pydantic import ValidationError

from models import (
    ProductTechnology,
    MarketingGrowth,
    TeamOrganization,
    CompetitionMarket,
    FinanceRunway,
    StartupInput,
    AgentRoadmap,
    RoadmapResults,
    AgentStatus,
    PipelineStatus,
)
from main import prepare_inputs


def make_startup_input(**overrides) -> StartupInput:
    defaults = dict(
        product_technology=ProductTechnology(
            product_type="SaaS",
            current_features=["Dashboard", "Analytics"],
            tech_stack=["React", "Node.js"],
            data_strategy="User Data",
            ai_usage="Planned",
            tech_challenges="Scaling issues",
        ),
        marketing_growth=MarketingGrowth(
            current_marketing_channels=["SEO", "LinkedIn"],
            monthly_users=1000,
            customer_acquisition_cost="$50",
            retention_strategy="Email campaigns",
            growth_problems="High churn",
        ),
        team_organization=TeamOrganization(
            team_size=5,
            founder_roles=["CEO", "CTO"],
            hiring_plan_next_3_months="2 engineers",
            org_challenges="Remote coordination",
        ),
        competition_market=CompetitionMarket(
            known_competitors=["Competitor A"],
            unique_advantage="AI-powered",
            pricing_model="Freemium",
            market_risks="Large competitors",
        ),
        finance_runway=FinanceRunway(
            monthly_burn="$50,000",
            current_revenue="$10,000 MRR",
            funding_status="Seed",
            runway_months="12",
            financial_concerns="Need better unit economics",
        ),
    )
    defaults.update(overrides)
    return StartupInput(**defaults)


class TestProductTechnology:
    def test_accepts_valid_product_type(self):
        pt = ProductTechnology(
            product_type="AI",
            data_strategy="None",
            ai_usage="None",
        )
        assert pt.product_type == "AI"
        assert pt.current_features == []  # default_factory list

    def test_rejects_invalid_product_type(self):
        with pytest.raises(ValidationError):
            ProductTechnology(
                product_type="Blockchain",  # not in the Literal
                data_strategy="None",
                ai_usage="None",
            )

    def test_rejects_invalid_data_strategy(self):
        with pytest.raises(ValidationError):
            ProductTechnology(
                product_type="Web",
                data_strategy="Something Else",
                ai_usage="None",
            )


class TestFinanceRunway:
    def test_rejects_invalid_funding_status(self):
        with pytest.raises(ValidationError):
            FinanceRunway(funding_status="Series Z")

    def test_accepts_valid_funding_status(self):
        fr = FinanceRunway(funding_status="Bootstrapped")
        assert fr.funding_status == "Bootstrapped"


class TestStartupInput:
    def test_valid_full_payload_builds(self):
        startup = make_startup_input()
        assert startup.product_technology.product_type == "SaaS"
        assert startup.finance_runway.funding_status == "Seed"

    def test_missing_required_section_raises(self):
        with pytest.raises(ValidationError):
            StartupInput(
                marketing_growth=MarketingGrowth(),
                team_organization=TeamOrganization(),
                competition_market=CompetitionMarket(),
                finance_runway=FinanceRunway(funding_status="Seed"),
            )


class TestAgentRoadmap:
    def test_valid_agent_roadmap(self):
        roadmap = AgentRoadmap(
            agent_name="Marketing",
            next_month_roadmap=["Week 1", "Week 2", "Week 3", "Week 4"],
        )
        assert len(roadmap.next_month_roadmap) == 4


class TestRoadmapResults:
    def test_defaults_are_empty_lists(self):
        results = RoadmapResults()
        assert results.marketing_roadmap == []
        assert results.finance_roadmap == []

    def test_lists_are_independent_instances(self):
        # default_factory=list must not share a mutable default across instances
        a = RoadmapResults()
        b = RoadmapResults()
        a.marketing_roadmap.append("x")
        assert b.marketing_roadmap == []


class TestAgentStatus:
    def test_rejects_invalid_status_literal(self):
        with pytest.raises(ValidationError):
            AgentStatus(agent_name="tech_lead", display_name="Tech Lead", status="done")

    def test_accepts_valid_status(self):
        status = AgentStatus(
            agent_name="tech_lead", display_name="Tech Lead", status="completed"
        )
        assert status.attempt == 1  # default


class TestPipelineStatus:
    def test_default_agents_list_is_empty(self):
        pipeline = PipelineStatus(analysis_id="abc123", pipeline_status="queued")
        assert pipeline.agents == []
        assert pipeline.total_cooldown_seconds == 15


class TestPrepareInputs:
    def test_returns_all_expected_keys(self):
        startup = make_startup_input()
        inputs = prepare_inputs(startup)

        expected_keys = {
            "marketing_channels",
            "monthly_users",
            "cac",
            "retention_strategy",
            "growth_problems",
            "product_type",
            "current_features",
            "tech_stack",
            "data_strategy",
            "ai_usage",
            "tech_challenges",
            "team_size",
            "founder_roles",
            "hiring_plan",
            "org_challenges",
            "competitors",
            "unique_advantage",
            "pricing_model",
            "market_risks",
            "monthly_burn",
            "current_revenue",
            "funding_status",
            "runway_months",
            "financial_concerns",
        }
        assert expected_keys.issubset(inputs.keys())

    def test_joins_list_fields_with_comma(self):
        startup = make_startup_input()
        inputs = prepare_inputs(startup)
        assert inputs["marketing_channels"] == "SEO, LinkedIn"
        assert inputs["founder_roles"] == "CEO, CTO"

    def test_empty_lists_fall_back_to_placeholder_text(self):
        startup = make_startup_input(
            marketing_growth=MarketingGrowth(
                current_marketing_channels=[],
                monthly_users=0,
            )
        )
        inputs = prepare_inputs(startup)
        assert inputs["marketing_channels"] == "None specified"

    def test_empty_strings_fall_back_to_placeholder_text(self):
        startup = make_startup_input(
            finance_runway=FinanceRunway(funding_status="Seed", monthly_burn="")
        )
        inputs = prepare_inputs(startup)
        assert inputs["monthly_burn"] == "Not tracked"

    def test_numeric_fields_are_stringified(self):
        startup = make_startup_input(
            marketing_growth=MarketingGrowth(monthly_users=4200)
        )
        inputs = prepare_inputs(startup)
        assert inputs["monthly_users"] == "4200"
        assert isinstance(inputs["monthly_users"], str)
