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
        if recommandation.get(colonne):
            localisation.append(f"{libelle} : {recommandation[colonne]}")

    lignes = [
        f"{recommandation.get('rang', '?')}. {nom}",
        f"Distance : {recommandation.get('distance_km', 0):.2f} km",
        f"Disponibilité : {recommandation.get('disponibilite', 'inconnue') or 'inconnue'}",
        f"Coût d'orientation : {recommandation.get('cout_orientation', 0):.3f}",
    ]
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

    contenu = [
        f"Demande interprétée comme : {besoin.besoin_medical}.",
        "Voici les structures les mieux classées selon les données disponibles :",
    ]
    contenu.extend(formater_recommandation(recommandation) for recommandation in recommandations)
    contenu.append(
        "Ces résultats constituent une aide à l'orientation et ne remplacent pas l'avis d'un professionnel de santé."
    )
    return "\n\n".join(contenu)
