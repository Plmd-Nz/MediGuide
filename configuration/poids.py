"""
Configuration centralisée des poids utilisés
dans le calcul du coût d'orientation.
"""

POIDS = {
    "distance": 0.20,
    "services": 0.20,
    "specialites": 0.20,
    "capacite": 0.20,
    "disponibilite": 0.20,
}


VALEURS_DISPONIBILITE = {
    "Très disponible": 1.00,
    "Disponible": 0.75,
    "Disponibilité limitée": 0.40,
    "Indisponible": 0.00,
}
