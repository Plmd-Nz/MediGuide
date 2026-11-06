"""Tests ciblés des services applicatifs SIOM."""

import pandas as pd
import pytest

from services.generation_reponse import formater_recommandation
from services.interpretation_besoin import (
    interpreter_demande_gemini,
    interpreter_demande_locale,
)
from services.localisation import valider_position
from modele.orientation import obtenir_recommandations
from traitement.nettoyage import nettoyer_dataset


def test_position_manuelle_est_validee():
    assert valider_position("-4.3", "15.2") == (-4.3, 15.2)


def test_position_invalide_est_rejetee():
    with pytest.raises(ValueError):
        valider_position(95, 15)


def test_recommandation_contient_la_localisation():
    texte = formater_recommandation({
        "rang": 1,
        "essnom1": "Structure A",
        "distance_km": 2.5,
        "cout_orientation": 0.2,
        "disponibilite": "Disponible",
        "province": "Kinshasa",
        "localite": "Makelele",
    })

    assert "Structure A" in texte
    assert "Kinshasa" in texte
    assert "Makelele" in texte


class FauxClientGemini:
    """Client simulé pour tester la validation sans appel réseau."""

    def interpreter(self, texte, categories_autorisees):
        return {
            "besoins": [{
                "categorie": "fracture",
                "capacites": ["Fractures", "Capacite inventee"],
                "services": ["Urgences"],
                "specialites": ["Traumatologie"],
            }]
        }


def test_interpretation_gemini_filtre_les_capacites_inconnues():
    besoin, categories = interpreter_demande_gemini(
        "J'ai une fracture",
        [{"capacite_prise_en_charge": "Fractures"}],
        client=FauxClientGemini(),
    )

    assert categories == ("fracture",)
    assert besoin.capacites_recherchees == ("Fractures",)


def test_interpretation_gemini_rejette_une_reponse_sans_capacite_connue():
    class ClientInvalide(FauxClientGemini):
        def interpreter(self, texte, categories_autorisees):
            return {"besoins": [{"capacites": ["Inconnue"]}]}

    with pytest.raises(ValueError):
        interpreter_demande_gemini(
            "demande",
            [{"capacite_prise_en_charge": "Fractures"}],
            client=ClientInvalide(),
        )


def test_interpretation_locale_reconnait_cholera_et_orl():
    donnees = pd.read_csv("donnees/dataset_prepare/dataset_prepare.csv", encoding="utf-8")

    besoin, categories = interpreter_demande_locale("j'ai un choléra et un problème ORL", donnees)

    assert any(motif in c.casefold() for c in besoin.capacites_recherchees for motif in ("choléra", "cholera"))
    assert "ORL" in besoin.services_recherches
    assert categories


def test_demandes_naturelles_du_dataset_produisent_des_recommandations():
    donnees = nettoyer_dataset(
        pd.read_csv("donnees/dataset_prepare/dataset_prepare.csv", encoding="utf-8")
    )
    demandes = (
        "J'ai besoin d'une consultation générale",
        "Je souffre de malaria",
        "J'ai un problème ORL avec de la fièvre",
        "Je suis enceinte et j'ai besoin d'un suivi de grossesse",
        "Mon enfant a des difficultés respiratoires et des douleurs digestives",
    )

    for demande in demandes:
        besoin, _ = interpreter_demande_locale(demande, donnees)
        recommandations = obtenir_recommandations(
            donnees,
            -2.5,
            28.86,
            besoin,
            nombre_recommandations=3,
        )
        assert recommandations
