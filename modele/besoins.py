"""Interprétation explicable des demandes d'orientation médicale."""

import unicodedata

from modele.orientation import BesoinMedical


CORRESPONDANCE_BESOINS = {
    "fracture": {
        "mots_cles": ("fracture", "fractures", "os casse"),
        "capacites": ("Fractures",),
        "services": ("Urgences",),
        "specialites": ("Traumatologie",),
    },
    "traumatisme": {
        "mots_cles": ("traumatisme", "traumatismes"),
        "capacites": ("Traumatismes",),
        "services": ("Urgences",),
        "specialites": ("Traumatologie",),
    },
    "maux de tete": {
        "mots_cles": (
            "maux de tete",
            "maux des tete",
            "mal de tete",
            "cephalee",
        ),
        "capacites": ("Maladies neurologiques",),
        "services": ("Consultation générale",),
        "specialites": ("Neurologie",),
    },
    "operation abdominale": {
        "mots_cles": (
            "operation abdominale",
            "operation abbominale",
            "chirurgie abdominale",
            "intervention abdominale",
        ),
        "capacites": ("Interventions chirurgicales",),
        "services": ("Chirurgie", "Hospitalisation"),
        "specialites": ("Chirurgie générale",),
    },
    "grossesse": {
        "mots_cles": ("grossesse", "enceinte"),
        "capacites": ("Grossesse",),
        "services": ("Maternité",),
        "specialites": ("Gynécologie", "Obstétrique"),
    },
    "accouchement": {
        "mots_cles": ("accouchement",),
        "capacites": ("Accouchement",),
        "services": ("Maternité",),
        "specialites": ("Obstétrique",),
    },
}

ALIASES_DATASET = {
    "malaria": "Paludisme",
    "paludisme": "Paludisme",
    "cholera": "Choléra",
    "fievre": "Fièvre",
    "consultation generale": "Consultation générale",
    "consultation general": "Consultation générale",
    "medecine generale": "Médecine générale",
    "medecin generaliste": "Médecine générale",
    "probleme orl": "Problèmes ORL",
    "problemes orl": "Problèmes ORL",
    "soins orl": "ORL",
    "probleme dentaire": "Problèmes dentaires",
    "problemes dentaires": "Problèmes dentaires",
    "maladie cardiovasculaire": "Maladies cardiovasculaires",
    "maladies cardiovasculaires": "Maladies cardiovasculaires",
    "maladie dermatologique": "Maladies dermatologiques",
    "maladies dermatologiques": "Maladies dermatologiques",
    "maladie neurologique": "Maladies neurologiques",
    "maladies neurologiques": "Maladies neurologiques",
    "infection respiratoire": "Infections respiratoires",
    "infections respiratoires": "Infections respiratoires",
    "difficulte respiratoire": "Infections respiratoires",
    "difficultes respiratoires": "Infections respiratoires",
    "probleme respiratoire": "Infections respiratoires",
    "problemes respiratoires": "Infections respiratoires",
    "infection digestive": "Infections digestives",
    "infections digestives": "Infections digestives",
    "douleur digestive": "Troubles digestifs",
    "douleurs digestives": "Troubles digestifs",
    "probleme digestif": "Troubles digestifs",
    "problemes digestifs": "Troubles digestifs",
    "enfant malade": "Maladies infantiles",
    "maladie infantile": "Maladies infantiles",
    "maladies infantiles": "Maladies infantiles",
}


def _normaliser_texte(texte):
    """Supprime les accents et uniformise une phrase pour la recherche."""
    texte = unicodedata.normalize("NFD", str(texte).casefold())
    return "".join(
        caractere for caractere in texte
        if unicodedata.category(caractere) != "Mn"
    )


def obtenir_besoins_disponibles(donnees):
    """Retourne les capacités réellement présentes dans le dataset."""
    valeurs = set()
    enregistrements = donnees.to_dict(orient="records") if hasattr(donnees, "to_dict") else donnees
    for structure in enregistrements:
        for valeur in str(structure.get("capacite_prise_en_charge", "")).split(";"):
            valeur = valeur.strip()
            if valeur:
                valeurs.add(valeur)
    return sorted(valeurs, key=str.casefold)


def _correspondances_dataset(texte_normalise, valeurs_dataset):
    """Retourne les valeurs du dataset qui sont réellement présentes dans la phrase."""
    correspondances = []
    for valeur in sorted(set(valeurs_dataset), key=lambda v: (-len(str(v)), str(v).casefold())):
        valeur_normalisee = _normaliser_texte(valeur)
        if not valeur_normalisee:
            continue
        if valeur_normalisee in texte_normalise or texte_normalise in valeur_normalisee:
            correspondances.append(valeur)
    return correspondances


def _ajouter_aliases(texte_normalise, valeurs_dataset):
    """Ajoute les libellés du dataset correspondant aux formulations usuelles."""
    valeurs_normalisees = {
        _normaliser_texte(valeur): valeur for valeur in valeurs_dataset
    }
    correspondances = []
    for alias, valeur_dataset in ALIASES_DATASET.items():
        if alias in texte_normalise:
            valeur = valeurs_normalisees.get(_normaliser_texte(valeur_dataset))
            if valeur:
                correspondances.append(valeur)
    return correspondances


def _extraire_valeurs_dataset(donnees):
    """Extrait les valeurs réelles des colonnes du dataset."""
    valeurs = {"capacites": set(), "services": set(), "specialites": set()}
    enregistrements = donnees.to_dict(orient="records") if hasattr(donnees, "to_dict") else donnees
    for structure in enregistrements:
        for colonne, categorie in (
            ("capacite_prise_en_charge", "capacites"),
            ("services", "services"),
            ("specialites", "specialites"),
        ):
            for valeur in str(structure.get(colonne, "")).split(";"):
                valeur = valeur.strip()
                if valeur:
                    valeurs[categorie].add(valeur)
    return valeurs


def analyser_saisie_utilisateur(saisie, capacites_disponibles=None, donnees=None):
    """Construit un besoin à partir d'une phrase et des valeurs réelles du dataset."""
    texte_normalise = _normaliser_texte(saisie)
    capacites_disponibles = set(capacites_disponibles or ())
    capacites = []
    services = []
    specialites = []
    categories = []

    for categorie, correspondance in CORRESPONDANCE_BESOINS.items():
        if any(_normaliser_texte(mot) in texte_normalise for mot in correspondance["mots_cles"]):
            categories.append(categorie)
            capacites.extend(correspondance["capacites"])
            services.extend(correspondance["services"])
            specialites.extend(correspondance["specialites"])

    valeurs_dataset = _extraire_valeurs_dataset(donnees) if donnees is not None else {"capacites": set(), "services": set(), "specialites": set()}

    capacites_dataset = _correspondances_dataset(texte_normalise, valeurs_dataset["capacites"])
    services_dataset = _correspondances_dataset(texte_normalise, valeurs_dataset["services"])
    specialites_dataset = _correspondances_dataset(texte_normalise, valeurs_dataset["specialites"])
    capacites_dataset.extend(_ajouter_aliases(texte_normalise, valeurs_dataset["capacites"]))
    services_dataset.extend(_ajouter_aliases(texte_normalise, valeurs_dataset["services"]))
    specialites_dataset.extend(_ajouter_aliases(texte_normalise, valeurs_dataset["specialites"]))

    if not capacites and not services and not specialites:
        if capacites_dataset:
            capacites.extend(capacites_dataset)
        if services_dataset:
            services.extend(services_dataset)
        if specialites_dataset:
            specialites.extend(specialites_dataset)

    if capacites_disponibles:
        capacites = [
            capacite for capacite in capacites
            if capacite in capacites_disponibles
        ]
        if not capacites:
            capacites = [
                capacite for capacite in capacites_dataset
                if capacite in capacites_disponibles
            ]

    if not services and services_dataset:
        services = services_dataset
    if not specialites and specialites_dataset:
        specialites = specialites_dataset

    if not categories and (capacites or services or specialites):
        categories = ["demande_ouverte"]

    if not capacites and not services and not specialites:
        raise ValueError(
            "Aucun besoin d'orientation reconnu dans la demande saisie."
        )

    def sans_doublons(valeurs):
        return tuple(dict.fromkeys(valeurs))

    besoin = BesoinMedical(
        " et ".join(categories),
        services_recherches=sans_doublons(services),
        specialites_recherchees=sans_doublons(specialites),
        capacites_recherchees=sans_doublons(capacites),
    )
    return besoin, tuple(categories)
