"""Calcul du coût multicritère d'orientation médicale."""

from math import isfinite

from configuration.poids import POIDS


CRITERES_COUT = (
	"distance",
	"services",
	"specialites",
	"capacite",
	"disponibilite",
)


def _valider_cout(valeur, nom_critere):
	"""Vérifie qu'un coût normalisé est compris entre zéro et un."""
	try:
		valeur = float(valeur)
	except (TypeError, ValueError) as erreur:
		raise ValueError(
			f"Le coût du critère {nom_critere} doit être numérique."
		) from erreur

	if not isfinite(valeur) or not 0 <= valeur <= 1:
		raise ValueError(
			f"Le coût du critère {nom_critere} doit être compris entre 0 et 1."
		)

	return valeur


def calculer_cout_orientation(
	cout_distance,
	cout_services,
	cout_specialites,
	cout_capacite,
	cout_disponibilite,
	poids=None,
):
	"""Combine cinq coûts normalisés avec les poids de configuration."""
	couts = {
		"distance": cout_distance,
		"services": cout_services,
		"specialites": cout_specialites,
		"capacite": cout_capacite,
		"disponibilite": cout_disponibilite,
	}
	poids_utilises = dict(POIDS if poids is None else poids)

	criteres_manquants = set(CRITERES_COUT).difference(poids_utilises)
	if criteres_manquants:
		raise ValueError(
			"Poids manquants : " + ", ".join(sorted(criteres_manquants))
		)

	for critere in CRITERES_COUT:
		try:
			poids_utilises[critere] = float(poids_utilises[critere])
		except (TypeError, ValueError) as erreur:
			raise ValueError(
				f"Le poids du critère {critere} doit être numérique."
			) from erreur
		if not isfinite(poids_utilises[critere]) or poids_utilises[critere] < 0:
			raise ValueError(f"Le poids du critère {critere} doit être positif ou nul.")

	somme_poids = sum(poids_utilises[critere] for critere in CRITERES_COUT)
	if somme_poids <= 0:
		raise ValueError("La somme des poids doit être strictement positive.")

	return sum(
		poids_utilises[critere] * _valider_cout(couts[critere], critere)
		for critere in CRITERES_COUT
	) / somme_poids
