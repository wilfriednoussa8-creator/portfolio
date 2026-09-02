"""
API FastAPI pour le portfolio de Wilfried.
Sert les modèles mathématiques et de Machine Learning utilisés
par le Playground (AI Lab, Data Lab).

Lancer en local :
    uvicorn app:app --reload --port 8000

Documentation interactive auto-générée disponible sur :
    http://localhost:8000/docs
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from models.regression import fit_linear_regression, predict, generate_synthetic_data
from models.stats import generate_distribution, compute_descriptive_stats, compute_histogram

app = FastAPI(
    title="Wilfried Portfolio API",
    description="API Machine Learning / Mathématiques appliquées pour le Playground du portfolio.",
    version="1.0.0",
)

# CORS : autorise le frontend (servi par Live Server ou un autre domaine) à appeler l'API.
# En production, remplacer "*" par le vrai domaine du portfolio.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# SCHÉMAS DE DONNÉES (Pydantic)
# ============================================
class Point(BaseModel):
    x: float
    y: float


class RegressionRequest(BaseModel):
    points: list[Point]


class GenerateDataRequest(BaseModel):
    n_points: int = Field(default=15, ge=3, le=100)
    noise: float = Field(default=1.0, ge=0, le=5)


class PredictRequest(BaseModel):
    slope: float
    intercept: float
    x: float


class DistributionRequest(BaseModel):
    dist_type: str  # "normal" | "uniform" | "exponential"
    params: dict
    n: int = Field(default=500, ge=10, le=5000)


# ============================================
# ENDPOINTS — AI LAB (régression)
# ============================================
@app.post("/api/regression")
def compute_regression(request: RegressionRequest):
    """Calcule une régression linéaire (scikit-learn) sur les points fournis."""
    try:
        points_dict = [p.model_dump() for p in request.points]
        result = fit_linear_regression(points_dict)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/regression/generate")
def generate_data(request: GenerateDataRequest):
    """Génère un jeu de données synthétique pour la démo de régression."""
    data = generate_synthetic_data(request.n_points, request.noise)
    return {"points": data}


@app.post("/api/regression/predict")
def predict_value(request: PredictRequest):
    """Prédit y pour une valeur x, à partir d'un modèle déjà ajusté."""
    y_pred = predict(request.slope, request.intercept, request.x)
    return {"x": request.x, "y_predicted": y_pred}


# ============================================
# ENDPOINTS — DATA LAB (distributions)
# ============================================
@app.post("/api/distribution")
def get_distribution(request: DistributionRequest):
    """Génère un échantillon selon la loi demandée et retourne stats + histogramme."""
    try:
        samples = generate_distribution(request.dist_type, request.params, request.n)
        stats = compute_descriptive_stats(samples)
        histogram = compute_histogram(samples)
        return {"stats": stats, "histogram": histogram, "n": len(samples)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# HEALTHCHECK
# ============================================
@app.get("/")
def root():
    return {"status": "ok", "message": "API du portfolio de Wilfried — voir /docs pour la documentation."}
