Oui. Voici le contenu complet de **`AGENT.md`**, prêt à copier-coller dans ton projet.

````md
# AGENT.md — SIOM
# Système Intelligent d'Orientation Médicale

## 1. IDENTITÉ DU PROJET

SIOM signifie **Système Intelligent d'Orientation Médicale**.

SIOM est un projet académique visant à développer un moteur capable de recommander à un patient des structures sanitaires adaptées à son besoin médical.

Le système est un outil **d'orientation et d'aide à la décision**, et non un outil autonome de diagnostic.

Le pipeline général du projet est :

Patient
→ besoin médical / symptômes
→ identification de la catégorie du besoin
→ recherche des structures compatibles
→ évaluation des critères
→ normalisation
→ calcul du coût d'orientation
→ construction du graphe pondéré
→ application de Dijkstra
→ classement des structures
→ recommandations Top 3 / Top 5

La V1 doit rester simple, rapide à développer, explicable, testable et suffisamment rigoureuse pour une démonstration académique.

---

# 2. OBJECTIF PRINCIPAL

L'objectif de SIOM est de proposer une orientation vers les structures sanitaires les plus pertinentes en fonction de plusieurs critères.

Les principaux critères retenus sont :

1. la distance géographique ;
2. les services disponibles ;
3. les spécialités disponibles ;
4. la capacité de prise en charge ;
5. la disponibilité de la structure.

Le système doit pouvoir retourner plusieurs recommandations classées selon leur pertinence.

Exemple :

1. Structure A — recommandation principale
2. Structure B — deuxième recommandation
3. Structure C — alternative

L'objectif n'est donc pas seulement de trouver « l'hôpital le plus proche », mais de rechercher une structure qui présente un bon compromis entre proximité et adéquation médicale.

---

# 3. POSITIONNEMENT MÉDICAL

SIOM est un système d'**orientation médicale**.

Il ne doit PAS être présenté comme un système autonome de diagnostic.

Le système ne doit pas :

- poser un diagnostic médical définitif ;
- remplacer un médecin ou un professionnel de santé ;
- affirmer avec certitude qu'un patient souffre d'une maladie ;
- prendre une décision médicale autonome ;
- inventer des informations médicales réelles.

Les symptômes peuvent être utilisés pour déterminer un besoin ou une catégorie d'orientation.

Le vocabulaire utilisé dans le code et la documentation doit privilégier :

- besoin médical ;
- catégorie de besoin ;
- orientation ;
- structure compatible ;
- capacité de prise en charge ;
- pertinence ;
- recommandation.

Éviter les formulations comme :

- « le système diagnostique le patient » ;
- « le système confirme la maladie » ;
- « le système décide du traitement ».

---

# 4. DATASET

Le dataset principal utilisé par SIOM est :

**GRID3 COD Health Facilities v9.0**

Source :

https://data.grid3.org/datasets/GRID3::grid3-cod-health-facilities-v9-0/about

Le dataset contient environ 39 000 structures sanitaires en République démocratique du Congo.

Les principales colonnes utilisées dans le projet sont :

- province
- prov_uid
- antenne
- zonesante
- zs_uid
- airesante
- as_uid
- localite
- essnom1
- esstype
- dhis2
- categorie
- vaccfixe
- frigo
- date
- lat
- lon
- precision
- origine
- grid3id
- sourceid
- services
- specialites
- capacite_prise_en_charge
- disponibilite

---

# 5. SIGNIFICATION DES COLONNES IMPORTANTES

## 5.1 esstype

La colonne `esstype` représente le type de structure sanitaire.

Elle est considérée comme suffisante pour représenter le niveau ou le type de structure dans la V1.

Il n'est donc PAS nécessaire de créer une colonne supplémentaire :

`niveau_structure`

sauf si une nécessité future le justifie clairement.

---

## 5.2 frigo

La colonne `frigo` est conservée dans le dataset.

Elle peut être utile dans certains scénarios spécifiques, notamment lorsqu'un besoin de conservation des corps est envisagé.

IMPORTANT :

Ne pas automatiquement interpréter `frigo` comme signifiant « morgue » sans vérifier la signification exacte de la donnée source.

Le système doit respecter la signification réelle de la variable.

---

## 5.3 lat et lon

Les colonnes :

- `lat`
- `lon`

contiennent les coordonnées géographiques des structures.

Elles seront utilisées pour calculer la distance entre la position du patient et les structures sanitaires.

---

## 5.4 services

La colonne `services` représente les services disponibles dans une structure.

Les valeurs de référence retenues pour le prototype sont :

- Consultation générale
- Urgences
- Soins infirmiers
- Maternité
- Pédiatrie
- Chirurgie
- Hospitalisation
- Laboratoire
- Pharmacie
- Vaccination
- Radiologie
- Échographie
- Soins dentaires
- Ophtalmologie
- ORL
- Médecine interne
- Gynécologie
- Santé maternelle et infantile
- Santé sexuelle et reproductive
- Morgue

Plusieurs services peuvent être enregistrés dans une même cellule.

Exemple :

```text
Consultation générale; Laboratoire; Pharmacie
````

Le séparateur doit rester cohérent dans l'ensemble du dataset.

---

# 6. SPECIALITES

La colonne `specialites` représente les spécialités disponibles dans une structure.

Valeurs de référence :

* Médecine générale
* Médecine interne
* Pédiatrie
* Gynécologie
* Obstétrique
* Chirurgie générale
* Cardiologie
* Dermatologie
* Neurologie
* Infectiologie
* Ophtalmologie
* ORL
* Dentisterie
* Anesthésie-réanimation
* Radiologie
* Psychiatrie
* Urologie
* Orthopédie
* Traumatologie
* Néonatologie

Une structure peut posséder plusieurs spécialités.

Exemple :

```text
Médecine générale; Pédiatrie; Gynécologie
```

---

# 7. CAPACITÉ DE PRISE EN CHARGE

La colonne :

`capacite_prise_en_charge`

représente les types de besoins médicaux ou de cas que la structure peut prendre en charge dans le cadre du prototype.

Valeurs de référence :

* Paludisme
* Choléra
* Fièvre
* Infections respiratoires
* Infections digestives
* Douleurs abdominales
* Traumatismes
* Fractures
* Plaies
* Brûlures
* Grossesse
* Accouchement
* Complications obstétricales
* Maladies infantiles
* Maladies cardiovasculaires
* Maladies dermatologiques
* Maladies neurologiques
* Problèmes ophtalmologiques
* Problèmes ORL
* Problèmes dentaires
* Maladies infectieuses
* Troubles digestifs
* Urgences médicales
* Urgences chirurgicales
* Interventions chirurgicales
* Soins post-opératoires
* Soins néonatals
* Santé mentale
* Soins palliatifs
* Prise en charge des défunts

Cette colonne est utilisée pour le prototype académique.

Si les données sont générées artificiellement, elles doivent être considérées comme **données synthétiques**.

Elles ne doivent jamais être présentées comme une certification médicale réelle des établissements.

---

# 8. DISPONIBILITÉ

La colonne `disponibilite` utilise les valeurs :

* Très disponible
* Disponible
* Disponibilité limitée
* Indisponible

Pour le calcul numérique, une convention possible est :

```text
Très disponible = 1.00
Disponible = 0.75
Disponibilité limitée = 0.40
Indisponible = 0.00
```

Ces valeurs sont des paramètres de modélisation.

Elles doivent être centralisées dans la configuration et facilement modifiables.

Une valeur inconnue ne doit jamais être automatiquement considérée comme « Très disponible ».

---

# 9. TECHNOLOGIES DE LA V1

La V1 doit utiliser une stack volontairement simple.

## Python

Python est le langage principal du projet.

Il sera utilisé pour :

* le traitement des données ;
* les calculs ;
* la logique d'orientation ;
* la construction du graphe ;
* l'exécution de Dijkstra ;
* les tests.

---

## Pandas

Pandas sera utilisé pour :

* charger le dataset ;
* nettoyer les données ;
* vérifier les données ;
* filtrer les structures ;
* manipuler les colonnes ;
* préparer les données.

---

## NumPy

NumPy sera utilisé pour les calculs numériques lorsque cela est nécessaire.

Ne pas utiliser NumPy inutilement.

---

## Scikit-learn

Scikit-learn pourra être utilisé principalement pour la normalisation des critères.

Par exemple :

```python
MinMaxScaler
```

Il n'est PAS nécessaire d'utiliser Scikit-learn pour entraîner un modèle de machine learning dans la V1.

---

## NetworkX

NetworkX sera utilisé pour :

* représenter le graphe ;
* créer les nœuds ;
* créer les arêtes ;
* associer des poids ;
* exploiter les algorithmes de graphes.

---

# 10. ALGORITHME CENTRAL : DIJKSTRA

L'algorithme principal retenu est :

**Dijkstra**

Dijkstra permet de rechercher des chemins de coût minimal dans un graphe pondéré.

Dans SIOM, le coût représentera une combinaison de plusieurs critères d'orientation.

Il faut cependant respecter un principe essentiel :

Dijkstra cherche à **minimiser** le coût.

Par conséquent :

* meilleure proximité → coût plus faible ;
* meilleure compatibilité → coût plus faible ;
* meilleure spécialité → coût plus faible ;
* meilleure capacité → coût plus faible ;
* meilleure disponibilité → coût plus faible.

Il ne faut jamais mélanger les notions de score et de coût sans transformation appropriée.

---

# 11. CALCUL DE DISTANCE

La distance géographique sera calculée à partir de :

* latitude du patient ;
* longitude du patient ;
* latitude de la structure ;
* longitude de la structure.

Utiliser la formule de **Haversine**.

Créer une fonction dédiée :

```python
calculer_distance_haversine()
```

Cette fonction doit être :

* courte ;
* indépendante ;
* documentée ;
* testable.

La distance brute ne doit pas être confondue avec le coût final d'orientation.

---

# 12. CRITÈRES D'ORIENTATION

Les critères principaux sont :

### Distance

Mesure la proximité géographique entre le patient et la structure.

### Services

Mesure l'adéquation entre les services nécessaires et ceux disponibles.

### Spécialités

Mesure l'adéquation entre les spécialités nécessaires et celles disponibles.

### Capacité de prise en charge

Mesure si la structure est adaptée au besoin médical identifié.

### Disponibilité

Mesure le niveau de disponibilité de la structure.

Les autres colonnes du dataset ne doivent être intégrées au score que lorsqu'une justification claire existe.

Ne pas intégrer toutes les colonnes simplement parce qu'elles existent.

---

# 13. NORMALISATION

Les critères ne sont pas naturellement sur la même échelle.

Par exemple :

* distance = kilomètres ;
* service = score ;
* spécialité = score ;
* capacité = score ;
* disponibilité = score.

Ils doivent donc être normalisés avant leur combinaison lorsque cela est nécessaire.

Les fonctions de normalisation doivent être simples et explicables.

---

# 14. FONCTION DE COÛT

Le coût d'orientation peut être représenté conceptuellement par :

```text
C = wd × D + ws × S + wsp × SP + wc × CP + wa × A
```

avec :

* `D` = coût lié à la distance ;
* `S` = coût lié aux services ;
* `SP` = coût lié aux spécialités ;
* `CP` = coût lié à la capacité ;
* `A` = coût lié à la disponibilité ;
* `wd` = poids de la distance ;
* `ws` = poids des services ;
* `wsp` = poids des spécialités ;
* `wc` = poids de la capacité ;
* `wa` = poids de la disponibilité.

La formule exacte pourra être ajustée après les premiers tests.

---

# 15. GESTION DES POIDS

Les poids doivent être centralisés dans un fichier de configuration.

Exemple :

```text
POIDS_DISTANCE
POIDS_SERVICES
POIDS_SPECIALITES
POIDS_CAPACITE
POIDS_DISPONIBILITE
```

Ne jamais disperser les poids dans plusieurs fichiers.

Ne pas utiliser de nombres magiques.

Exemple de mauvaise pratique :

```python
cout = distance * 0.4 + service * 0.3 + disponibilite * 0.2
```

dans plusieurs fonctions.

Préférer une configuration centralisée.

Les poids doivent être facilement modifiables afin de permettre des expérimentations.

---

# 16. FILTRAGE DES STRUCTURES

Avant de construire le graphe final, il faut filtrer les structures manifestement incompatibles.

Exemple :

Besoin :

```text
Traumatisme
```

Le système peut :

1. rechercher les structures ayant cette capacité ;
2. vérifier les services pertinents ;
3. vérifier les spécialités pertinentes ;
4. conserver les structures candidates ;
5. calculer leurs critères ;
6. les intégrer au graphe.

Il ne faut pas nécessairement supprimer une structure lorsqu'une information est manquante.

La stratégie de gestion des données manquantes doit être explicite.

---

# 17. MODÉLISATION DU GRAPHE

Le graphe doit être suffisamment cohérent pour justifier l'utilisation de Dijkstra.

Pour la V1 :

* le patient constitue le point de départ ;
* les structures candidates sont représentées comme des nœuds ;
* les connexions possèdent des coûts ;
* Dijkstra permet de rechercher les coûts minimaux.

Il faut éviter une utilisation artificielle de Dijkstra uniquement pour pouvoir dire que le projet utilise Dijkstra.

Si une amélioration de la modélisation du graphe devient nécessaire, elle doit être discutée avant d'ajouter de la complexité.

---

# 18. PAS DE RÉSEAU ROUTIER COMPLEXE POUR LA V1

La V1 n'utilisera pas :

* OSRM ;
* Google Maps API ;
* réseau routier détaillé ;
* données de trafic ;
* données de temps réel routier.

La distance géographique Haversine suffit pour le premier prototype.

Une modélisation routière pourra être étudiée dans une version future.

---

# 19. RÉSULTAT DU MOTEUR

Le moteur doit retourner des données structurées.

Exemple :

```python
[
    {
        "structure": "Hôpital X",
        "distance_km": 3.2,
        "score_services": 0.90,
        "score_specialites": 1.00,
        "score_capacite": 1.00,
        "score_disponibilite": 0.75,
        "cout_orientation": 0.23
    }
]
```

Le moteur doit ensuite pouvoir produire :

```text
Top 1
Top 2
Top 3
```

ou :

```text
Top 5
```

selon le besoin.

---

# 20. EXPLICABILITÉ

Chaque recommandation doit pouvoir être expliquée.

Exemple :

```text
Cette structure est recommandée car elle est proche du patient,
dispose des services nécessaires, possède une spécialité pertinente
et présente une bonne disponibilité.
```

Le moteur doit conserver les critères intermédiaires.

Il ne doit pas être une boîte noire.

L'utilisateur doit pouvoir comprendre pourquoi une structure a été mieux classée qu'une autre.

---

# 21. PAS DE MACHINE LEARNING POUR LA V1

Ne pas ajouter artificiellement :

* Random Forest ;
* XGBoost ;
* SVM ;
* TensorFlow ;
* PyTorch ;
* réseaux neuronaux ;
* Deep Learning.

La raison est simple :

Nous ne disposons pas encore d'un historique fiable d'orientations médicales validées permettant d'entraîner correctement un modèle supervisé.

Il serait donc méthodologiquement incorrect de créer artificiellement un modèle ML uniquement pour rendre le projet « plus intelligent ».

La V1 doit être :

**règles + filtrage + critères multicritères + normalisation + fonction de coût + graphe + Dijkstra.**

Un véritable modèle ML pourra être étudié dans une version ultérieure lorsque des données d'apprentissage fiables seront disponibles.

---

# 22. ORGANISATION DU PROJET

Organisation recommandée :

```text
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
```

Cette organisation peut être adaptée si nécessaire.

Cependant, les responsabilités doivent rester clairement séparées.

---

# 23. RÈGLE ABSOLUE : CODE EN FRANÇAIS

Tout le code doit être écrit en français autant que possible.

Cela concerne :

* noms des variables ;
* noms des fonctions ;
* noms des classes ;
* noms des modules ;
* commentaires ;
* docstrings ;
* messages d'erreur ;
* logs ;
* textes affichés.

Exemples corrects :

```python
calculer_distance_haversine()
filtrer_structures_compatibles()
calculer_score_services()
calculer_score_specialites()
calculer_score_capacite()
calculer_score_disponibilite()
calculer_cout_orientation()
construire_graphe()
obtenir_recommandations()
```

Exemples à éviter :

```python
calculate_distance()
filter_candidates()
service_score()
availability_score()
```

La syntaxe Python reste évidemment inchangée.

Les noms imposés par les bibliothèques restent également inchangés.

Exemple :

```python
import pandas as pd
import networkx as nx
from sklearn.preprocessing import MinMaxScaler
```

C'est parfaitement normal.

Les noms des colonnes du dataset doivent également rester conformes au dataset.

---

# 24. QUALITÉ DU CODE

La qualité est prioritaire sur la quantité de code.

Le code doit être :

* lisible ;
* simple ;
* modulaire ;
* cohérent ;
* testable ;
* maintenable ;
* documenté ;
* compréhensible par un étudiant.

Une solution simple et bien conçue est préférable à une solution complexe impossible à expliquer.

Éviter :

* fonctions gigantesques ;
* code dupliqué ;
* imports inutiles ;
* variables inutilisées ;
* nombres magiques ;
* abstractions inutiles ;
* dépendances inutiles ;
* code mort ;
* optimisation prématurée.

---

# 25. COMMENTAIRES ET DOCSTRINGS

Les commentaires doivent expliquer le raisonnement lorsqu'il n'est pas évident.

Mauvais exemple :

```python
# Ajouter la distance
distance += valeur
```

Bon exemple :

```python
# La distance est transformée en coût afin qu'une structure
# géographiquement plus proche soit favorisée par l'algorithme
# de minimisation.
```

Les fonctions importantes doivent posséder une docstring en français.

Exemple :

```python
def calculer_distance_haversine(
    latitude_patient,
    longitude_patient,
    latitude_structure,
    longitude_structure
):
    """
    Calcule la distance géographique approximative entre le patient
    et une structure sanitaire à partir de leurs coordonnées GPS.
    """
```

---

# 26. VALIDATION DES DONNÉES

Avant d'utiliser les données dans le modèle, vérifier :

* les colonnes attendues ;
* les valeurs manquantes ;
* les valeurs vides ;
* les coordonnées ;
* les doublons ;
* les types de structures ;
* les services ;
* les spécialités ;
* les capacités ;
* les disponibilités.

Le système ne doit pas supposer que le dataset est parfait.

---

# 27. DONNÉES MANQUANTES

Les données manquantes doivent être traitées explicitement.

Exemples :

* latitude absente ;
* longitude absente ;
* service absent ;
* spécialité absente ;
* capacité absente ;
* disponibilité absente.

Ne jamais transformer automatiquement une information inconnue en une information favorable.

Exemple interdit :

```text
disponibilité inconnue → Très disponible
```

---

# 28. PERFORMANCE

Le dataset contient environ 39 000 lignes.

Le code doit donc éviter les traitements inutilement coûteux.

Préférer :

* opérations vectorisées avec Pandas ;
* filtrage préalable ;
* calculs ciblés ;
* réutilisation des résultats.

Ne pas recalculer plusieurs fois la même information.

Cependant, il ne faut pas sacrifier la lisibilité pour une optimisation prématurée.

Ordre des priorités :

1. correction ;
2. compréhension ;
3. simplicité ;
4. performance raisonnable.

---

# 29. TESTS

Même si le projet est académique et réalisé rapidement, les fonctions importantes doivent être testées.

Tester au minimum :

* calcul de distance Haversine ;
* coordonnées manquantes ;
* coordonnées invalides ;
* calcul du score de service ;
* calcul du score de spécialité ;
* calcul du score de capacité ;
* conversion de disponibilité ;
* calcul du coût global ;
* filtrage des structures ;
* classement ;
* absence de structure compatible.

Les tests doivent être simples mais pertinents.

---

# 30. SCÉNARIOS DE TEST

Le moteur doit être testé avec plusieurs besoins.

Exemples :

### Scénario 1

Besoin lié au paludisme.

### Scénario 2

Traumatisme ou fracture.

### Scénario 3

Grossesse ou accouchement.

### Scénario 4

Besoin nécessitant une spécialité particulière.

### Scénario 5

Besoin nécessitant une capacité particulière.

### Scénario 6

Aucune structure suffisamment compatible.

Pour chaque scénario, analyser :

* structures candidates ;
* distance ;
* services ;
* spécialités ;
* capacité ;
* disponibilité ;
* coût ;
* classement.

---

# 31. TECHNOLOGIES EXCLUES DE LA V1

Ne pas ajouter sans demande explicite :

* interface graphique ;
* application mobile ;
* Flask ;
* FastAPI ;
* Vue.js ;
* React ;
* Firebase ;
* Gemini ;
* LLM ;
* RAG ;
* TensorFlow ;
* PyTorch ;
* Deep Learning ;
* XGBoost ;
* Random Forest ;
* Google Maps API ;
* OSRM ;
* réseau routier complexe ;
* prédiction de saturation hospitalière ;
* gestion d'ambulances ;
* diagnostic automatique.

La priorité actuelle est uniquement :

```text
DATASET
    ↓
PRÉTRAITEMENT
    ↓
CRITÈRES
    ↓
SCORES
    ↓
NORMALISATION
    ↓
COÛT
    ↓
GRAPHE
    ↓
DIJKSTRA
    ↓
RECOMMANDATIONS
```

---

# 32. ORDRE DE DÉVELOPPEMENT

Les agents doivent respecter cet ordre autant que possible.

## Étape 1 — Inspection

Analyser le dataset réel.

## Étape 2 — Nettoyage

Nettoyer et valider les données.

## Étape 3 — Critères

Définir précisément les critères d'orientation.

## Étape 4 — Distance

Implémenter Haversine.

## Étape 5 — Scores

Implémenter les scores :

* services ;
* spécialités ;
* capacité ;
* disponibilité.

## Étape 6 — Normalisation

Normaliser les critères.

## Étape 7 — Coût

Implémenter la fonction de coût multicritère.

## Étape 8 — Filtrage

Sélectionner les structures compatibles.

## Étape 9 — Graphe

Construire le graphe pondéré.

## Étape 10 — Dijkstra

Appliquer Dijkstra.

## Étape 11 — Classement

Retourner Top 3 / Top 5.

## Étape 12 — Tests

Tester plusieurs scénarios.

## Étape 13 — Validation

Analyser les résultats et corriger les incohérences.

Ne pas passer à l'interface avant validation complète du moteur.

---

# 33. RIGUEUR ACADÉMIQUE

Chaque décision technique importante doit pouvoir être justifiée devant un enseignant.

## Pourquoi Haversine ?

Parce que le dataset contient des coordonnées géographiques `lat` et `lon` et que nous avons besoin d'estimer la distance géographique entre le patient et les structures.

## Pourquoi une fonction de coût ?

Parce que plusieurs critères doivent être combinés dans une mesure commune afin de pouvoir comparer les structures.

## Pourquoi Dijkstra ?

Parce que le problème est modélisé sous forme de graphe pondéré et que Dijkstra permet de rechercher les coûts minimaux.

## Pourquoi pas de machine learning ?

Parce que nous ne disposons pas encore d'un historique fiable d'orientations médicales validées permettant un apprentissage supervisé sérieux.

## Pourquoi ne pas utiliser un réseau routier externe ?

Pour conserver une V1 simple, rapide à développer et adaptée à un projet académique.

---

# 34. INTERDICTION D'INVENTER

L'agent ne doit jamais inventer :

* des colonnes qui n'existent pas ;
* des données réelles d'établissements ;
* des capacités médicales officiellement vérifiées sans source ;
* des performances ;
* des métriques ;
* des résultats expérimentaux non exécutés ;
* des résultats de tests qui n'ont pas réellement été effectués.

Si une donnée est synthétique, le signaler.

Si une hypothèse est nécessaire, la présenter comme une hypothèse.

Si une information manque, le signaler plutôt que l'inventer.

---

# 35. ATTITUDE ATTENDUE DES AGENTS

L'agent doit agir comme un développeur et un chercheur responsable.

Il doit :

* analyser avant de coder ;
* vérifier les données réelles ;
* signaler les incohérences ;
* proposer des solutions simples ;
* éviter la sur-ingénierie ;
* expliquer les décisions importantes ;
* écrire du code compréhensible ;
* tester les fonctions importantes ;
* respecter les objectifs du projet.

Si une instruction technique est incorrecte ou incohérente, l'agent doit le signaler.

Il doit proposer une meilleure alternative lorsque cela est nécessaire.

Il ne doit pas exécuter aveuglément une mauvaise approche simplement parce qu'elle a été demandée.

---

# 36. PRINCIPE DE SIMPLICITÉ

Ce projet est académique et soumis à une contrainte de temps.

L'objectif n'est donc pas de construire immédiatement un système médical industriel.

La priorité est de produire un moteur :

* fonctionnel ;
* propre ;
* compréhensible ;
* démontrable ;
* explicable ;
* scientifiquement défendable.

Ne pas ajouter une technologie uniquement pour rendre le projet plus impressionnant.

Chaque technologie ajoutée doit répondre à un besoin réel du projet.

---

# 37. CRITÈRE DE RÉUSSITE DE LA V1

La V1 est considérée comme réussie si, à partir :

* d'une position de patient ;
* d'un besoin médical ;
* du dataset des structures ;

le moteur est capable de :

1. identifier les structures pertinentes ;
2. calculer leur distance ;
3. évaluer leurs services ;
4. évaluer leurs spécialités ;
5. évaluer leur capacité de prise en charge ;
6. évaluer leur disponibilité ;
7. normaliser les critères ;
8. calculer un coût multicritère ;
9. construire/utiliser un graphe ;
10. appliquer Dijkstra ;
11. produire un classement ;
12. expliquer les principaux facteurs du classement.

---

# 38. OBJECTIF FINAL

Le moteur SIOM doit pouvoir répondre à une question simple :

> « Pour ce besoin médical et cette position géographique, quelles structures sanitaires sont les plus adaptées et pourquoi ? »

La réponse doit être fondée sur :

```text
PROXIMITÉ
+
SERVICES
+
SPÉCIALITÉS
+
CAPACITÉ DE PRISE EN CHARGE
+
DISPONIBILITÉ
```

Ces critères sont combinés dans un modèle de coût permettant ensuite d'utiliser un graphe pondéré et Dijkstra.

---

# 39. RÉSUMÉ OPÉRATIONNEL POUR L'AGENT

Toujours garder les points suivants en tête :

**SIOM = orientation médicale, PAS diagnostic.**

Stack V1 :

```text
Python
Pandas
NumPy
Scikit-learn
NetworkX
```

Algorithme central :

```text
Dijkstra
```

Distance :

```text
Haversine
```

Critères :

```text
Distance
Services
Spécialités
Capacité de prise en charge
Disponibilité
```

Dataset :

```text
GRID3 COD Health Facilities v9.0
+
données synthétiques du prototype lorsque nécessaire
```

Priorités :

```text
Simplicité
Qualité
Explicabilité
Cohérence
Rigueur académique
Rapidité de développement
```

Méthode de travail :

```text
ANALYSER
   ↓
IMPLÉMENTER
   ↓
TESTER
   ↓
EXPLIQUER
   ↓
VALIDER
```

Ne pas développer l'interface avant d'avoir validé le moteur d'orientation.

---

# FIN DU DOCUMENT AGENT.md

```
```
