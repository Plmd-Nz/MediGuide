"""Tests des critères d'orientation médicale."""

import pytest

from modele.criteres import (
	calculer_score_capacite,
	calculer_score_disponibilite,
	calculer_score_services,
	calculer_score_specialites,
)


def test_score_services_mesure_la_proportion_recherchee():
	score = calculer_score_services(
		"Urgences; Laboratoire",
		["Urgences", "Maternité"],
	)

	assert score == pytest.approx(0.5)


def test_score_specialites_est_nul_si_la_specialite_est_absente():
	score = calculer_score_specialites("Pédiatrie; Radiologie", "Traumatologie")

	assert score == 0.0


def test_score_capacite_accepte_une_capacite_parmi_plusieurs():
	score = calculer_score_capacite("Fractures; Plaies", ["Fractures"])

	assert score == 1.0


@pytest.mark.parametrize(
	"disponibilite, score_attendu",
	[
		("Très disponible", 1.0),
		("Disponible", 0.75),
		("Disponibilité limitée", 0.40),
		("Indisponible", 0.0),
		("Valeur inconnue", 0.0),
		(None, 0.0),
	],
)
def test_score_disponibilite_est_explicite(disponibilite, score_attendu):
	assert calculer_score_disponibilite(disponibilite) == score_attendu


def test_score_compatibilite_est_nul_sans_valeur_recherchee():
	assert calculer_score_services("Urgences", []) == 0.0
