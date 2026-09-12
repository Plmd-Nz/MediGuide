"""Calcul explicable des critères d'orientation médicale."""

from configuration.poids import VALEURS_DISPONIBILITE


def _convertir_en_ensemble(valeurs):
	"""Convertit une chaîne ou une collection en ensemble de valeurs nettoyées."""
	if valeurs is None:
		return set()

	if isinstance(valeurs, str):
		valeurs = valeurs.split(";")

	return {
		str(valeur).strip().casefold()
		for valeur in valeurs
		if str(valeur).strip()
	}


def calculer_score_compatibilite(valeurs_disponibles, valeurs_recherchees):
	"""Calcule la proportion des valeurs recherchées disponibles dans la structure."""
	valeurs_recherchees = _convertir_en_ensemble(valeurs_recherchees)
	if not valeurs_recherchees:
		return 0.0

	valeurs_disponibles = _convertir_en_ensemble(valeurs_disponibles)
	valeurs_trouvees = valeurs_disponibles.intersection(valeurs_recherchees)
	return len(valeurs_trouvees) / len(valeurs_recherchees)


def calculer_score_services(services_disponibles, services_recherches):
	"""Calcule l'adéquation entre les services recherchés et disponibles."""
	return calculer_score_compatibilite(services_disponibles, services_recherches)


def calculer_score_specialites(specialites_disponibles, specialites_recherchees):
	"""Calcule l'adéquation entre les spécialités recherchées et disponibles."""
	return calculer_score_compatibilite(
		specialites_disponibles,
		specialites_recherchees,
	)


def calculer_score_capacite(capacites_disponibles, capacites_recherchees):
	"""Calcule l'adéquation entre les capacités et le besoin d'orientation."""
	return calculer_score_compatibilite(
		capacites_disponibles,
		capacites_recherchees,
	)


def calculer_score_disponibilite(disponibilite):
	"""Convertit une disponibilité connue en score, sinon retourne zéro."""
	valeur = str(disponibilite).strip() if disponibilite is not None else ""
	return VALEURS_DISPONIBILITE.get(valeur, 0.0)
