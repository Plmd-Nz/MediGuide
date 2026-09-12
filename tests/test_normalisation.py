"""Tests de la normalisation des critères."""

import pytest

from traitement.normalisation import (
	normaliser_distances,
	normaliser_min_max,
	transformer_score_en_cout,
)


def test_normaliser_min_max():
	assert normaliser_min_max(5, 0, 10) == 0.5


def test_normaliser_distances_favorise_la_distance_la_plus_courte():
	assert normaliser_distances([10, 20, 30]) == [0.0, 0.5, 1.0]


def test_normaliser_distances_identiques_retourne_zero_pour_toutes():
	assert normaliser_distances([12, 12]) == [0.0, 0.0]


def test_transformer_score_en_cout_inverse_le_score():
	assert transformer_score_en_cout(0.75) == 0.25


@pytest.mark.parametrize("valeur", [-1, 2, "inconnu"])
def test_transformer_score_rejette_une_valeur_hors_intervalle(valeur):
	with pytest.raises(ValueError):
		transformer_score_en_cout(valeur)