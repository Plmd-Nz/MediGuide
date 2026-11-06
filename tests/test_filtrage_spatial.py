"""Tests de la hiérarchie de pré-filtrage spatial progressif."""

import pytest

from modele.orientation import BesoinMedical, obtenir_recommandations
from modele.filtrage_spatial import (
    calculer_score_adequation,
    identifier_contexte_patient,
    prefiltrer_structures_par_palier,
)


def test_score_adequation_medicale_totale():
    besoin = BesoinMedical(
        "fracture",
        capacites_recherchees=("Fractures",),
        services_recherches=("Urgences",),
        specialites_recherchees=("Traumatologie",),
    )
    structure_parfaite = {
        "capacite_prise_en_charge": "Fractures",
        "services": "Urgences",
        "specialites": "Traumatologie",
    }
    assert calculer_score_adequation(structure_parfaite, besoin) == 1.0


def test_score_adequation_medicale_partielle():
    besoin = BesoinMedical(
        "fracture",
        capacites_recherchees=("Fractures",),
        services_recherches=("Urgences",),
        specialites_recherchees=("Traumatologie",),
    )
    # Ne dispose que des urgences, pas de traumatologie ni fractures
    structure_partielle = {
        "capacite_prise_en_charge": "Fièvre",
        "services": "Urgences",
        "specialites": "Médecine générale",
    }
    score = calculer_score_adequation(structure_partielle, besoin)
    assert 0.30 <= score <= 0.35


def test_palier_1_se_limite_a_la_ville_si_adequation_suffisante():
    """Vérifie que la recherche s'arrête à la ville si une structure locale dépasse 80 %."""
    structures = [
        # Structure dans la ville (distance ~2 km) avec adéquation 100%
        {
            "grid3id": "cs_ville",
            "essnom1": "Centre de Santé Urbain",
            "province": "Sud-Kivu",
            "zonesante": "Ibanda",
            "lat": -2.50,
            "lon": 28.86,
            "services": "Maternité; Soins infirmiers",
            "specialites": "Obstétrique",
            "capacite_prise_en_charge": "Accouchement; Grossesse",
            "disponibilite": "Disponible",
        },
        # Grand hôpital provincial plus loin (distance ~80 km)
        {
            "grid3id": "hgr_province",
            "essnom1": "Hôpital Provincial",
            "province": "Sud-Kivu",
            "zonesante": "Uvira",
            "lat": -3.20,
            "lon": 29.14,
            "services": "Maternité; Urgences; Chirurgie",
            "specialites": "Obstétrique; Gynécologie",
            "capacite_prise_en_charge": "Accouchement; Grossesse",
            "disponibilite": "Très disponible",
        },
    ]

    besoin = BesoinMedical(
        "accouchement",
        capacites_recherchees=("Accouchement",),
        services_recherches=("Maternité",),
    )

    recommandations = obtenir_recommandations(
        structures,
        latitude_patient=-2.502,
        longitude_patient=28.862,
        besoin=besoin,
        nombre_recommandations=3,
    )

    assert len(recommandations) >= 1
    assert recommandations[0]["identifiant"] == "cs_ville"
    assert recommandations[0]["portee_spatiale"] == "ville"


def test_escalade_vers_la_province_si_ville_insuffisante():
    """Si la ville n'a qu'un dispensaire insuffisant (<80%), on escalade vers la province."""
    structures = [
        # Dispensaire local (dans la ville, mais sans chirurgie ni traumatologie)
        {
            "grid3id": "dispensaire_local",
            "essnom1": "Dispensaire Local",
            "province": "Sud-Kivu",
            "zonesante": "Kabare",
            "lat": -2.45,
            "lon": 28.80,
            "services": "Soins infirmiers",
            "specialites": "Médecine générale",
            "capacite_prise_en_charge": "Plaies",
            "disponibilite": "Disponible",
        },
        # Hôpital de référence dans la province (distance ~45 km) avec bloc chirurgical
        {
            "grid3id": "hgr_provincial",
            "essnom1": "HGR Provincial de Référence",
            "province": "Sud-Kivu",
            "zonesante": "Bukavu",
            "lat": -2.50,
            "lon": 28.85,
            "services": "Urgences; Chirurgie; Hospitalisation",
            "specialites": "Chirurgie générale; Traumatologie",
            "capacite_prise_en_charge": "Fractures; Traumatismes; Interventions chirurgicales",
            "disponibilite": "Très disponible",
        },
    ]

    besoin = BesoinMedical(
        "chirurgie urgente",
        capacites_recherchees=("Interventions chirurgicales",),
        services_recherches=("Chirurgie",),
        specialites_recherchees=("Chirurgie générale",),
    )

    recommandations = obtenir_recommandations(
        structures,
        latitude_patient=-2.20, # Patient en zone rurale de Kabare (hors rayon 25 km de Bukavu)
        longitude_patient=28.50,
        besoin=besoin,
        nombre_recommandations=3,
    )

    assert len(recommandations) >= 1
    assert recommandations[0]["identifiant"] == "hgr_provincial"
    assert recommandations[0]["portee_spatiale"] == "province"


def test_escalade_interprovinciale_si_province_insuffisante():
    """Si la province du patient n'a pas la spécialité, on élargit aux provinces limitrophes."""
    structures = [
        # Poste de santé dans la province d'origine (Maniema)
        {
            "grid3id": "ps_maniema",
            "essnom1": "Poste de Santé Kindu",
            "province": "Maniema",
            "zonesante": "Kindu",
            "lat": -2.95,
            "lon": 25.95,
            "services": "Soins infirmiers",
            "specialites": "Médecine générale",
            "capacite_prise_en_charge": "Paludisme",
            "disponibilite": "Disponible",
        },
        # Grand centre spécialisé dans la province voisine du Sud-Kivu (~290 km)
        {
            "grid3id": "hopital_voisin",
            "essnom1": "Grand Centre Spécialisé Voisin",
            "province": "Sud-Kivu",
            "zonesante": "Ibanda",
            "lat": -2.50,
            "lon": 28.86,
            "services": "Urgences; Chirurgie; Scanner",
            "specialites": "Neurochirurgie",
            "capacite_prise_en_charge": "Maladies neurologiques",
            "disponibilite": "Très disponible",
        },
    ]

    besoin = BesoinMedical(
        "neurochirurgie",
        capacites_recherchees=("Maladies neurologiques",),
        specialites_recherchees=("Neurochirurgie",),
    )

    recommandations = obtenir_recommandations(
        structures,
        latitude_patient=-2.94,
        longitude_patient=25.96, # Patient à Kindu (Maniema)
        besoin=besoin,
        nombre_recommandations=3,
    )

    assert len(recommandations) >= 1
    assert recommandations[0]["identifiant"] == "hopital_voisin"
    assert recommandations[0]["portee_spatiale"] == "interprovincial"
