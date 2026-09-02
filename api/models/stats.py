"""
Génération de distributions statistiques et calcul de statistiques descriptives.
Utilisé par le module Data Lab du Playground.
"""
import numpy as np


def generate_distribution(dist_type: str, params: dict, n: int) -> list[float]:
    """
    Génère un échantillon aléatoire selon la loi demandée.

    dist_type: "normal" | "uniform" | "exponential"
    params: dict contenant les paramètres propres à chaque loi
    n: taille de l'échantillon
    """
    if dist_type == "normal":
        mean = params.get("mean", 0)
        std = params.get("std", 1)
        samples = np.random.normal(mean, std, n)

    elif dist_type == "uniform":
        low = params.get("min", 0)
        high = params.get("max", 5)
        samples = np.random.uniform(low, high, n)

    elif dist_type == "exponential":
        lam = params.get("lambda", 0.5)
        samples = np.random.exponential(1 / lam, n)

    else:
        raise ValueError(f"Distribution inconnue : {dist_type}")

    return samples.tolist()


def compute_descriptive_stats(samples: list[float]) -> dict:
    """Calcule moyenne, médiane, écart-type, min, max sur un échantillon."""
    arr = np.array(samples)

    return {
        "mean": float(np.mean(arr)),
        "median": float(np.median(arr)),
        "std": float(np.std(arr)),
        "min": float(np.min(arr)),
        "max": float(np.max(arr)),
    }


def compute_histogram(samples: list[float], bins: int = 20) -> dict:
    """Calcule les données d'histogramme (comptes par intervalle) pour le rendu côté client."""
    counts, bin_edges = np.histogram(samples, bins=bins)

    return {
        "counts": counts.tolist(),
        "bin_edges": bin_edges.tolist(),
    }
