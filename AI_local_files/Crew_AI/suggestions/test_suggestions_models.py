"""
Unit tests for pydantic models and pure input-preparation logic.

These tests do NOT hit Groq/CrewAI - they only exercise validation and
data-transformation code that runs before any LLM call is made.
(manual_test_api.py and manual_test_pydantic.py are separate, existing
manual smoke-test scripts that require a live server/LLM - deliberately
named so pytest never auto-collects them; run directly with `python
manual_test_api.py` when a live server is up.)

Run with: python -m pytest test_suggestions_models.py -v
(from this project's root, so the "src" package resolves)
"""

import pytest
from pydantic import ValidationError

from models import (
    MarketingSuggestions,
    TechSuggestions,
    ProductTechnology,
    MarketingGrowth,
    TeamOrganization,
    CompetitionMarket,
    FinanceRunway,
    StartupInput,
    SuggestionsResults,
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


class TestMarketingSuggestionsValidator:
    def test_accepts_three_valid_suggestions(self):
        model = MarketingSuggestions(suggestions=["Do A.", "Do B.", "Do C."])
        assert len(model.suggestions) == 3

    def test_strips_whitespace_from_each_suggestion(self):
        model = MarketingSuggestions(suggestions=["  Do A.  ", "Do B.", "Do C."])
        assert model.suggestions[0] == "Do A."

    def test_filters_out_empty_and_blank_entries(self):
        model = MarketingSuggestions(suggestions=["Do A.", "", "   ", "Do B.", "Do C."])
        assert model.suggestions == ["Do A.", "Do B.", "Do C."]

    def test_rejects_empty_list(self):
        with pytest.raises(ValidationError):
            MarketingSuggestions(suggestions=[])

    def test_rejects_fewer_than_three_after_filtering_blanks(self):
        # 4 raw entries but only 2 are non-blank -> should fail the custom check
        with pytest.raises(ValidationError):
            MarketingSuggestions(suggestions=["Do A.", "", "   ", "Do B."])

    def test_rejects_more_than_seven_suggestions(self):
        with pytest.raises(ValidationError):
            MarketingSuggestions(suggestions=[f"Suggestion {i}." for i in range(8)])


class TestTechSuggestionsValidator:
    def test_same_validation_rules_as_marketing(self):
        with pytest.raises(ValidationError):
            TechSuggestions(suggestions=["Only one."])


class TestStartupInput:
    def test_valid_full_payload_builds(self):
        startup = make_startup_input()
        assert startup.product_technology.product_type == "SaaS"

    def test_rejects_invalid_product_type(self):
        with pytest.raises(ValidationError):
            make_startup_input(
                product_technology=ProductTechnology(
                    product_type="VR",
                    data_strategy="None",
                    ai_usage="None",
                )
            )


class TestSuggestionsResults:
    def test_defaults_are_independent_empty_lists(self):
        a = SuggestionsResults()
        b = SuggestionsResults()
        a.finance_suggestions.append("x")
        assert b.finance_suggestions == []


class TestAgentStatus:
    def test_rejects_invalid_status_literal(self):
        with pytest.raises(ValidationError):
            AgentStatus(
                agent_name="marketing_advisor",
                display_name="Marketing Advisor",
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

    def test_joins_list_fields_with_comma(self):
        startup = make_startup_input()
        inputs = prepare_inputs(startup)
        assert inputs["tech_stack"] == "React, Node.js"
