"""Service d'interprétation locale et Gemini des demandes d'orientation."""

from modele.besoins import (
    ALIASES_DATASET,
    CORRESPONDANCE_BESOINS,
    _normaliser_texte,
    analyser_saisie_utilisateur,
    _extraire_valeurs_dataset,
    obtenir_besoins_disponibles,
)
from modele.orientation import BesoinMedical
from services.client_llm import ClientGemini


def interpreter_demande_locale(texte, donnees):
    """Interprète une demande avec les règles locales du projet SIOM."""
    capacites = obtenir_besoins_disponibles(donnees)
    return analyser_saisie_utilisateur(texte, capacites, donnees)


def obtenir_exemples_demandes():
    """Retourne des exemples compréhensibles par l'interpréteur local."""
    return tuple(
        correspondance["mots_cles"][0]
        for correspondance in CORRESPONDANCE_BESOINS.values()
    )


_CACHE_VALEURS_DATASET = None


def interpreter_demande_gemini(texte, donnees, client=None):
    """Interprète une demande avec Gemini puis la convertit en BesoinMedical."""
    global _CACHE_VALEURS_DATASET
    if _CACHE_VALEURS_DATASET is not None and not isinstance(donnees, (list, tuple)):
        valeurs_dataset = _CACHE_VALEURS_DATASET
    else:
        valeurs_dataset = _extraire_valeurs_dataset(donnees)
        if not isinstance(donnees, (list, tuple)):
            _CACHE_VALEURS_DATASET = valeurs_dataset
    vocabulaire_autorise = {
        "capacites": sorted(valeurs_dataset["capacites"], key=str.casefold),
        "services": sorted(valeurs_dataset["services"], key=str.casefold),
        "specialites": sorted(valeurs_dataset["specialites"], key=str.casefold),
    }

    client = client or ClientGemini()
    resultat = client.interpreter(texte, vocabulaire_autorise)

    capacites_brutes = []
    services_brutes = []
    specialites_brutes = []
    categories = []
    for element in resultat.get("besoins", []):
        if not isinstance(element, dict):
            raise ValueError("Une entrée de besoin Gemini est invalide.")
        capacites_brutes.extend(element.get("capacites", []))
        services_brutes.extend(element.get("services", []))
        specialites_brutes.extend(element.get("specialites", []))
        if element.get("categorie"):
            categories.append(str(element["categorie"]))

    index_capacites = {_normaliser_texte(v): v for v in valeurs_dataset["capacites"]}
    index_services = {_normaliser_texte(v): v for v in valeurs_dataset["services"]}
    index_specialites = {_normaliser_texte(v): v for v in valeurs_dataset["specialites"]}

    capacites = []
    services = []
    specialites = []

    # Affecter les valeurs extraites selon leur colonne réelle dans le dataset
    toutes_valeurs = capacites_brutes + services_brutes + specialites_brutes
    for val in toutes_valeurs:
        norm = _normaliser_texte(val)
        if not norm:
            continue
        if norm in index_capacites and index_capacites[norm] not in capacites:
            capacites.append(index_capacites[norm])
        if norm in index_services and index_services[norm] not in services:
            services.append(index_services[norm])
        if norm in index_specialites and index_specialites[norm] not in specialites:
            specialites.append(index_specialites[norm])
        if norm in ALIASES_DATASET:
            cible = _normaliser_texte(ALIASES_DATASET[norm])
            if cible in index_capacites and index_capacites[cible] not in capacites:
                capacites.append(index_capacites[cible])
            if cible in index_services and index_services[cible] not in services:
                services.append(index_services[cible])
            if cible in index_specialites and index_specialites[cible] not in specialites:
                specialites.append(index_specialites[cible])

    # Si le dataset est vide pour une colonne (ex. mocks de tests), filtrer par champ
    if not index_capacites and not index_services and not index_specialites:
        capacites = list(dict.fromkeys(str(c).strip() for c in capacites_brutes if str(c).strip()))
        services = list(dict.fromkeys(str(s).strip() for s in services_brutes if str(s).strip()))
        specialites = list(dict.fromkeys(str(sp).strip() for sp in specialites_brutes if str(sp).strip()))

    if not capacites and not services and not specialites:
        raise ValueError("Gemini n'a identifié aucune valeur présente dans le dataset.")

    besoin = BesoinMedical(
        " et ".join(dict.fromkeys(categories)) or "Demande interprétée",
        services_recherches=tuple(dict.fromkeys(services)),
        specialites_recherchees=tuple(dict.fromkeys(specialites)),
        capacites_recherchees=tuple(dict.fromkeys(capacites)),
    )
    return besoin, tuple(dict.fromkeys(categories))
