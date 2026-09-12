"""Tests du nettoyage et de la validation des données SIOM."""

import pandas as pd

from traitement.nettoyage import nettoyer_dataset
from traitement.validation import valider_dataset


def creer_donnees_exemple():
    """Construit un tableau représentatif du format source."""
    return pd.DataFrame({
        "lat": ["-4,338311667"],
        "lon": ["15,27582667"],
        "precision": ["9,3"],
        "services": ["Urgences; Urgences; Laboratoire"],
        "specialites": ["Traumatologie; Pédiatrie"],
        "capacite_prise_en_charge": ["Fractures"],
        "disponibilites": ["Disponible"],
    })


def test_nettoyage_convertit_coordonnees_et_normalise_listes():
    donnees = nettoyer_dataset(creer_donnees_exemple())

    assert donnees.loc[0, "lat"] == -4.338311667
    assert donnees.loc[0, "lon"] == 15.27582667
    assert donnees.loc[0, "disponibilite"] == "Disponible"
    assert donnees.loc[0, "services"] == "Urgences; Laboratoire"


def test_validation_detecte_coordonnees_invalides():
    donnees = nettoyer_dataset(creer_donnees_exemple())
    donnees.loc[0, "lat"] = 95

    rapport = valider_dataset(donnees)

    assert rapport["latitudes_hors_limites"] == 1
    assert rapport["valide"] is False