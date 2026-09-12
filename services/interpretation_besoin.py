"""Service d'interprétation locale des demandes d'orientation."""

from modele.besoins import (
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


def interpreter_demande_gemini(texte, donnees, client=None):
    """Interprète une demande avec Gemini puis la convertit en BesoinMedical."""
    capacites_autorisees = obtenir_besoins_disponibles(donnees)
    client = client or ClientGemini()
    resultat = client.interpreter(texte, capacites_autorisees)

    capacites = []
    services = []
    specialites = []
    categories = []
    for element in resultat["besoins"]:
        if not isinstance(element, dict):
            raise ValueError("Une entrée de besoin Gemini est invalide.")
        capacites.extend(element.get("capacites", []))
        services.extend(element.get("services", []))
        specialites.extend(element.get("specialites", []))
        if element.get("categorie"):
            categories.append(str(element["categorie"]))

    valeurs_dataset = _extraire_valeurs_dataset(donnees)

    def filtrer_valeurs(valeurs, colonne):
        index = {
            _normaliser_texte(valeur): valeur
            for valeur in valeurs_dataset[colonne]
        }
        if not index:
            return list(dict.fromkeys(str(valeur).strip() for valeur in valeurs if str(valeur).strip()))
        return list(dict.fromkeys(
            index[_normaliser_texte(valeur)]
            for valeur in valeurs
            if _normaliser_texte(valeur) in index
        ))

    capacites = filtrer_valeurs(capacites, "capacites")
    services = filtrer_valeurs(services, "services")
    specialites = filtrer_valeurs(specialites, "specialites")
    if not capacites and not services and not specialites:
        raise ValueError("Gemini n'a identifié aucune valeur présente dans le dataset.")

    besoin = BesoinMedical(
        " et ".join(dict.fromkeys(categories)) or "Demande interprétée",
        services_recherches=tuple(dict.fromkeys(services)),
        specialites_recherchees=tuple(dict.fromkeys(specialites)),
        capacites_recherchees=tuple(capacites),
    )
    return besoin, tuple(dict.fromkeys(categories))
