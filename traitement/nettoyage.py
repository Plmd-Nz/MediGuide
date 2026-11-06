"""Fonctions de nettoyage et de préparation des données SIOM."""

from pathlib import Path

import pandas as pd


COLONNES_LISTES = (
	"services",
	"specialites",
	"capacite_prise_en_charge",
)


def charger_dataset(chemin_dataset, encodage="utf-8"):
	"""Charge le fichier CSV source en conservant les valeurs textuelles."""
	chemin = Path(chemin_dataset)
	try:
		return pd.read_csv(
			chemin,
			dtype=str,
			keep_default_na=False,
			encoding=encodage,
		)
	except (UnicodeDecodeError, LookupError):
		return pd.read_csv(
			chemin,
			dtype=str,
			keep_default_na=False,
			encoding="latin-1",
		)


def normaliser_noms_colonnes(donnees):
	"""Uniformise les noms de colonnes attendus par le projet."""
	donnees_nettoyees = donnees.copy()
	donnees_nettoyees.columns = [nom.strip() for nom in donnees_nettoyees.columns]

	if "disponibilites" in donnees_nettoyees.columns:
		donnees_nettoyees = donnees_nettoyees.rename(
			columns={"disponibilites": "disponibilite"}
		)

	return donnees_nettoyees


def nettoyer_chaines(donnees):
	"""Supprime les espaces inutiles des cellules textuelles."""
	donnees_nettoyees = donnees.copy()
	colonnes_textuelles = donnees_nettoyees.select_dtypes(include="object").columns
	donnees_nettoyees[colonnes_textuelles] = donnees_nettoyees[
		colonnes_textuelles
	].apply(lambda colonne: colonne.str.strip())
	return donnees_nettoyees


def convertir_coordonnees(donnees):
	"""Convertit les coordonnées en nombres, y compris les décimales à virgule."""
	donnees_nettoyees = donnees.copy()

	for colonne in ("lat", "lon", "precision"):
		if colonne in donnees_nettoyees.columns:
			valeurs = donnees_nettoyees[colonne].astype("string")
			valeurs = valeurs.str.replace(",", ".", regex=False)
			donnees_nettoyees[colonne] = pd.to_numeric(valeurs, errors="coerce")

	return donnees_nettoyees


def nettoyer_valeurs_listes(donnees):
	"""Nettoie les listes séparées par des points-virgules et supprime les doublons."""
	donnees_nettoyees = donnees.copy()

	for colonne in COLONNES_LISTES:
		if colonne not in donnees_nettoyees.columns:
			continue

		def nettoyer_liste(valeur):
			elements = [element.strip() for element in str(valeur).split(";")]
			elements = [element for element in elements if element]
			elements_sans_doublon = list(dict.fromkeys(elements))
			return "; ".join(elements_sans_doublon)

		donnees_nettoyees[colonne] = donnees_nettoyees[colonne].map(nettoyer_liste)

	return donnees_nettoyees


def nettoyer_dataset(donnees):
	"""Applique les transformations de nettoyage sans inventer de données."""
	donnees_nettoyees = normaliser_noms_colonnes(donnees)
	donnees_nettoyees = nettoyer_chaines(donnees_nettoyees)
	donnees_nettoyees = convertir_coordonnees(donnees_nettoyees)
	donnees_nettoyees = nettoyer_valeurs_listes(donnees_nettoyees)
	return donnees_nettoyees.drop_duplicates().reset_index(drop=True)


def enregistrer_dataset_prepare(donnees, chemin_sortie):
	"""Enregistre le tableau nettoyé dans un fichier CSV préparé."""
	chemin_sortie = Path(chemin_sortie)
	chemin_sortie.parent.mkdir(parents=True, exist_ok=True)
	donnees.to_csv(chemin_sortie, index=False, encoding="utf-8")
