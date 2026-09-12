"""Fonctions de validation des données du projet SIOM."""

import pandas as pd


COLONNES_OBLIGATOIRES = {
	"province", "prov_uid", "zonesante", "zs_uid", "localite", "essnom1",
	"esstype", "lat", "lon", "grid3id", "services", "specialites",
	"capacite_prise_en_charge", "disponibilite",
}

VALEURS_DISPONIBILITE = {
	"Très disponible", "Disponible", "Disponibilité limitée", "Indisponible",
}


def obtenir_colonnes_manquantes(donnees):
	"""Retourne les colonnes indispensables absentes du tableau."""
	return sorted(COLONNES_OBLIGATOIRES.difference(donnees.columns))


def valider_coordonnees(donnees):
	"""Retourne les erreurs liées aux coordonnées géographiques."""
	erreurs = {}

	for colonne, minimum, maximum, nom in (
		("lat", -90, 90, "latitudes"),
		("lon", -180, 180, "longitudes"),
	):
		if colonne not in donnees:
			continue
		valeurs = pd.to_numeric(donnees[colonne], errors="coerce")
		erreurs[f"{nom}_manquantes_ou_invalides"] = int(valeurs.isna().sum())
		erreurs[f"{nom}_hors_limites"] = int(
			(~valeurs.isna() & ~valeurs.between(minimum, maximum)).sum()
		)

	return erreurs


def valider_dataset(donnees):
	"""Retourne un rapport reproductible sur la qualité du dataset nettoyé."""
	rapport = {
		"nombre_lignes": int(len(donnees)),
		"nombre_colonnes": int(len(donnees.columns)),
		"colonnes_manquantes": obtenir_colonnes_manquantes(donnees),
		"doublons": int(donnees.duplicated().sum()),
		"valeurs_vides_par_colonne": {
			colonne: int(donnees[colonne].astype("string").str.strip().eq("").sum())
			for colonne in donnees.columns
		},
	}
	rapport.update(valider_coordonnees(donnees))

	if "disponibilite" in donnees:
		valeurs = set(donnees["disponibilite"].dropna().unique())
		rapport["disponibilites_inattendues"] = sorted(
			valeurs.difference(VALEURS_DISPONIBILITE)
		)

	rapport["valide"] = not any((
		rapport["colonnes_manquantes"], rapport["doublons"],
		rapport.get("latitudes_manquantes_ou_invalides", 0),
		rapport.get("longitudes_manquantes_ou_invalides", 0),
		rapport.get("latitudes_hors_limites", 0),
		rapport.get("longitudes_hors_limites", 0),
		rapport.get("disponibilites_inattendues", []),
	))
	return rapport
