# fastapi_app.py

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import joblib
import pandas as pd

# ------------------------------
# Step 1: Initialize FastAPI app
# ------------------------------
app = FastAPI(
    title="Startup Success Predictor",
    version="1.0",
    description="Predict if a startup is likely to be Acquired or Closed based on key features."
)

# ------------------------------
# Step 2: Load trained pipeline
# ------------------------------
pipeline = joblib.load("xgb_pipeline.pkl")  # Make sure this file exists

# ------------------------------
# Step 3: Define input data model
# ------------------------------
class StartupData(BaseModel):
    relationships: int
    funding_rounds: int
    funding_total_usd: float
    milestones: int
    has_VC: int
    has_angel: int
    avg_participants: float
    startup_age: int
    execution_velocity: float
    rounds_per_year: float

# ------------------------------
# Step 4: Health check endpoint
# ------------------------------
@app.get("/")
def root():
    return {"message": "Startup Success Predictor API is running!"}

# ------------------------------
# Step 5: Single prediction endpoint
# ------------------------------
@app.post("/predict")
def predict_startup(data: StartupData):
    # Convert input to DataFrame
    input_df = pd.DataFrame([data.dict()])

    # Make prediction
    pred = int(pipeline.predict(input_df)[0])                  # convert numpy int64 to int
    pred_proba = float(pipeline.predict_proba(input_df)[0][1]) # convert numpy float32 to float

    # Map to label
    pred_label = "Acquired" if pred == 1 else "Closed"

    return {
        "prediction": pred_label,
        "probability_acquired": round(pred_proba, 4)
    }

# ------------------------------
# Step 6: Batch prediction endpoint
# ------------------------------
@app.post("/predict_batch")
def predict_batch(data: List[StartupData]):
    # Convert list of StartupData to DataFrame
    input_df = pd.DataFrame([item.dict() for item in data])

    # Make predictions
    preds = pipeline.predict(input_df)
    probs = pipeline.predict_proba(input_df)[:, 1]

    # Convert numpy arrays to JSON-safe lists
    preds_labels = ["Acquired" if int(p) == 1 else "Closed" for p in preds]
    probs_list = [round(float(p), 4) for p in probs]

    # Combine results
    results = []
    for label, prob in zip(preds_labels, probs_list):
        results.append({
            "prediction": label,
            "probability_acquired": prob
        })

    return {"results": results}
