"""Génération contrôlée des réponses textuelles de SIOM."""


def formater_recommandation(recommandation):
    """Formate une recommandation sans inventer de données."""
    nom = recommandation.get("essnom1") or recommandation.get("identifiant", "Structure inconnue")
    localisation = []
    for colonne, libelle in (
        ("province", "Province"),
        ("localite", "Localité"),
        ("zonesante", "Zone de santé"),
        ("airesante", "Aire de santé"),
    ):
        if recommandation.get(colonne) and str(recommandation[colonne]).lower() != "nan":
            localisation.append(f"{libelle} : {recommandation[colonne]}")

    type_structure = str(recommandation.get("esstype", "")).strip()
    lits = recommandation.get("capacite_lits")

    lignes = [
        f"{recommandation.get('rang', '?')}. {nom}" + (f" ({type_structure})" if type_structure and type_structure.lower() != "nan" else ""),
        f"Distance : {recommandation.get('distance_km', 0):.2f} km",
        f"Disponibilité : {recommandation.get('disponibilite', 'inconnue') or 'inconnue'}",
    ]
    if lits is not None and str(lits).strip() and str(lits) != "0":
        lignes.append(f"Capacité d'accueil : {lits} lits")
    lignes.append(f"Coût d'orientation : {recommandation.get('cout_orientation', 0):.3f}")

    if localisation:
        lignes.append("Localisation : " + ", ".join(localisation))
    return "\n".join(lignes)


def formater_reponse_orientation(besoin, recommandations):
    """Construit une réponse complète à partir des résultats du moteur."""
    if not recommandations:
        return (
            "Aucune structure suffisamment compatible n'a été trouvée "
            f"pour le besoin d'orientation : {besoin.besoin_medical}."
        )

    portee = recommandations[0].get("libelle_portee")
    contenu = [
        f"Demande interprétée comme : {besoin.besoin_medical}.",
    ]
    if portee and portee != "Recherche directe":
        contenu.append(f"Portée de recherche : {portee}.")
    contenu.append("Voici les structures les mieux classées selon les données disponibles :")
    contenu.extend(formater_recommandation(recommandation) for recommandation in recommandations)
    contenu.append(
        "Ces résultats constituent une aide à l'orientation et ne remplacent pas l'avis d'un professionnel de santé."
    )
    return "\n\n".join(contenu)
