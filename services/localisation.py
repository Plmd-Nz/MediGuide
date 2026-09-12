"""Validation et gestion de la position du patient."""

from math import isfinite


def valider_position(latitude, longitude):
    """Retourne une position valide ou lève une erreur explicite."""
    try:
        latitude = float(latitude)
        longitude = float(longitude)
    except (TypeError, ValueError) as erreur:
        raise ValueError("La latitude et la longitude doivent être numériques.") from erreur

    if not isfinite(latitude) or not isfinite(longitude):
        raise ValueError("La position doit contenir des nombres finis.")
    if not -90 <= latitude <= 90:
        raise ValueError("La latitude doit être comprise entre -90 et 90.")
    if not -180 <= longitude <= 180:
        raise ValueError("La longitude doit être comprise entre -180 et 180.")

    return latitude, longitude


def obtenir_position_manuelle(latitude, longitude):
    """Valide une position saisie manuellement par l'utilisateur."""
    return valider_position(latitude, longitude)
