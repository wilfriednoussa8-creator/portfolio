"""
Régression linéaire via scikit-learn.
Utilisé par le module AI Lab du Playground.
"""
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score


def fit_linear_regression(points: list[dict]) -> dict:
    """
    Ajuste une régression linéaire sur une liste de points {x, y}.
    Retourne la pente, l'ordonnée à l'origine, le R², et les points de la droite.
    """
    if len(points) < 2:
        raise ValueError("Il faut au moins 2 points pour calculer une régression.")

    X = np.array([[p["x"]] for p in points])
    y = np.array([p["y"] for p in points])

    model = LinearRegression()
    model.fit(X, y)

    y_pred = model.predict(X)
    r2 = r2_score(y, y_pred)

    slope = float(model.coef_[0])
    intercept = float(model.intercept_)

    # Deux points pour tracer la droite (x=0 et x=10, plage utilisée par le Playground)
    line_points = [
        {"x": 0, "y": slope * 0 + intercept},
        {"x": 10, "y": slope * 10 + intercept},
    ]

    return {
        "slope": slope,
        "intercept": intercept,
        "r2": float(r2),
        "line_points": line_points,
        "n_points": len(points),
    }


def predict(slope: float, intercept: float, x: float) -> float:
    """Prédit y pour une valeur x donnée, à partir d'un modèle déjà ajusté."""
    return slope * x + intercept


def generate_synthetic_data(n_points: int, noise: float) -> list[dict]:
    """Génère un jeu de données synthétique linéaire bruité, pour la démo."""
    true_slope = np.random.uniform(0.6, 1.4)
    true_intercept = np.random.uniform(1, 3)

    x_values = np.random.uniform(0, 10, n_points)
    y_values = true_slope * x_values + true_intercept + np.random.normal(0, noise, n_points)
    y_values = np.clip(y_values, 0, 10)

    return [{"x": float(x), "y": float(y)} for x, y in zip(x_values, y_values)]
