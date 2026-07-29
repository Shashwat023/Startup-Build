"""
Unit tests for the Startup Success Predictor FastAPI service.

Run with: python -m pytest test_main.py -v
(from within this directory, so the relative "xgb_pipeline.pkl" load in main.py resolves)
"""

import pytest
from fastapi.testclient import TestClient

from main import app, StartupData

client = TestClient(app)

VALID_PAYLOAD = {
    "relationships": 5,
    "funding_rounds": 3,
    "funding_total_usd": 1000000.0,
    "milestones": 10,
    "has_VC": 1,
    "has_angel": 0,
    "avg_participants": 4.0,
    "startup_age": 2,
    "execution_velocity": 0.8,
    "rounds_per_year": 1.5,
}


def test_root_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Startup Success Predictor API is running!"}


def test_predict_valid_payload_returns_expected_shape():
    response = client.post("/predict", json=VALID_PAYLOAD)
    assert response.status_code == 200

    data = response.json()
    assert "prediction" in data
    assert "probability_acquired" in data
    assert data["prediction"] in ("Acquired", "Closed")
    assert 0.0 <= data["probability_acquired"] <= 1.0


def test_predict_missing_field_returns_422():
    incomplete_payload = dict(VALID_PAYLOAD)
    del incomplete_payload["relationships"]

    response = client.post("/predict", json=incomplete_payload)
    assert response.status_code == 422


def test_predict_wrong_type_returns_422():
    bad_payload = dict(VALID_PAYLOAD)
    bad_payload["funding_total_usd"] = "not-a-number"

    response = client.post("/predict", json=bad_payload)
    assert response.status_code == 422


def test_predict_batch_returns_one_result_per_input():
    batch_payload = [VALID_PAYLOAD, VALID_PAYLOAD]

    response = client.post("/predict_batch", json=batch_payload)
    assert response.status_code == 200

    data = response.json()
    assert "results" in data
    assert len(data["results"]) == 2
    for result in data["results"]:
        assert result["prediction"] in ("Acquired", "Closed")
        assert 0.0 <= result["probability_acquired"] <= 1.0


def test_predict_batch_empty_list_returns_empty_results():
    response = client.post("/predict_batch", json=[])
    assert response.status_code == 200
    assert response.json() == {"results": []}


def test_startup_data_model_accepts_valid_fields():
    model = StartupData(**VALID_PAYLOAD)
    assert model.relationships == 5
    assert model.has_VC == 1


def test_startup_data_model_rejects_missing_field():
    incomplete_payload = dict(VALID_PAYLOAD)
    del incomplete_payload["startup_age"]

    with pytest.raises(Exception):
        StartupData(**incomplete_payload)
