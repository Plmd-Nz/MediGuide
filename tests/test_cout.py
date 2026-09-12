"""Tests du coût multicritère d'orientation."""

import pytest

from modele.cout import calculer_cout_orientation


def test_cout_est_nul_pour_des_criteres_parfaits():
	cout = calculer_cout_orientation(0, 0, 0, 0, 0)

	assert cout == 0.0


def test_cout_est_un_pour_des_criteres_defavorables():
	cout = calculer_cout_orientation(1, 1, 1, 1, 1)

	assert cout == 1.0


def test_cout_utilise_les_poids_fournis():
	poids = {
		"distance": 1,
		"services": 0,
		"specialites": 0,
		"capacite": 0,
		"disponibilite": 0,
	}

	assert calculer_cout_orientation(0.4, 1, 1, 1, 1, poids) == 0.4


def test_cout_rejette_un_critere_hors_intervalle():
	with pytest.raises(ValueError):
		calculer_cout_orientation(1.1, 0, 0, 0, 0)