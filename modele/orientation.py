"""Structures de données utilisées par le moteur d'orientation médicale."""

from dataclasses import dataclass, field

from modele.criteres import (
	calculer_score_capacite,
	calculer_score_capacite_affine,
	calculer_score_disponibilite,
	calculer_score_services,
	calculer_score_services_affine,
	calculer_score_specialites,
	calculer_score_specialites_affine,
)
from modele.cout import calculer_cout_orientation
from modele.distance import calculer_distance_haversine
from modele.filtrage_spatial import (
	LIBELLES_PORTEE,
	prefiltrer_structures_par_palier,
)
from modele.graphe import construire_graphe, obtenir_classement_dijkstra
from traitement.normalisation import (
	normaliser_distances,
	transformer_score_en_cout,
)


def _normaliser_liste(valeurs):
	"""Nettoie une collection de valeurs en conservant son ordre."""
	if valeurs is None:
		return tuple()

	if isinstance(valeurs, str):
		valeurs = valeurs.split(";")

	valeurs_normalisees = []
	for valeur in valeurs:
		valeur_normalisee = str(valeur).strip()
		if valeur_normalisee and valeur_normalisee not in valeurs_normalisees:
			valeurs_normalisees.append(valeur_normalisee)

	return tuple(valeurs_normalisees)


@dataclass(frozen=True)
class BesoinMedical:
	"""Décrit un besoin d'orientation sans poser de diagnostic médical."""

	besoin_medical: str
	services_recherches: tuple[str, ...] = field(default_factory=tuple)
	specialites_recherchees: tuple[str, ...] = field(default_factory=tuple)
	capacites_recherchees: tuple[str, ...] = field(default_factory=tuple)

	def __post_init__(self):
		besoin = str(self.besoin_medical).strip()
		if not besoin:
			raise ValueError("Le besoin médical d'orientation ne peut pas être vide.")

		object.__setattr__(self, "besoin_medical", besoin)
		object.__setattr__(
			self,
			"services_recherches",
			_normaliser_liste(self.services_recherches),
		)
		object.__setattr__(
			self,
			"specialites_recherchees",
			_normaliser_liste(self.specialites_recherchees),
		)
		object.__setattr__(
			self,
			"capacites_recherchees",
			_normaliser_liste(self.capacites_recherchees),
		)


def _convertir_enregistrements(donnees):
	"""Convertit une liste de structures ou un DataFrame en dictionnaires."""
	if hasattr(donnees, "to_dict"):
		return donnees.to_dict(orient="records")
	return [dict(enregistrement) for enregistrement in donnees]


def obtenir_recommandations(
	donnees,
	latitude_patient,
	longitude_patient,
	besoin,
	nombre_recommandations=3,
	filtrage_spatial=True,
):
	"""Produit un classement explicable de structures adaptées au besoin."""
	if not isinstance(besoin, BesoinMedical):
		raise TypeError("Le besoin doit être une instance de BesoinMedical.")
	if nombre_recommandations < 1:
		raise ValueError("Le nombre de recommandations doit être positif.")

	enregistrements = _convertir_enregistrements(donnees)
	if not enregistrements:
		return []

	palier_atteint = "direct"

	# Pré-filtrage spatial progressif si des provinces sont présentes dans le dataset
	a_provinces = any(bool(s.get("province")) for s in enregistrements)
	if filtrage_spatial and a_provinces:
		structures_evaluees, palier_atteint = prefiltrer_structures_par_palier(
			enregistrements,
			latitude_patient,
			longitude_patient,
			besoin,
		)
	else:
		structures_evaluees = []
		for structure in enregistrements:
			score_capacite = calculer_score_capacite(
				structure.get("capacite_prise_en_charge"),
				besoin.capacites_recherchees,
			)
			if besoin.capacites_recherchees and score_capacite == 0.0:
				continue

			try:
				distance_km = calculer_distance_haversine(
					latitude_patient,
					longitude_patient,
					structure.get("lat"),
					structure.get("lon"),
				)
			except ValueError:
				continue

			score_capacite_affine = calculer_score_capacite_affine(
				structure.get("capacite_prise_en_charge"),
				besoin.capacites_recherchees,
				lits=structure.get("capacite_lits"),
			)
			structures_evaluees.append({
				**structure,
				"distance_km": distance_km,
				"score_services": calculer_score_services_affine(
					structure.get("services"), besoin.services_recherches
				),
				"score_specialites": calculer_score_specialites_affine(
					structure.get("specialites"), besoin.specialites_recherchees
				),
				"score_capacite": score_capacite_affine,
				"score_disponibilite": calculer_score_disponibilite(
					structure.get("disponibilite")
				),
			})

	if not structures_evaluees:
		return []

	couts_distance = normaliser_distances(
		[structure["distance_km"] for structure in structures_evaluees]
	)

	for structure, cout_distance in zip(structures_evaluees, couts_distance):
		structure["cout_distance"] = cout_distance
		structure["cout_services"] = transformer_score_en_cout(
			structure["score_services"]
		)
		structure["cout_specialites"] = transformer_score_en_cout(
			structure["score_specialites"]
		)
		structure["cout_capacite"] = transformer_score_en_cout(
			structure["score_capacite"]
		)
		structure["cout_disponibilite"] = transformer_score_en_cout(
			structure["score_disponibilite"]
		)
		structure["cout_orientation"] = calculer_cout_orientation(
			structure["cout_distance"],
			structure["cout_services"],
			structure["cout_specialites"],
			structure["cout_capacite"],
			structure["cout_disponibilite"],
		)
		structure["identifiant"] = structure.get("grid3id")
		structure["portee_spatiale"] = palier_atteint
		structure["libelle_portee"] = LIBELLES_PORTEE.get(palier_atteint, "Recherche directe")

	graphe = construire_graphe(structures_evaluees)
	classement = obtenir_classement_dijkstra(
		graphe,
		nombre_recommandations=nombre_recommandations,
	)

	for recommandation in classement:
		recommandation["portee_spatiale"] = palier_atteint
		recommandation["libelle_portee"] = LIBELLES_PORTEE.get(palier_atteint, "Recherche directe")

	return classement


def expliquer_recommandation(recommandation):
	"""Produit une explication textuelle à partir des critères calculés."""
	nom = recommandation.get("essnom1") or recommandation.get("structure") or (
		recommandation.get("identifiant") or "Structure sans nom"
	)
	explication = (
		f"{nom} est classée au rang {recommandation['rang']} avec une distance de "
		f"{recommandation['distance_km']:.2f} km. "
		f"Scores : services {recommandation['score_services']:.2f}, "
		f"spécialités {recommandation['score_specialites']:.2f}, "
		f"capacité {recommandation['score_capacite']:.2f}, "
		f"disponibilité {recommandation['score_disponibilite']:.2f}. "
		f"Son coût d'orientation est de {recommandation['cout_orientation']:.3f}."
	)
	if recommandation.get("libelle_portee") and recommandation.get("libelle_portee") != "Recherche directe":
		explication += f" Portée : {recommandation['libelle_portee']}."

	localisation = []
	for colonne, libelle in (
		("province", "province"),
		("localite", "localité"),
		("zonesante", "zone de santé"),
		("airesante", "aire de santé"),
		("lat", "latitude"),
		("lon", "longitude"),
	):
		valeur = recommandation.get(colonne)
		if valeur:
			localisation.append(f"{libelle} : {valeur}")

	if localisation:
		explication += " Localisation : " + ", ".join(localisation) + "."

	return explication
