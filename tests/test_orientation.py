"""Tests de la représentation du besoin médical."""

import pytest

from modele.orientation import (
	BesoinMedical,
	expliquer_recommandation,
	obtenir_recommandations,
)
from modele.besoins import analyser_saisie_utilisateur, obtenir_besoins_disponibles
from modele.graphe import construire_graphe, obtenir_classement_dijkstra


def test_besoin_medical_normalise_les_listes():
	besoin = BesoinMedical(
		"  Traumatisme ",
		services_recherches="Urgences; Urgences",
		specialites_recherchees=["Traumatologie", " Traumatologie "],
		capacites_recherchees="Fractures; Plaies",
	)

	assert besoin.besoin_medical == "Traumatisme"
	assert besoin.services_recherches == ("Urgences",)
	assert besoin.specialites_recherchees == ("Traumatologie",)
	assert besoin.capacites_recherchees == ("Fractures", "Plaies")


def test_besoin_medical_rejette_un_besoin_vide():
	with pytest.raises(ValueError):
		BesoinMedical("   ")


def test_dijkstra_classe_les_structures_par_cout_croissant():
	graphe = construire_graphe([
		{"grid3id": "structure_b", "cout_orientation": 0.7},
		{"grid3id": "structure_a", "cout_orientation": 0.2},
	])

	classement = obtenir_classement_dijkstra(graphe)

	assert [element["identifiant"] for element in classement] == [
		"structure_a",
		"structure_b",
	]
	assert [element["rang"] for element in classement] == [1, 2]


def test_dijkstra_respecte_le_top_demande():
	graphe = construire_graphe([
		{"grid3id": "a", "cout_orientation": 0.1},
		{"grid3id": "b", "cout_orientation": 0.2},
		{"grid3id": "c", "cout_orientation": 0.3},
	])

	classement = obtenir_classement_dijkstra(graphe, nombre_recommandations=2)

	assert len(classement) == 2


def test_graphe_rejette_un_cout_negatif():
	with pytest.raises(ValueError):
		construire_graphe([{"grid3id": "a", "cout_orientation": -0.1}])


def test_obtenir_recommandations_execute_le_pipeline_complet():
	donnees = [
		{
			"grid3id": "structure_proche",
			"essnom1": "Structure proche",
			"lat": 0,
			"lon": 0.01,
			"services": "Urgences",
			"specialites": "Traumatologie",
			"capacite_prise_en_charge": "Fractures",
			"disponibilite": "Disponible",
		},
		{
			"grid3id": "structure_lointaine",
			"essnom1": "Structure lointaine",
			"lat": 1,
			"lon": 1,
			"services": "Urgences",
			"specialites": "Traumatologie",
			"capacite_prise_en_charge": "Fractures",
			"disponibilite": "Disponible",
		},
		{
			"grid3id": "structure_incompatible",
			"lat": 0,
			"lon": 0.001,
			"services": "Urgences",
			"specialites": "Pédiatrie",
			"capacite_prise_en_charge": "Fièvre",
			"disponibilite": "Très disponible",
		},
	]

	classement = obtenir_recommandations(
		donnees,
		0,
		0,
		BesoinMedical(
			"Fracture",
			services_recherches="Urgences",
			specialites_recherchees="Traumatologie",
			capacites_recherchees="Fractures",
		),
	)

	assert len(classement) == 2
	assert classement[0]["identifiant"] == "structure_proche"
	assert classement[0]["rang"] == 1
	assert "score_services" in classement[0]
	assert "cout_orientation" in classement[0]


def test_obtenir_recommandations_retourne_vide_sans_structure_compatible():
	classement = obtenir_recommandations(
		[{
			"grid3id": "structure_a",
			"lat": 0,
			"lon": 0,
			"capacite_prise_en_charge": "Fièvre",
		}],
		0,
		0,
		BesoinMedical("Fracture", capacites_recherchees="Fractures"),
	)

	assert classement == []


def test_expliquer_recommandation_conserve_les_criteres():
	recommandation = {
		"essnom1": "Structure A",
		"rang": 1,
		"distance_km": 2.5,
		"score_services": 1.0,
		"score_specialites": 0.5,
		"score_capacite": 1.0,
		"score_disponibilite": 0.75,
		"cout_orientation": 0.2,
	}

	explication = expliquer_recommandation(recommandation)

	assert "Structure A" in explication
	assert "2.50 km" in explication
	assert "coût d'orientation" in explication


def test_analyser_saisie_reconnait_plusieurs_besoins():
	besoin, categories = analyser_saisie_utilisateur(
		"J'ai des maux des tête, une fracture et besoin d'une opération abbominale",
		{
			"Maladies neurologiques",
			"Fractures",
			"Interventions chirurgicales",
		},
	)

	assert categories == ("fracture", "maux de tete", "operation abdominale")
	assert besoin.capacites_recherchees == (
		"Fractures",
		"Maladies neurologiques",
		"Interventions chirurgicales",
	)


def test_obtenir_besoins_disponibles_voit_les_valeurs_du_dataset():
	valeurs = obtenir_besoins_disponibles([
		{"capacite_prise_en_charge": "Fractures; Fièvre"},
		{"capacite_prise_en_charge": "Fièvre"},
	])

	assert valeurs == ["Fièvre", "Fractures"]
