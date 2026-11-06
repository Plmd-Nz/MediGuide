"""Calcul explicable des critères d'orientation médicale."""

import unicodedata

from configuration.poids import VALEURS_DISPONIBILITE


def _normaliser_chaine(texte):
	"""Supprime les accents, uniformise en minuscules et nettoie les espaces."""
	texte = unicodedata.normalize("NFKD", str(texte).casefold().strip())
	return "".join(caractere for caractere in texte if not unicodedata.combining(caractere))


def _convertir_en_ensemble(valeurs):
	"""Convertit une chaîne ou une collection en ensemble de valeurs nettoyées sans accents."""
	if valeurs is None:
		return set()

	if isinstance(valeurs, str):
		valeurs = valeurs.split(";")

	return {
		_normaliser_chaine(valeur)
		for valeur in valeurs
		if _normaliser_chaine(valeur)
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
	if disponibilite is None:
		return 0.0
	valeur_norm = _normaliser_chaine(disponibilite)
	for cle, score in VALEURS_DISPONIBILITE.items():
		if _normaliser_chaine(cle) == valeur_norm:
			return score
	return VALEURS_DISPONIBILITE.get(str(disponibilite).strip(), 0.0)


def calculer_score_services_affine(services_disponibles, services_recherches):
	"""Calcule un score de services nuancé tenant compte du plateau technique."""
	base = calculer_score_compatibilite(services_disponibles, services_recherches)
	if base == 0.0:
		return 0.0
	services_set = _convertir_en_ensemble(services_disponibles)
	facteur_plateau = min(1.0, len(services_set) / 10.0)
	return round(base * (0.72 + 0.26 * facteur_plateau), 3)


def calculer_score_specialites_affine(specialites_disponibles, specialites_recherchees):
	"""Calcule un score de spécialités nuancé tenant compte de l'équipe médicale."""
	base = calculer_score_compatibilite(specialites_disponibles, specialites_recherchees)
	if base == 0.0:
		return 0.0
	spec_set = _convertir_en_ensemble(specialites_disponibles)
	facteur_equipe = min(1.0, len(spec_set) / 8.0)
	return round(base * (0.70 + 0.28 * facteur_equipe), 3)


def calculer_score_capacite_affine(capacites_disponibles, capacites_recherchees, lits=None):
	"""Calcule un score de capacité nuancé tenant compte de la capacité litière."""
	base = calculer_score_compatibilite(capacites_disponibles, capacites_recherchees)
	if base == 0.0:
		return 0.0
	try:
		nb_lits = float(lits) if lits is not None and str(lits).strip() != "" else 20.0
	except (ValueError, TypeError):
		nb_lits = 20.0
	facteur_lits = min(1.0, max(nb_lits, 4.0) / 250.0)
	return round(base * (0.65 + 0.33 * facteur_lits), 3)
