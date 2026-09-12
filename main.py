"""Point d'entrée de démonstration du moteur SIOM."""

from pathlib import Path

from modele.orientation import (
    expliquer_recommandation,
    obtenir_recommandations,
)
from modele.besoins import analyser_saisie_utilisateur, obtenir_besoins_disponibles
from traitement.nettoyage import charger_dataset, nettoyer_dataset


CHEMIN_DATASET_PREPARE = Path("donnees/dataset_prepare/dataset_prepare.csv")


def demander_nombre(message):
    """Demande une coordonnée numérique à l'utilisateur."""
    while True:
        try:
            return float(input(message).strip().replace(",", "."))
        except ValueError:
            print("Veuillez saisir un nombre valide.")


def main():
    """Demande un besoin et lance une aide interactive à l'orientation."""
    if not CHEMIN_DATASET_PREPARE.exists():
        raise FileNotFoundError(
            f"Dataset préparé introuvable : {CHEMIN_DATASET_PREPARE}"
        )

    donnees = nettoyer_dataset(charger_dataset(CHEMIN_DATASET_PREPARE))

    print("SIOM - Système Intelligent d'Orientation Médicale")
    print("Ce programme fournit une aide à l'orientation et ne pose pas de diagnostic.")
    latitude_patient = demander_nombre("Latitude du patient : ")
    longitude_patient = demander_nombre("Longitude du patient : ")

    besoins_disponibles = obtenir_besoins_disponibles(donnees)
    print("\nCapacités présentes dans les données :")
    print("; ".join(besoins_disponibles))
    print(
        "\nDécrivez votre besoin. Vous pouvez citer plusieurs besoins, "
        "par exemple : fracture et opération abdominale."
    )

    while True:
        try:
            besoin, categories = analyser_saisie_utilisateur(
                input("Votre demande : "),
                besoins_disponibles,
            )
            break
        except ValueError as erreur:
            print(erreur)
            print("Essayez une expression comme : fracture, grossesse ou maux de tête.")

    recommandations = obtenir_recommandations(
        donnees,
        latitude_patient=latitude_patient,
        longitude_patient=longitude_patient,
        besoin=besoin,
        nombre_recommandations=3,
    )

    print(f"\nBesoins d'orientation identifiés : {', '.join(categories)}")

    if not recommandations:
        print("Aucune structure suffisamment compatible n'a été trouvée.")
        return

    print("\nRecommandations :")
    for recommandation in recommandations:
        print(f"{recommandation['rang']}. {expliquer_recommandation(recommandation)}")


if __name__ == "__main__":
    main()
