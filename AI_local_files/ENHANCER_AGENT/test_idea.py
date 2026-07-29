"""
Unit tests for pure logic in idea.py: pydantic model validation and the
should_retry state-machine transition. None of these tests call the LLM -
StartupIdeaEnhancer's constructor doesn't make network calls, so a dummy
API key is safe to use here.

Run with: python -m pytest test_idea.py -v
"""

import pytest
from pydantic import ValidationError

from idea import (
    MarketSize,
    Competitor,
    MVPScope,
    EnhancedStartupIdea,
    StartupIdeaEnhancer,
)


def make_valid_idea_kwargs(**overrides):
    defaults = dict(
        problem_statement="Students struggle to find good notes.",
        target_users="College students",
        solution="A note-sharing platform with AI summaries",
        value_proposition="Save time studying",
        key_assumptions=["Students will share notes"],
        feasibility_score=0.8,
        problem_clarity_score=0.7,
        user_specificity_score=0.6,
        market_type="B2C",
        differentiation_strength="MEDIUM",
        differentiation_explanation="Some competitors exist",
        assumption_risk_score=0.4,
        execution_complexity="MEDIUM",
        validation_readiness="READY_FOR_MVP",
        primary_risk_category="MARKET",
        ethical_legal_sensitivity_level="LOW",
        ethical_legal_sensitivity_explanation="No sensitive data",
        next_best_action="MVP_PROTOTYPE",
        market_size=MarketSize(tam="$1B", sam="$100M", som="$10M"),
        competitors=[
            Competitor(
                name="StudyBuddy",
                strengths="Popular",
                weaknesses="No AI",
                gaps="AI summaries",
            )
        ],
        founder_problem_fit=0.9,
        revenue_streams=["Subscriptions"],
        key_metrics=["MAU"],
        unfair_advantage="AI summarization",
        mvp_scope=MVPScope(core_features=["Upload notes"], build_complexity="1_MONTH"),
        customer_acquisition_channels=["Campus ambassadors"],
        desirability_score=0.7,
        viability_score=0.6,
    )
    defaults.update(overrides)
    return defaults


class TestEnhancedStartupIdeaModel:
    def test_valid_payload_builds(self):
        idea = EnhancedStartupIdea(**make_valid_idea_kwargs())
        assert idea.market_type == "B2C"

    def test_rejects_score_above_one(self):
        with pytest.raises(ValidationError):
            EnhancedStartupIdea(**make_valid_idea_kwargs(feasibility_score=1.5))

    def test_rejects_score_below_zero(self):
        with pytest.raises(ValidationError):
            EnhancedStartupIdea(**make_valid_idea_kwargs(viability_score=-0.1))

    def test_rejects_invalid_market_type(self):
        with pytest.raises(ValidationError):
            EnhancedStartupIdea(**make_valid_idea_kwargs(market_type="B2B2B2C"))

    def test_rejects_invalid_build_complexity(self):
        with pytest.raises(ValidationError):
            EnhancedStartupIdea(
                **make_valid_idea_kwargs(
                    mvp_scope=MVPScope(core_features=["x"], build_complexity="1_YEAR")
                )
            )


class TestShouldRetry:
    def _enhancer(self):
        # Dummy key: constructing ChatGroq doesn't hit the network, and
        # should_retry() never calls self.llm.
        return StartupIdeaEnhancer(groq_api_key="dummy-key-for-tests", max_retries=3)

    def _base_state(self, **overrides):
        state = {
            "raw_idea": "x",
            "normalized_idea": "x",
            "structured_idea": "{}",
            "validation_result": "",
            "validation_passed": False,
            "retry_count": 0,
            "final_output": {},
            "error": "",
        }
        state.update(overrides)
        return state

    def test_passes_validation_goes_to_enhance(self):
        enhancer = self._enhancer()
        state = self._base_state(validation_passed=True)
        assert enhancer.should_retry(state) == "enhance"

    def test_fails_validation_under_retry_limit_retries(self):
        enhancer = self._enhancer()
        state = self._base_state(validation_passed=False, retry_count=0)
        result = enhancer.should_retry(state)
        assert result == "retry"
        assert state["retry_count"] == 1  # incremented

    def test_fails_validation_at_retry_limit_ends(self):
        enhancer = self._enhancer()
        state = self._base_state(validation_passed=False, retry_count=3)
        result = enhancer.should_retry(state)
        assert result == "end"
        assert state["error"] == "Max retries reached"

    def test_retry_count_increments_each_call_until_limit(self):
        enhancer = self._enhancer()
        state = self._base_state(validation_passed=False, retry_count=0)

        for expected_count in range(1, enhancer.max_retries + 1):
            decision = enhancer.should_retry(state)
            if expected_count < enhancer.max_retries:
                assert decision == "retry"
                assert state["retry_count"] == expected_count
            # once retry_count reaches max_retries, next call ends instead
