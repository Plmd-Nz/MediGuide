"""Fonctions de normalisation des critères d'orientation."""

from math import isfinite


def normaliser_min_max(valeur, minimum, maximum):
	"""Ramène une valeur dans l'intervalle [0, 1] avec Min-Max."""
	try:
		valeur = float(valeur)
		minimum = float(minimum)
		maximum = float(maximum)
	except (TypeError, ValueError) as erreur:
		raise ValueError("Les valeurs à normaliser doivent être numériques.") from erreur

	if not all(isfinite(element) for element in (valeur, minimum, maximum)):
		raise ValueError("Les valeurs à normaliser doivent être finies.")

	if minimum > maximum:
		raise ValueError("Le minimum ne peut pas être supérieur au maximum.")

	if minimum == maximum:
		return 0.0

	return (valeur - minimum) / (maximum - minimum)


def normaliser_distances(distances):
	"""Normalise une collection de distances pour obtenir des coûts de proximité."""
	distances = [float(distance) for distance in distances]
	if not distances:
		return []

	if any(not isfinite(distance) for distance in distances):
		raise ValueError("Les distances doivent être numériques et finies.")

	if any(distance < 0 for distance in distances):
		raise ValueError("Une distance ne peut pas être négative.")

	minimum = min(distances)
	maximum = max(distances)
	return [
		normaliser_min_max(distance, minimum, maximum)
		for distance in distances
	]


def transformer_score_en_cout(score):
	"""Transforme un score de compatibilité [0, 1] en coût à minimiser."""
	try:
		score = float(score)
	except (TypeError, ValueError) as erreur:
		raise ValueError("Le score doit être numérique.") from erreur

	if not isfinite(score) or not 0 <= score <= 1:
		raise ValueError("Le score doit être compris entre 0 et 1.")

	return 1.0 - score
