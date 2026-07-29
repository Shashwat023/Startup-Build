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
    AgentWeaknessOutput,
    ProductTechnology,
    MarketingGrowth,
    TeamOrganization,
    CompetitionMarket,
    FinanceRunway,
    StartupInput,
    WeaknessesResults,
    AgentStatus,
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


class TestAgentWeaknessOutput:
    def test_accepts_three_to_five_weaknesses(self):
        output = AgentWeaknessOutput(
            agent_name="Marketing",
            weaknesses=["Weakness one.", "Weakness two.", "Weakness three."],
        )
        assert len(output.weaknesses) == 3

    def test_rejects_fewer_than_three_weaknesses(self):
        with pytest.raises(ValidationError):
            AgentWeaknessOutput(
                agent_name="Marketing",
                weaknesses=["Only one.", "Only two."],
            )

    def test_rejects_more_than_five_weaknesses(self):
        with pytest.raises(ValidationError):
            AgentWeaknessOutput(
                agent_name="Marketing",
                weaknesses=[f"Weakness {i}." for i in range(6)],
            )


class TestStartupInput:
    def test_valid_full_payload_builds(self):
        startup = make_startup_input()
        assert startup.product_technology.product_type == "SaaS"

    def test_rejects_invalid_ai_usage(self):
        with pytest.raises(ValidationError):
            make_startup_input(
                product_technology=ProductTechnology(
                    product_type="SaaS",
                    data_strategy="None",
                    ai_usage="Fully Autonomous",
                )
            )


class TestWeaknessesResults:
    def test_defaults_are_independent_empty_lists(self):
        a = WeaknessesResults()
        b = WeaknessesResults()
        a.tech_weaknesses.append("x")
        assert b.tech_weaknesses == []


class TestAgentStatus:
    def test_rejects_invalid_status_literal(self):
        with pytest.raises(ValidationError):
            AgentStatus(
                agent_name="finance_advisor",
                display_name="Finance Advisor",
                status="unknown",
            )


class TestPrepareInputs:
    def test_returns_all_expected_keys(self):
        startup = make_startup_input()
        inputs = prepare_inputs(startup)

        expected_keys = {
            "marketing_channels",
            "monthly_users",
            "product_type",
            "team_size",
            "competitors",
            "funding_status",
        }
        assert expected_keys.issubset(inputs.keys())

    def test_empty_strings_fall_back_to_placeholder_text(self):
        startup = make_startup_input(
            finance_runway=FinanceRunway(funding_status="Seed", monthly_burn="")
        )
        inputs = prepare_inputs(startup)
        assert inputs["monthly_burn"] == "Not tracked"
