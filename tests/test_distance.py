"""Tests du calcul de distance Haversine."""

import pytest

from modele.distance import calculer_distance_haversine


def test_distance_de_coordonnees_identiques():
	distance = calculer_distance_haversine(-4.3, 15.2, -4.3, 15.2)

	assert distance == pytest.approx(0.0)


def test_distance_haversine_est_ordonnee_de_111_km_pour_un_degre():
	distance = calculer_distance_haversine(0, 0, 1, 0)

	assert distance == pytest.approx(111.195, rel=1e-3)


@pytest.mark.parametrize(
	"coordonnees_invalides",
	[
		(91, 0, 0, 0),
		(0, 181, 0, 0),
		(None, 0, 0, 0),
		(0, 0, "invalide", 0),
	],
)
def test_distance_rejette_les_coordonnees_invalides(coordonnees_invalides):
	with pytest.raises(ValueError):
		calculer_distance_haversine(*coordonnees_invalides)
