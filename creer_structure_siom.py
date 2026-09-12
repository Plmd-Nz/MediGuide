from pathlib import Path


# ============================================================
# CONFIGURATION
# ============================================================

# Nom du dossier racine du projet
DOSSIER_PROJET = "siom"


# ============================================================
# ARBORESCENCE DU PROJET
# ============================================================

ARBORESCENCE = {
    "donnees": [
        "dataset_original",
        "dataset_prepare",
    ],

    "traitement": [
        "nettoyage.py",
        "validation.py",
        "normalisation.py",
    ],

    "modele": [
        "distance.py",
        "criteres.py",
        "cout.py",
        "graphe.py",
        "orientation.py",
    ],

    "configuration": [
        "poids.py",
    ],

    "tests": [
        "test_distance.py",
        "test_criteres.py",
        "test_orientation.py",
    ],

    "racine": [
        "main.py",
        "AGENT.md",
    ],
}


# ============================================================
# CONTENU MINIMAL DES FICHIERS PYTHON
# ============================================================

CONTENU_FICHIERS = {
    "main.py": '''"""
Point d'entrée principal du système SIOM.
"""

def main():
    """Lance le système SIOM."""
    print("SIOM - Système Intelligent d'Orientation Médicale")


if __name__ == "__main__":
    main()
''',

    "traitement/nettoyage.py": '''"""
Fonctions de nettoyage et de préparation des données.
"""
''',

    "traitement/validation.py": '''"""
Fonctions de validation des données.
"""
''',

    "traitement/normalisation.py": '''"""
Fonctions de normalisation des données.
"""
''',

    "modele/distance.py": '''"""
Calcul des distances géographiques.

La distance entre deux coordonnées géographiques
est calculée avec la formule de Haversine.
"""
''',

    "modele/criteres.py": '''"""
Calcul et évaluation des critères d'orientation médicale.
"""
''',

    "modele/cout.py": '''"""
Calcul du coût d'orientation.

Le système cherche à minimiser ce coût.
"""
''',

    "modele/graphe.py": '''"""
Construction et gestion du graphe pondéré utilisé
pour l'orientation médicale.
"""
''',

    "modele/orientation.py": '''"""
Logique principale d'orientation médicale.
"""
''',

    "configuration/poids.py": '''"""
Configuration centralisée des poids utilisés
dans le calcul du coût d'orientation.
"""

POIDS = {
    "distance": 0.20,
    "services": 0.20,
    "specialites": 0.20,
    "capacite": 0.20,
    "disponibilite": 0.20,
}
''',

    "tests/test_distance.py": '''"""
Tests du calcul de distance.
"""
''',

    "tests/test_criteres.py": '''"""
Tests des critères d'orientation.
"""
''',

    "tests/test_orientation.py": '''"""
Tests du système d'orientation.
"""
''',

    "AGENT.md": '''# AGENT.md — SIOM

## 1. Identité du projet

SIOM signifie **Système Intelligent d'Orientation Médicale**.

L'objectif du projet est de développer un système capable d'orienter un patient vers les structures de santé les plus adaptées à son besoin médical.

Le système ne réalise pas de diagnostic médical.

Il ne remplace pas un professionnel de santé.

Il fournit uniquement des recommandations de structures de santé à partir des informations disponibles.

---

## 2. Périmètre de la version 1

La version 1 est volontairement limitée à l'orientation médicale.

Le système prend notamment en compte :

- la proximité géographique ;
- les services disponibles ;
- les spécialités disponibles ;
- la capacité de prise en charge ;
- la disponibilité.

Le système peut retourner un classement des meilleures structures, par exemple un Top 3 ou un Top 5.

---

## 3. Ce qui est exclu de la V1

Ne pas ajouter dans cette version :

- diagnostic automatique ;
- prédiction de maladie ;
- triage médical automatisé ;
- prédiction de saturation des hôpitaux ;
- routage d'ambulances ;
- apprentissage automatique ;
- Random Forest ;
- XGBoost ;
- TensorFlow ;
- PyTorch ;
- LLM ;
- RAG ;
- Gemini ou autre modèle génératif.

Ces technologies pourront éventuellement être étudiées dans une version future si des données fiables sont disponibles.

---

## 4. Données

Le jeu de données principal provient de GRID3 COD Health Facilities v9.0.

Colonnes principales utilisées :

province
prov_uid
antenne
zonesante
zs_uid
airesante
as_uid
localite
essnom1
esstype
dhis2
categorie
vaccfixe
frigo
date
lat
lon
precision
origine
grid3id
sourceid
services
specialites
capacite_prise_en_charge
disponibilite

Les quatre dernières colonnes ont été ajoutées pour permettre le prototype d'orientation.

Attention :

Les valeurs ajoutées artificiellement pour le prototype ne doivent jamais être présentées comme des informations médicales officielles sur les structures de santé.

---

## 5. Technologies

Technologies prévues pour la V1 :

- Python ;
- Pandas ;
- NumPy ;
- Scikit-learn ;
- NetworkX ;
- algorithme de Dijkstra.

Scikit-learn sera principalement utilisé pour les opérations de normalisation nécessaires au modèle.

---

## 6. Distance géographique

La distance entre le patient et une structure de santé doit être calculée à partir des coordonnées GPS.

Utiliser la formule de Haversine.

Fonction recommandée :

calculer_distance_haversine()

Les coordonnées utilisées sont :

- latitude ;
- longitude.

---

## 7. Critères d'orientation

Les principaux critères sont :

### Distance

Une structure proche doit être favorisée.

Plus la distance est grande, plus son coût d'orientation doit augmenter.

### Services

La structure doit disposer des services nécessaires au besoin du patient.

### Spécialités

La présence de la spécialité adaptée au besoin doit être favorisée.

### Capacité de prise en charge

La structure doit être capable de prendre en charge le besoin médical considéré.

### Disponibilité

Une structure disponible doit être favorisée par rapport à une structure indisponible.

---

## 8. Principe du coût

Dijkstra cherche à minimiser un coût.

Il faut donc transformer les critères en coûts.

Formule conceptuelle :

C = wd × D
  + ws × S
  + wsp × SP
  + wc × CP
  + wa × A

Avec :

D  = coût lié à la distance
S  = coût lié aux services
SP = coût lié aux spécialités
CP = coût lié à la capacité
A  = coût lié à la disponibilité

Les poids doivent être centralisés dans :

configuration/poids.py

Ne pas disperser les poids dans plusieurs fichiers.

Ne pas utiliser de nombres arbitraires directement dans les fonctions.

---

## 9. Dijkstra

Le système utilise l'algorithme de Dijkstra pour rechercher le chemin ou la solution présentant le coût minimal dans le graphe pondéré.

Important :

Dijkstra ne calcule pas directement la qualité d'une structure de santé.

Le poids des connexions doit être calculé avant l'exécution de Dijkstra.

Le modèle doit donc suivre cette logique :

Patient
→ besoin médical
→ structures compatibles
→ calcul des critères
→ normalisation
→ calcul du coût
→ construction du graphe
→ Dijkstra
→ classement des recommandations.

---

## 10. Filtrage

Avant de construire le graphe, les structures manifestement incompatibles doivent être filtrées.

Exemple :

Si le besoin nécessite un service particulier et que la structure ne possède pas ce service, elle peut être exclue des candidates.

Cela permet d'éviter de recommander une structure qui ne peut pas répondre au besoin demandé.

---

## 11. Normalisation

Les critères n'ont pas forcément les mêmes unités.

Exemple :

- distance en kilomètres ;
- disponibilité sous forme catégorielle ;
- services sous forme de liste ;
- spécialités sous forme de liste.

Ils doivent donc être transformés dans une échelle comparable avant le calcul du coût global.

La normalisation doit être claire et documentée.

---

## 12. Explicabilité

Le système ne doit pas seulement retourner le nom d'une structure.

Il doit conserver les valeurs intermédiaires permettant d'expliquer la recommandation.

Une recommandation devrait pouvoir indiquer notamment :

- structure recommandée ;
- distance ;
- compatibilité des services ;
- compatibilité des spécialités ;
- compatibilité de la capacité ;
- disponibilité ;
- coût final.

Le système doit rester compréhensible et vérifiable.

---

## 13. Organisation du code

Structure recommandée :

siom/
│
├── donnees/
│   ├── dataset_original/
│   └── dataset_prepare/
│
├── traitement/
│   ├── nettoyage.py
│   ├── validation.py
│   └── normalisation.py
│
├── modele/
│   ├── distance.py
│   ├── criteres.py
│   ├── cout.py
│   ├── graphe.py
│   └── orientation.py
│
├── configuration/
│   └── poids.py
│
├── tests/
│   ├── test_distance.py
│   ├── test_criteres.py
│   └── test_orientation.py
│
├── main.py
└── AGENT.md

---

## 14. Convention de langue

IMPORTANT :

Tout le code développé dans ce projet doit être écrit en français lorsque cela est possible.

Cela concerne notamment :

- noms des variables ;
- noms des fonctions ;
- noms des classes ;
- commentaires ;
- docstrings ;
- messages affichés ;
- messages d'erreur personnalisés ;
- logs ;
- documentation technique.

Exemples recommandés :

calculer_distance_haversine()
filtrer_structures_compatibles()
calculer_score_services()
calculer_score_specialites()
calculer_score_capacite()
calculer_score_disponibilite()
calculer_cout_orientation()
construire_graphe()
obtenir_recommandations()

Les noms imposés par Python ou les bibliothèques doivent évidemment rester inchangés.

Exemple :

import pandas as pd
import numpy as np
import networkx as nx

from sklearn.preprocessing import MinMaxScaler

Ne pas traduire les noms imposés par ces bibliothèques.

---

## 15. Qualité du code

Le code doit être :

- simple ;
- lisible ;
- modulaire ;
- testable ;
- documenté ;
- cohérent ;
- maintenable.

Éviter :

- les fonctions gigantesques ;
- les variables ambiguës ;
- les nombres magiques ;
- les duplications inutiles ;
- les traitements cachés ;
- les effets de bord inutiles.

Chaque fonction doit avoir une responsabilité claire.

---

## 16. Tests

Les fonctionnalités importantes doivent être testées.

Priorité aux tests concernant :

- calcul de distance ;
- normalisation ;
- critères ;
- calcul du coût ;
- filtrage ;
- recommandations finales.

Les tests doivent également couvrir les cas limites.

Exemples :

- coordonnées identiques ;
- coordonnées manquantes ;
- structure indisponible ;
- structure incompatible ;
- absence de structure compatible ;
- données incomplètes.

---

## 17. Données manquantes

Les valeurs manquantes doivent être traitées explicitement.

Ne jamais remplacer silencieusement une information manquante par une valeur inventée.

Chaque stratégie de traitement des données manquantes doit être documentée.

---

## 18. Performance

Le dataset contient plusieurs dizaines de milliers de structures.

Éviter les boucles Python inutiles lorsque Pandas ou NumPy permettent une opération vectorisée.

Les calculs doivent être organisés afin de rester raisonnablement performants.

---

## 19. Développement progressif

Respecter cet ordre :

1. charger les données ;
2. nettoyer les données ;
3. valider les données ;
4. normaliser les critères ;
5. calculer les distances ;
6. calculer les scores ;
7. calculer le coût d'orientation ;
8. construire le graphe ;
9. appliquer Dijkstra ;
10. produire les recommandations ;
11. ajouter les tests ;
12. améliorer l'explicabilité.

Ne pas développer une interface graphique avant d'avoir validé le modèle d'orientation.

---

## 20. Rigueur académique

Le projet doit rester défendable scientifiquement et techniquement.

Ne pas inventer :

- des résultats ;
- des performances ;
- des statistiques ;
- des données médicales ;
- des capacités réelles d'hôpitaux ;
- des disponibilités réelles.

Toute donnée synthétique utilisée pour le prototype doit être clairement identifiée comme telle.

---

## 21. Principe général

Le système doit être construit selon le principe :

Données
→ traitement
→ critères
→ coût
→ graphe
→ Dijkstra
→ recommandations.

Chaque étape doit être identifiable dans le code.

Le code ne doit pas mélanger inutilement :

- traitement des données ;
- logique métier ;
- configuration ;
- calculs mathématiques ;
- tests.

---

## 22. Critère de réussite

La V1 sera considérée comme correctement construite lorsque le système pourra :

1. charger le dataset ;
2. recevoir un besoin médical et une position patient ;
3. identifier les structures compatibles ;
4. calculer les distances ;
5. évaluer les critères ;
6. calculer un coût d'orientation ;
7. construire le graphe ;
8. utiliser Dijkstra ;
9. retourner un classement de structures ;
10. expliquer pourquoi chaque structure a été recommandée.

La priorité absolue est la qualité, la compréhension du modèle et la cohérence scientifique du système.
'''
}


# ============================================================
# CREATION DE L'ARBORESCENCE
# ============================================================

def creer_structure():
    """Crée toute l'arborescence du projet SIOM."""

    dossier_racine = Path(DOSSIER_PROJET)

    # Création du dossier principal
    dossier_racine.mkdir(exist_ok=True)

    # Création des dossiers
    for dossier, elements in ARBORESCENCE.items():

        if dossier == "racine":
            continue

        chemin_dossier = dossier_racine / dossier
        chemin_dossier.mkdir(parents=True, exist_ok=True)

        # Création des sous-dossiers ou fichiers
        for element in elements:

            chemin_element = chemin_dossier / element

            if "." not in element:
                chemin_element.mkdir(parents=True, exist_ok=True)

    # Création des fichiers
    for chemin, contenu in CONTENU_FICHIERS.items():

        chemin_fichier = dossier_racine / chemin

        chemin_fichier.parent.mkdir(parents=True, exist_ok=True)

        # Ne pas écraser un fichier existant
        if not chemin_fichier.exists():
            chemin_fichier.write_text(
                contenu,
                encoding="utf-8"
            )

    print()
    print("=" * 60)
    print("STRUCTURE SIOM CRÉÉE AVEC SUCCÈS")
    print("=" * 60)
    print()
    print(f"Dossier du projet : {dossier_racine.resolve()}")
    print()
    print("Arborescence :")
    print()
    afficher_arborescence(dossier_racine)
    print()
    print("=" * 60)


# ============================================================
# AFFICHAGE DE L'ARBORESCENCE
# ============================================================

def afficher_arborescence(dossier, prefixe=""):
    """Affiche récursivement l'arborescence du projet."""

    elements = sorted(
        dossier.iterdir(),
        key=lambda element: (element.is_file(), element.name.lower())
    )

    for index, element in enumerate(elements):

        dernier = index == len(elements) - 1

        symbole = "└── " if dernier else "├── "

        print(prefixe + symbole + element.name)

        if element.is_dir():

            nouveau_prefixe = prefixe + (
                "    " if dernier else "│   "
            )

            afficher_arborescence(
                element,
                nouveau_prefixe
            )


# ============================================================
# EXECUTION
# ============================================================

if __name__ == "__main__":
    creer_structure()