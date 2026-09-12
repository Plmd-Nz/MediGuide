# SIOM — SYSTÈME INTELLIGENT D’ORIENTATION MÉDICALE

**Version : 1.0 — Version initiale du projet**

---

# 1. Présentation générale du projet

## 1.1. Nom du projet

**SIOM — Système Intelligent d’Orientation Médicale**

SIOM est un système informatique conçu pour aider à orienter un patient vers des structures de santé adaptées à son besoin médical.

Le système prend en entrée les informations relatives au besoin du patient ainsi que sa position géographique. Il analyse ensuite les structures de santé disponibles dans le jeu de données de référence afin d'identifier celles qui sont compatibles avec le besoin exprimé.

Les structures compatibles sont évaluées selon plusieurs critères, notamment :

* la distance géographique ;
* les services disponibles ;
* les spécialités disponibles ;
* la capacité de prise en charge ;
* la disponibilité.

Le système produit ensuite un classement des structures les plus pertinentes.

---

# 2. Problématique

Dans de nombreux contextes, notamment dans les environnements où l'information sanitaire est dispersée, un patient peut rencontrer des difficultés pour identifier rapidement une structure de santé adaptée à son besoin.

La difficulté ne consiste pas uniquement à trouver la structure la plus proche.

Une structure peut être géographiquement proche mais ne pas disposer du service nécessaire, de la spécialité appropriée ou de la capacité de prise en charge correspondant au besoin du patient.

Le problème traité par SIOM est donc le suivant :

> **Comment identifier et classer automatiquement les structures de santé les plus adaptées à un besoin médical donné en tenant compte simultanément de leur proximité, de leurs services, de leurs spécialités, de leur capacité de prise en charge et de leur disponibilité ?**

SIOM cherche à apporter une réponse algorithmique à cette problématique.

---

# 3. Objectif général

L'objectif général de SIOM est de développer un système capable de produire une recommandation structurée de structures de santé adaptées à un besoin médical donné.

Le système doit permettre de passer de :

**besoin médical + position du patient**

à :

**liste classée de structures de santé compatibles et pertinentes.**

Le système doit également être capable d'expliquer les principaux éléments ayant conduit au classement.

---

# 4. Objectifs spécifiques

La version 1 du système doit permettre de :

1. charger et exploiter le jeu de données des structures de santé ;
2. nettoyer et valider les données ;
3. identifier les structures compatibles avec un besoin médical ;
4. calculer la distance entre le patient et chaque structure candidate ;
5. évaluer les services disponibles ;
6. évaluer les spécialités disponibles ;
7. évaluer la capacité de prise en charge ;
8. évaluer la disponibilité ;
9. normaliser les différents critères ;
10. calculer un coût global d'orientation ;
11. construire un graphe pondéré ;
12. utiliser l'algorithme de Dijkstra ;
13. classer les structures candidates ;
14. retourner les meilleures recommandations ;
15. conserver les informations permettant d'expliquer les recommandations.

---

# 5. Positionnement médical du système

SIOM est un **système d'orientation médicale**.

Il ne s'agit pas d'un système de diagnostic médical.

Le système ne doit pas déterminer automatiquement qu'un patient souffre d'une maladie précise.

Par exemple, si un utilisateur indique :

> "fièvre + maux de tête"

SIOM ne doit pas conclure :

> "Le patient souffre du paludisme."

Il doit plutôt interpréter ces informations comme un **besoin d'orientation** et rechercher les structures capables de prendre en charge ce type de problème.

Le système peut donc travailler avec des catégories de besoins telles que :

* paludisme ;
* fièvre ;
* infections respiratoires ;
* douleurs abdominales ;
* traumatismes ;
* fractures ;
* grossesse ;
* accouchement ;
* complications obstétricales ;
* maladies infantiles ;
* problèmes ophtalmologiques ;
* problèmes ORL ;
* etc.

La décision médicale finale reste du ressort du personnel de santé.

---

# 6. Périmètre de la version 1

La V1 est volontairement limitée afin de construire d'abord un modèle d'orientation fiable, compréhensible et testable.

La V1 traite uniquement :

**l'orientation d'un patient vers une structure de santé adaptée.**

Le système prend principalement en compte cinq dimensions :

1. proximité géographique ;
2. services ;
3. spécialités ;
4. capacité de prise en charge ;
5. disponibilité.

La V1 peut retourner un **Top 3**, un **Top 5** ou un nombre configurable de recommandations.

---

# 7. Fonctionnement général

Le fonctionnement global de SIOM suit la chaîne suivante :

```text
Patient
   │
   ▼
Besoin médical
   │
   ▼
Catégorisation du besoin
   │
   ▼
Recherche des structures compatibles
   │
   ▼
Calcul des critères
   │
   ├── Distance
   ├── Services
   ├── Spécialités
   ├── Capacité
   └── Disponibilité
   │
   ▼
Normalisation des critères
   │
   ▼
Calcul du coût d'orientation
   │
   ▼
Construction du graphe pondéré
   │
   ▼
Algorithme de Dijkstra
   │
   ▼
Classement des structures
   │
   ▼
Top des recommandations
   │
   ▼
Explication des résultats
```

---

# 8. Données de référence

Le jeu de données principal utilisé par le projet est :

**GRID3 COD Health Facilities v9.0**

Source :

https://data.grid3.org/datasets/GRID3::grid3-cod-health-facilities-v9-0/about

Le dataset contient les informations géographiques et administratives relatives aux structures de santé.

Le fichier de référence contient plusieurs dizaines de milliers d'enregistrements.

---

# 9. Structure des données

Les colonnes retenues pour le projet sont :

```text
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
```

---

# 10. Signification des principales colonnes

## 10.1. Informations administratives et géographiques

### province

Province dans laquelle se trouve la structure de santé.

### prov_uid

Identifiant de la province.

### antenne

Antenne ou entité administrative correspondante.

### zonesante

Zone de santé.

### zs_uid

Identifiant de la zone de santé.

### airesante

Aire de santé.

### as_uid

Identifiant de l'aire de santé.

### localite

Localité dans laquelle se trouve la structure.

---

# 11. Identification de la structure

### essnom1

Nom principal de la structure de santé.

C'est le nom qui sera principalement utilisé dans les résultats.

### esstype

Type de structure de santé.

Exemples possibles :

* Centre de Santé ;
* Hôpital ;
* Clinique ;
* autre type présent dans les données.

La V1 utilise `esstype` pour représenter le type de structure.

Aucune colonne supplémentaire `niveau_structure` n'est nécessaire dans la V1.

---

# 12. Informations administratives supplémentaires

### dhis2

Identifiant ou information liée au système DHIS2 lorsque disponible.

### categorie

Catégorie de la structure.

Elle peut notamment permettre de distinguer certaines structures publiques ou privées selon les données disponibles.

### vaccfixe

Indique l'information relative à la vaccination fixe lorsqu'elle est présente dans la source.

### frigo

Information relative à la présence ou à l'état d'un équipement frigorifique dans la donnée source.

Cette colonne est conservée dans le projet.

Elle pourra notamment être utile pour certains besoins futurs liés à la conservation ou à la gestion de certains services.

**Important :**

La présence de `frigo` ne doit pas automatiquement être interprétée comme la présence d'une morgue.

Une telle interprétation ne peut être faite que si elle est confirmée par une source fiable.

---

# 13. Coordonnées géographiques

### lat

Latitude de la structure.

### lon

Longitude de la structure.

### precision

Précision ou information associée à la localisation lorsque fournie par la source.

Les coordonnées `lat` et `lon` sont essentielles au calcul de la distance entre le patient et les structures de santé.

---

# 14. Métadonnées de la source

### date

Date associée à l'enregistrement ou à la donnée source.

### origine

Origine de la donnée.

### grid3id

Identifiant GRID3 de la structure ou de l'enregistrement.

### sourceid

Identifiant provenant de la source.

Ces informations sont conservées pour assurer la traçabilité des données.

---

# 15. Colonnes utilisées pour l'orientation

Quatre colonnes supplémentaires sont utilisées pour permettre au prototype de réaliser l'orientation :

```text
services
specialites
capacite_prise_en_charge
disponibilite
```

Ces colonnes constituent une partie essentielle du modèle d'orientation.

---

# 16. Colonne `services`

La colonne `services` représente les services disponibles dans une structure de santé.

Les services utilisés dans le prototype peuvent notamment être :

```text
Consultation générale
Urgences
Soins infirmiers
Maternité
Pédiatrie
Chirurgie
Hospitalisation
Laboratoire
Pharmacie
Vaccination
Radiologie
Échographie
Soins dentaires
Ophtalmologie
ORL
Médecine interne
Gynécologie
Santé maternelle et infantile
Santé sexuelle et reproductive
Morgue
```

Les valeurs utilisées dans le prototype doivent être considérées comme des données de modélisation lorsqu'elles ne proviennent pas directement d'une source officielle.

Elles ne doivent pas être présentées comme des informations réelles et vérifiées concernant chaque structure.

---

# 17. Colonne `specialites`

La colonne `specialites` représente les spécialités médicales disponibles dans une structure.

Les spécialités utilisées dans le prototype peuvent notamment être :

```text
Médecine générale
Médecine interne
Pédiatrie
Gynécologie
Obstétrique
Chirurgie générale
Cardiologie
Dermatologie
Neurologie
Infectiologie
Ophtalmologie
ORL
Dentisterie
Anesthésie-réanimation
Radiologie
Psychiatrie
Urologie
Orthopédie
Traumatologie
Néonatologie
```

Comme pour les services, les valeurs synthétiques utilisées pour le prototype doivent être clairement distinguées des données officiellement vérifiées.

---

# 18. Colonne `capacite_prise_en_charge`

Cette colonne représente les types de besoins médicaux que la structure est considérée comme capable de prendre en charge dans le cadre du modèle.

Les catégories utilisées peuvent notamment être :

```text
Paludisme
Choléra
Fièvre
Infections respiratoires
Infections digestives
Douleurs abdominales
Traumatismes
Fractures
Plaies
Brûlures
Grossesse
Accouchement
Complications obstétricales
Maladies infantiles
Maladies cardiovasculaires
Maladies dermatologiques
Maladies neurologiques
Problèmes ophtalmologiques
Problèmes ORL
Problèmes dentaires
Maladies infectieuses
Troubles digestifs
Urgences médicales
Urgences chirurgicales
Interventions chirurgicales
Soins post-opératoires
Soins néonatals
Santé mentale
Soins palliatifs
Prise en charge des défunts
```

Cette colonne est utilisée pour déterminer si une structure est compatible avec le besoin médical exprimé.

---

# 19. Colonne `disponibilite`

La disponibilité représente le niveau de disponibilité de la structure dans le modèle.

Les valeurs utilisées sont :

```text
Très disponible
Disponible
Disponibilité limitée
Indisponible
```

Une correspondance numérique peut être utilisée pour le calcul :

```text
Très disponible       = 1.00
Disponible            = 0.75
Disponibilité limitée = 0.40
Indisponible          = 0.00
```

Ces valeurs constituent une **convention de modélisation**.

Elles ne représentent pas une mesure médicale universelle.

Elles pourront être modifiées lorsque des données de disponibilité réelles seront disponibles.

---

# 20. Nature des données synthétiques

Une distinction stricte doit être faite entre :

**données sources**

et

**données ajoutées pour le prototype.**

Les informations issues directement de GRID3 doivent rester traçables.

Les informations ajoutées artificiellement pour permettre la simulation du modèle doivent être considérées comme des données expérimentales.

Il est interdit de présenter une donnée synthétique comme une information réelle concernant un hôpital, une clinique ou un centre de santé.

---

# 21. Entrées du système

La V1 doit pouvoir travailler à partir d'un patient représenté au minimum par :

```text
latitude_patient
longitude_patient
besoin_medical
```

Le besoin médical peut être représenté par :

* une catégorie déjà identifiée ;
* ou une catégorie dérivée des informations fournies.

La V1 ne cherche pas à construire un modèle complexe de compréhension automatique des symptômes.

L'objectif est d'abord de valider le moteur d'orientation.

---

# 22. Représentation du besoin médical

Pour que le système puisse comparer le besoin du patient aux capacités des structures, le besoin doit être représenté sous une forme structurée.

Exemple :

```text
Besoin :
Traumatismes

Services recherchés :
Urgences

Spécialités recherchées :
Traumatologie

Capacité recherchée :
Traumatismes
```

Un autre exemple :

```text
Besoin :
Grossesse

Services recherchés :
Maternité

Spécialités recherchées :
Gynécologie, Obstétrique

Capacité recherchée :
Grossesse, Accouchement
```

Cette représentation permet au moteur de comparer le besoin aux informations des structures.

---

# 23. Filtrage des structures incompatibles

Avant de calculer le classement final, le système doit éliminer les structures manifestement incompatibles.

Cette étape est importante.

Il ne serait pas pertinent de recommander une structure qui ne possède aucun service ou aucune capacité correspondant au besoin exprimé.

Le filtrage doit donc permettre de réduire l'ensemble initial :

```text
Toutes les structures
        ↓
Structures compatibles
        ↓
Structures évaluables
        ↓
Structures classées
```

Le filtrage ne doit cependant pas être excessivement strict au point de supprimer toutes les possibilités lorsque les données sont incomplètes.

La stratégie exacte de filtrage doit être documentée et testée.

---

# 24. Calcul de la distance

La distance entre le patient et une structure est calculée à partir des coordonnées géographiques.

La V1 utilise la **formule de Haversine**.

La formule permet d'estimer la distance géographique entre deux points définis par leur latitude et leur longitude.

Les points sont :

```text
Patient :
(latitude_patient, longitude_patient)

Structure :
(lat, lon)
```

La fonction principale prévue est :

```python
calculer_distance_haversine()
```

La distance doit être exprimée dans une unité cohérente, par exemple en kilomètres.

---

# 25. Critère de proximité

La proximité est un critère important de l'orientation.

Une structure proche doit généralement être favorisée.

Cependant :

> **La structure la plus proche n'est pas automatiquement la meilleure structure.**

Exemple :

```text
Structure A
Distance : 1 km
Service nécessaire : absent

Structure B
Distance : 4 km
Service nécessaire : présent
```

La structure B peut être plus pertinente que la structure A.

La distance doit donc être combinée aux autres critères.

---

# 26. Évaluation des services

Le système doit comparer les services recherchés avec les services disponibles dans chaque structure.

Une structure disposant des services nécessaires doit obtenir un meilleur score de compatibilité.

L'objectif n'est pas simplement de compter le nombre total de services.

Il faut évaluer leur **pertinence par rapport au besoin du patient**.

---

# 27. Évaluation des spécialités

Le même principe est appliqué aux spécialités.

Le système compare les spécialités nécessaires avec les spécialités disponibles.

Une structure disposant de la spécialité recherchée doit être favorisée.

Exemple :

```text
Besoin :
Traumatisme

Spécialité recherchée :
Traumatologie
```

Une structure possédant `Traumatologie` doit être mieux classée qu'une structure ne possédant pas cette spécialité, toutes choses étant égales par ailleurs.

---

# 28. Évaluation de la capacité

La capacité de prise en charge est directement comparée au besoin.

Exemple :

```text
Besoin :
Fracture

Structure A :
capacite_prise_en_charge = Fractures

Structure B :
capacite_prise_en_charge = Maladies dermatologiques
```

La structure A est compatible.

La structure B ne doit pas être considérée comme une candidate équivalente.

La capacité constitue donc un critère majeur du système.

---

# 29. Évaluation de la disponibilité

La disponibilité permet de distinguer plusieurs niveaux :

```text
Très disponible
Disponible
Disponibilité limitée
Indisponible
```

Une structure indisponible ne doit normalement pas être recommandée lorsqu'une structure compatible et disponible existe.

La logique exacte doit rester configurable.

---

# 30. Normalisation des critères

Les critères utilisés dans le système ont des échelles différentes.

Par exemple :

```text
Distance → kilomètres
Disponibilité → catégorie
Services → compatibilité
Spécialités → compatibilité
Capacité → compatibilité
```

Avant de les combiner, les critères doivent être transformés dans une échelle comparable.

La normalisation peut notamment être effectuée avec :

```python
MinMaxScaler
```

de Scikit-learn.

La normalisation doit être documentée afin de rendre le modèle compréhensible.

---

# 31. Transformation en coût

Le modèle utilise une logique de minimisation.

La règle fondamentale est :

> **Plus une structure est adaptée, plus son coût d'orientation doit être faible.**

Ainsi :

```text
Bonne proximité
        ↓
coût faible

Bonne compatibilité
        ↓
coût faible

Bonne disponibilité
        ↓
coût faible
```

À l'inverse :

```text
Grande distance
        ↓
coût élevé

Faible compatibilité
        ↓
coût élevé

Faible disponibilité
        ↓
coût élevé
```

---

# 32. Fonction de coût globale

Le coût global peut être représenté par :

```text
C =
wd  × D
+
ws  × S
+
wsp × SP
+
wc  × CP
+
wa  × A
```

Avec :

```text
D  = coût lié à la distance
S  = coût lié aux services
SP = coût lié aux spécialités
CP = coût lié à la capacité de prise en charge
A  = coût lié à la disponibilité
```

Et :

```text
wd  = poids de la distance
ws  = poids des services
wsp = poids des spécialités
wc  = poids de la capacité
wa  = poids de la disponibilité
```

---

# 33. Gestion des poids

Les poids ne doivent jamais être dispersés dans le code.

Ils doivent être centralisés dans :

```text
configuration/poids.py
```

Exemple initial de configuration expérimentale :

```python
POIDS = {
    "distance": 0.20,
    "services": 0.20,
    "specialites": 0.20,
    "capacite": 0.20,
    "disponibilite": 0.20,
}
```

Ces valeurs sont des valeurs initiales de travail.

Elles ne doivent pas être présentées comme des poids médicalement validés.

Les poids devront pouvoir être ajustés et évalués expérimentalement.

---

# 34. Pourquoi utiliser Dijkstra ?

La V1 utilise l'algorithme de **Dijkstra** comme mécanisme de recherche du coût minimal dans un graphe pondéré.

Dijkstra permet de rechercher un chemin présentant le coût total minimal lorsque les poids des arêtes sont non négatifs.

Dans SIOM, cette logique permet d'intégrer les coûts calculés pour les structures candidates dans une représentation en graphe.

Il est important de comprendre que :

> **Dijkstra ne calcule pas lui-même la pertinence médicale d'une structure.**

La pertinence est d'abord transformée en coûts.

Dijkstra intervient ensuite pour rechercher la solution de coût minimal dans le graphe.

---

# 35. Construction du graphe

Le système utilise un graphe pondéré.

Les structures compatibles sont représentées dans le graphe.

Les connexions associées aux structures sont pondérées à partir du coût d'orientation calculé.

Le graphe doit être construit après :

1. le filtrage ;
2. le calcul de la distance ;
3. l'évaluation des critères ;
4. la normalisation ;
5. le calcul du coût.

L'ordre des opérations est donc important.

---

# 36. Utilisation de NetworkX

La bibliothèque :

```python
networkx
```

est utilisée pour faciliter la représentation et l'exploitation du graphe.

Import typique :

```python
import networkx as nx
```

NetworkX ne remplace pas la logique métier du projet.

Le code doit d'abord calculer correctement les coûts avant d'utiliser les fonctions de graphe.

---

# 37. Résultat attendu

Le système doit retourner un classement de structures.

Exemple conceptuel :

```text
1. Structure A
   Distance : 2.3 km
   Services : compatible
   Spécialités : compatible
   Capacité : compatible
   Disponibilité : très disponible
   Coût : 0.18

2. Structure B
   Distance : 3.7 km
   Services : compatible
   Spécialités : compatible
   Capacité : compatible
   Disponibilité : disponible
   Coût : 0.27

3. Structure C
   Distance : 5.1 km
   Services : partiellement compatible
   Spécialités : compatible
   Capacité : compatible
   Disponibilité : disponible
   Coût : 0.35
```

Les valeurs ci-dessus sont uniquement illustratives.

Elles ne représentent pas des résultats réels.

---

# 38. Explicabilité

L'explicabilité est une exigence importante du projet.

Le système ne doit pas retourner uniquement :

```text
Structure A
```

Il doit être possible de comprendre pourquoi cette structure est bien classée.

Les résultats doivent conserver autant que possible :

```text
nom de la structure
distance
score de service
score de spécialité
score de capacité
score de disponibilité
coût final
rang
```

Cette approche permet de vérifier le fonctionnement du modèle.

---

# 39. Exemple de logique d'orientation

Supposons qu'un patient se trouve à une certaine position géographique et demande une orientation pour un traumatisme.

Le système peut rechercher :

```text
Besoin :
Traumatisme
```

Puis déterminer :

```text
Service recherché :
Urgences

Spécialité recherchée :
Traumatologie

Capacité recherchée :
Traumatismes
```

Le système filtre ensuite les structures ne répondant pas aux exigences minimales.

Pour les structures restantes, il calcule :

```text
distance
+
compatibilité services
+
compatibilité spécialités
+
compatibilité capacité
+
disponibilité
```

Il transforme ensuite ces critères en coût.

Enfin, il utilise le graphe et Dijkstra pour produire le classement.

---

# 40. Gestion des cas sans structure compatible

Il est possible qu'aucune structure ne satisfasse suffisamment les critères.

Dans ce cas, le système ne doit pas inventer une recommandation.

Il doit retourner une réponse indiquant qu'aucune structure suffisamment compatible n'a été trouvée dans les données disponibles.

Exemple :

```text
Aucune structure suffisamment compatible n'a été trouvée
pour le besoin médical demandé.
```

Les données disponibles doivent toujours déterminer les résultats.

---

# 41. Gestion des données manquantes

Les données manquantes doivent être traitées explicitement.

Le système ne doit jamais inventer silencieusement une information.

Exemple :

Si une structure ne possède pas de coordonnées GPS :

```text
lat = manquant
lon = manquant
```

elle ne peut pas être évaluée correctement sur le critère géographique.

La stratégie de traitement doit être clairement définie.

---

# 42. Qualité des données

Avant l'utilisation dans le modèle, les données doivent être contrôlées.

Les contrôles doivent notamment porter sur :

* les coordonnées ;
* les valeurs manquantes ;
* les doublons ;
* les types de données ;
* les valeurs incohérentes ;
* les catégories inattendues ;
* les identifiants.

La validation des données doit être séparée de la logique d'orientation.

---

# 43. Architecture du projet

L'architecture de la V1 est organisée comme suit :

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
├── AGENT.md
└── Projet.md
```

---

# 44. Responsabilité des modules

## `traitement/nettoyage.py`

Responsable du nettoyage des données.

Exemples :

* suppression ou traitement des doublons ;
* correction des types ;
* traitement des valeurs manquantes ;
* nettoyage des chaînes de caractères.

---

## `traitement/validation.py`

Responsable de la validation de la qualité des données.

Exemples :

* validation des coordonnées ;
* vérification des colonnes obligatoires ;
* vérification des valeurs attendues ;
* contrôle de cohérence.

---

## `traitement/normalisation.py`

Responsable de la normalisation des critères.

---

## `modele/distance.py`

Responsable du calcul des distances géographiques.

Fonction principale prévue :

```python
calculer_distance_haversine()
```

---

## `modele/criteres.py`

Responsable de l'évaluation :

* des services ;
* des spécialités ;
* de la capacité ;
* de la disponibilité.

Fonctions possibles :

```python
calculer_score_services()
calculer_score_specialites()
calculer_score_capacite()
calculer_score_disponibilite()
```

---

## `modele/cout.py`

Responsable du calcul du coût global d'orientation.

Fonction principale prévue :

```python
calculer_cout_orientation()
```

---

## `modele/graphe.py`

Responsable de la construction du graphe pondéré et de l'utilisation de l'algorithme de Dijkstra.

Fonction possible :

```python
construire_graphe()
```

---

## `modele/orientation.py`

Responsable de la logique globale d'orientation.

Fonction principale prévue :

```python
obtenir_recommandations()
```

---

## `configuration/poids.py`

Contient les poids utilisés par le modèle.

Les paramètres doivent être centralisés ici.

---

## `tests/`

Contient les tests du système.

---

## `main.py`

Point d'entrée permettant d'exécuter le prototype.

---

# 45. Convention de programmation

Tout le code développé dans le projet doit être écrit en français lorsque cela est possible.

Cela concerne :

* variables ;
* fonctions ;
* classes ;
* commentaires ;
* docstrings ;
* messages ;
* logs ;
* documentation technique.

Exemples :

```python
distance_km
structure_candidate
besoin_medical
score_services
score_specialites
score_capacite
score_disponibilite
cout_orientation
```

Les noms imposés par Python ou les bibliothèques ne doivent évidemment pas être traduits.

Exemple :

```python
import pandas as pd
import numpy as np
import networkx as nx

from sklearn.preprocessing import MinMaxScaler
```

---

# 46. Bibliothèques de la V1

Les bibliothèques principales sont :

## Python

Langage principal du projet.

## Pandas

Utilisé pour :

* charger les données ;
* manipuler les tableaux ;
* filtrer les structures ;
* préparer les données.

## NumPy

Utilisé pour les calculs numériques.

## Scikit-learn

Principalement utilisé pour les opérations de normalisation.

## NetworkX

Utilisé pour :

* représenter le graphe ;
* manipuler les nœuds et les arêtes ;
* appliquer Dijkstra.

---

# 47. Machine Learning

La V1 **n'utilise pas de Machine Learning**.

Cette décision est volontaire.

L'utilisation d'un modèle de Machine Learning nécessite des données historiques suffisantes et fiables.

Pour apprendre à recommander une structure, il faudrait notamment disposer d'un historique contenant des orientations validées et suffisamment représentatives.

En l'absence d'un tel jeu de données, un modèle de Machine Learning risquerait de produire des recommandations difficiles à justifier.

La V1 utilise donc une approche algorithmique déterministe et explicable.

---

# 48. Technologies exclues de la V1

Les technologies suivantes ne doivent pas être introduites dans la V1 sans décision explicite de l'équipe :

```text
Random Forest
XGBoost
TensorFlow
PyTorch
Gemini
LLM
RAG
Deep Learning
modèles génératifs
```

La priorité actuelle est la validation du moteur d'orientation.

---

# 49. Ce qui pourra être ajouté dans les versions futures

Les versions futures pourront éventuellement intégrer :

* un véritable historique d'orientations ;
* du Machine Learning ;
* une meilleure compréhension des symptômes ;
* des données de disponibilité en temps réel ;
* des données de capacité réelles ;
* des données routières ;
* un système cartographique ;
* une API ;
* une interface web ;
* une application mobile ;
* un système d'apprentissage basé sur les orientations validées ;
* des mécanismes d'évaluation des recommandations.

Ces éléments ne font pas partie du périmètre obligatoire de la V1.

---

# 50. Principe de responsabilité médicale

SIOM doit toujours être présenté comme un **outil d'aide à l'orientation**.

Il ne doit pas être présenté comme :

```text
un médecin ;
un outil de diagnostic ;
un système de décision médicale autonome ;
un remplacement du personnel de santé.
```

La recommandation produite par le système doit être considérée comme une aide à la recherche d'une structure appropriée.

---

# 51. Principe de transparence

Les résultats doivent pouvoir être expliqués à l'équipe de développement et, autant que possible, à l'utilisateur.

Une recommandation doit être liée à des critères mesurables.

Le système doit éviter autant que possible les décisions opaques.

---

# 52. Principe de non-invention

Une règle fondamentale du projet est :

> **Le système ne doit jamais inventer une information concernant une structure de santé.**

Si une information n'est pas connue :

```text
information inconnue
```

doit rester une information inconnue.

Il ne faut pas automatiquement considérer :

```text
inconnu = disponible
```

ou :

```text
inconnu = compatible
```

sans règle explicitement définie.

---

# 53. Principe de reproductibilité

Pour une même entrée et une même configuration des données et des poids, le système doit produire un résultat reproductible.

Les recommandations ne doivent pas changer arbitrairement d'une exécution à l'autre.

---

# 54. Principe de modularité

Chaque partie du système doit avoir une responsabilité claire.

Le traitement des données ne doit pas être mélangé avec le calcul de distance.

Le calcul de distance ne doit pas être mélangé avec la construction du graphe.

La configuration des poids ne doit pas être dispersée dans les fonctions.

Cette séparation facilite :

* les tests ;
* la maintenance ;
* l'évolution du modèle ;
* la compréhension du projet.

---

# 55. Tests minimums

La V1 doit comporter au minimum des tests pour :

### Distance

Tester notamment :

* deux coordonnées identiques ;
* deux coordonnées différentes ;
* coordonnées invalides ;
* valeurs manquantes.

### Critères

Tester :

* service présent ;
* service absent ;
* spécialité présente ;
* spécialité absente ;
* capacité compatible ;
* capacité incompatible ;
* différentes disponibilités.

### Orientation

Tester :

* plusieurs structures compatibles ;
* aucune structure compatible ;
* une seule structure compatible ;
* structures avec différentes distances ;
* structures avec différentes disponibilités.

---

# 56. Ordre de développement

Le développement de la V1 doit suivre cet ordre :

```text
1. Préparation des données
        ↓
2. Nettoyage
        ↓
3. Validation
        ↓
4. Normalisation
        ↓
5. Calcul de distance
        ↓
6. Calcul des critères
        ↓
7. Calcul du coût
        ↓
8. Filtrage
        ↓
9. Construction du graphe
        ↓
10. Dijkstra
        ↓
11. Classement
        ↓
12. Explicabilité
        ↓
13. Tests
```

Il ne faut pas commencer par construire une interface alors que le moteur d'orientation n'est pas encore validé.

---

# 57. Critères de réussite de la V1

La V1 est considérée comme fonctionnellement valide lorsque le système peut :

* charger correctement les données ;
* valider les données ;
* accepter une position de patient ;
* accepter un besoin médical ;
* identifier les structures candidates ;
* filtrer les structures incompatibles ;
* calculer les distances ;
* calculer les critères ;
* normaliser les critères ;
* calculer le coût global ;
* construire le graphe ;
* exécuter Dijkstra ;
* produire un classement ;
* retourner les meilleures structures ;
* expliquer le classement ;
* gérer l'absence de structures compatibles ;
* gérer les données manquantes de manière contrôlée ;
* être testé de manière reproductible.

---

# 58. Résumé conceptuel

SIOM V1 peut être résumé par l'équation conceptuelle suivante :

```text
Orientation =
Compatibilité médicale
+
Proximité géographique
+
Disponibilité
+
Coût global
```

Mais techniquement, le processus complet est :

```text
Besoin du patient
        ↓
Identification des exigences
        ↓
Filtrage des structures incompatibles
        ↓
Calcul de la distance Haversine
        ↓
Évaluation des services
        ↓
Évaluation des spécialités
        ↓
Évaluation de la capacité
        ↓
Évaluation de la disponibilité
        ↓
Normalisation
        ↓
Calcul du coût
        ↓
Graphe pondéré
        ↓
Dijkstra
        ↓
Classement
        ↓
Top des recommandations
```

---

# 59. Règle fondamentale du projet

Le développement de SIOM doit toujours respecter les trois priorités suivantes :

```text
1. COHÉRENCE
2. EXPLICABILITÉ
3. QUALITÉ DES DONNÉES
```

Un système complexe mais impossible à expliquer n'est pas prioritaire.

Un modèle très performant sur des données non fiables n'est pas acceptable.

Une recommandation qui ne peut pas être justifiée doit être considérée avec prudence.

La V1 doit donc privilégier un modèle simple, compréhensible, testable et progressivement améliorable.

---

# 60. État cible de la V1

À la fin de la V1, l'équipe doit disposer d'un moteur Python capable de recevoir une entrée similaire à :

```text
Position du patient :
latitude = ...
longitude = ...

Besoin :
Traumatisme
```

et de produire une sortie similaire à :

```text
Recommandations :

1. Structure A
   Distance : ...
   Services : ...
   Spécialités : ...
   Capacité : ...
   Disponibilité : ...
   Coût : ...

2. Structure B
   Distance : ...
   Services : ...
   Spécialités : ...
   Capacité : ...
   Disponibilité : ...
   Coût : ...

3. Structure C
   Distance : ...
   Services : ...
   Spécialités : ...
   Capacité : ...
   Disponibilité : ...
   Coût : ...
```

La V1 ne cherche pas encore à être un système médical complet.

Elle cherche à démontrer qu'il est possible de construire un **moteur d'orientation médicale basé sur des données de structures de santé, des critères explicites, une fonction de coût et un algorithme de recherche sur graphe.**

---

# 61. Conclusion

SIOM est conçu comme un système d'aide à l'orientation médicale permettant de rapprocher un besoin de santé d'une structure capable de répondre à ce besoin.

La V1 repose volontairement sur une approche algorithmique explicable :

```text
Données
→ Nettoyage
→ Validation
→ Besoin médical
→ Compatibilité
→ Distance
→ Critères
→ Normalisation
→ Coût
→ Graphe
→ Dijkstra
→ Recommandations
```

Cette première version constitue le socle du projet.

L'objectif n'est pas d'introduire immédiatement de l'intelligence artificielle complexe, mais de construire d'abord un moteur d'orientation fiable, mesurable, compréhensible et techniquement solide.

Les améliorations futures pourront ensuite s'appuyer sur ce socle pour intégrer progressivement des données plus riches, des mécanismes d'apprentissage automatique et éventuellement des fonctionnalités avancées.

**SIOM V1 = un moteur d'orientation médicale explicable, basé sur les données disponibles et sur une combinaison contrôlée de critères de compatibilité et de proximité.**
