# 🚀 Startup Success Predictor

A machine learning-powered API that predicts whether a startup is likely to be **Acquired** or **Closed** based on key business metrics and features.

## 🎯 Overview

This project uses **XGBoost** classifier to predict startup success based on various features including funding data, team metrics, and business milestones. The model is deployed as a REST API using **FastAPI**, making it easy to integrate into applications.

### Key Highlights

- **ROC-AUC Score**: Optimized for high accuracy
- **Hyperparameter Tuning**: RandomizedSearchCV for optimal performance
- **Production-Ready API**: Built with FastAPI
- **Scalable**: Supports both single and batch predictions

## ✨ Features

### Machine Learning
- XGBoost-based classification model
- Automated hyperparameter optimization
- Class imbalance handling with `scale_pos_weight`
- Feature engineering for enhanced predictions

### API Capabilities
- Single startup prediction
- Batch predictions for multiple startups
- Probability scores for risk assessment
- Interactive API documentation (Swagger UI)
- JSON-based input/output

### Feature Set
The model uses the following features:
- `relationships`: Number of professional relationships
- `funding_rounds`: Total number of funding rounds
- `funding_total_usd`: Total funding received in USD
- `milestones`: Number of key milestones achieved
- `has_VC`: Venture capital backing (0/1)
- `has_angel`: Angel investor backing (0/1)
- `avg_participants`: Average participants per funding round
- `startup_age`: Age of the startup in years
- `execution_velocity`: Milestones achieved per year
- `rounds_per_year`: Funding rounds per year

## 📊 Dataset

The dataset includes startup information with features related to:
- **Funding metrics**: Total funding, number of rounds, investor types
- **Performance indicators**: Milestones, relationships, execution velocity
- **Company demographics**: Age, investor participation
- **Target variable**: Status (Acquired = 1, Closed = 0)

### Class Distribution
- Acquired: 64.7%
- Closed: 35.3%

## 📈 Model Performance

The model demonstrates strong predictive capabilities:
- **Algorithm**: XGBoost Classifier
- **Optimization**: RandomizedSearchCV with 25 iterations
- **Cross-Validation**: 5-fold stratified CV
- **Metric**: ROC-AUC score
- **Handling Imbalance**: Scale_pos_weight adjustment

## 🛠️ Installation

### Prerequisites
- Python 3.11 (recommended) or 3.8-3.10
- pip package manager

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/vardan201/Startupr_Future_Prediction_Model.git
cd Startupr_Future_Prediction_Model
```

2. **Create a virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Train the model** (if not already trained)
```bash
python train_model.py
```

5. **Run the API**
```bash
uvicorn fastapi_app:app --reload
```

The API will be available at `http://localhost:8000`

## 🚀 Usage

### Interactive API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Single Prediction (Python)

```python
import requests

url = "http://localhost:8000/predict"

data = {
    "relationships": 5,
    "funding_rounds": 3,
    "funding_total_usd": 5000000.0,
    "milestones": 8,
    "has_VC": 1,
    "has_angel": 1,
    "avg_participants": 4.5,
    "startup_age": 3,
    "execution_velocity": 2.67,
    "rounds_per_year": 1.0
}

response = requests.post(url, json=data)
print(response.json())
```

**Response:**
```json
{
    "prediction": "Acquired",
    "probability_acquired": 0.8524
}
```

### Batch Prediction (cURL)

```bash
curl -X POST "http://localhost:8000/predict_batch" \
-H "Content-Type: application/json" \
-d '[
    {
        "relationships": 5,
        "funding_rounds": 3,
        "funding_total_usd": 5000000.0,
        "milestones": 8,
        "has_VC": 1,
        "has_angel": 1,
        "avg_participants": 4.5,
        "startup_age": 3,
        "execution_velocity": 2.67,
        "rounds_per_year": 1.0
    },
    {
        "relationships": 2,
        "funding_rounds": 1,
        "funding_total_usd": 500000.0,
        "milestones": 2,
        "has_VC": 0,
        "has_angel": 1,
        "avg_participants": 2.0,
        "startup_age": 1,
        "execution_velocity": 2.0,
        "rounds_per_year": 1.0
    }
]'
```

## 📚 API Documentation

### Endpoints

#### `GET /`
Health check endpoint

**Response:**
```json
{
    "message": "Startup Success Predictor API is running!"
}
```

#### `POST /predict`
Predict outcome for a single startup

**Request Body:**
```json
{
    "relationships": 5,
    "funding_rounds": 3,
    "funding_total_usd": 5000000.0,
    "milestones": 8,
    "has_VC": 1,
    "has_angel": 1,
    "avg_participants": 4.5,
    "startup_age": 3,
    "execution_velocity": 2.67,
    "rounds_per_year": 1.0
}
```

**Response:**
```json
{
    "prediction": "Acquired",
    "probability_acquired": 0.8524
}
```

#### `POST /predict_batch`
Predict outcomes for multiple startups

**Request Body:** Array of startup data objects

**Response:**
```json
{
    "results": [
        {
            "prediction": "Acquired",
            "probability_acquired": 0.8524
        },
        {
            "prediction": "Closed",
            "probability_acquired": 0.3241
        }
    ]
}
```

## 🌐 Deployment

### Deploy to Render

1. **Create `runtime.txt`** in project root:
```txt
python-3.11.7
```

2. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

3. **Configure Render**:
   - Create new Web Service
   - Connect your GitHub repository
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn fastapi_app:app --host 0.0.0.0 --port $PORT`

4. **Deploy**: Render will automatically build and deploy your application

### Environment Variables (Optional)

Set these in your deployment platform if needed:
- `MODEL_PATH`: Path to the trained model file (default: `xgb_pipeline.pkl`)

## 📁 Project Structure

```
Startupr_Future_Prediction_Model/
│
├── fastapi_app.py              # FastAPI application
├── train_model.py              # Model training script
├── xgb_pipeline.pkl            # Trained model (generated)
├── startup_final_dataset.csv   # Processed dataset
├── startup data.csv            # Raw dataset
│
├── requirements.txt            # Python dependencies
├── runtime.txt                 # Python version for deployment
├── README.md                   # Project documentation
│
└── notebooks/                  # Jupyter notebooks (optional)
    ├── EDA.ipynb              # Exploratory Data Analysis
    └── feature_engineering.ipynb
```

## 🧪 Model Training Pipeline

The training process includes:

1. **Data Preprocessing**
   - Date conversion and feature extraction
   - Startup age calculation
   - Feature engineering (velocity, rounds per year)

2. **Feature Engineering**
   - `execution_velocity`: Milestones per year
   - `rounds_per_year`: Funding rounds per year
   - Removal of redundant and high-leakage features

3. **Model Training**
   - Train-test split (80-20)
   - Stratified sampling
   - StandardScaler for feature normalization
   - XGBoost with hyperparameter tuning

4. **Evaluation**
   - ROC-AUC score
   - Classification report
   - Cross-validation scores

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Setup

```bash
# Install development dependencies
pip install -r requirements.txt

# Run tests (if available)
pytest tests/

# Format code
black .
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**⭐ If you find this project useful, please consider giving it a star!**
