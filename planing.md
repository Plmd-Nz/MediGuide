# Planning de développement de SIOM V1

## Étape 1 — Inspection du dataset

- Identifier le fichier de référence et conserver l'original intact.
- Mesurer les dimensions, colonnes, types, valeurs manquantes et doublons.
- Vérifier les coordonnées, catégories et champs d'orientation.
- Documenter les écarts entre le dataset réel et la documentation.

## Étape 2 — Pré-traitement et nettoyage

- Charger le CSV avec Pandas.
- Uniformiser les noms de colonnes, notamment `disponibilites` vers `disponibilite`.
- Nettoyer les chaînes et les listes séparées par `;`.
- Convertir les coordonnées en nombres, y compris les décimales à virgule.
- Ne jamais remplacer silencieusement une donnée manquante.
- Exporter une copie préparée dans `donnees/dataset_prepare/`.

## Étape 3 — Validation des données

- Vérifier les colonnes obligatoires et les plages géographiques.
- Contrôler les valeurs de disponibilité et les doublons.
- Produire un rapport de validation exploitable par le moteur.

## Étape 4 — Représentation du besoin

- Définir une structure simple pour le besoin médical.
- Associer au besoin les services, spécialités et capacités recherchés.
- Distinguer une catégorie d'orientation d'un diagnostic médical.

## Étape 5 — Critères et distance

- Implémenter la distance de Haversine.
- Implémenter les scores de services, spécialités, capacité et disponibilité.
- Tester les cas normaux, vides et invalides.

## Étape 6 — Normalisation et coût

- Normaliser les critères sur une échelle comparable.
- Transformer les compatibilités en coûts à minimiser.
- Centraliser et vérifier les poids dans `configuration/poids.py`.

## Étape 7 — Filtrage et graphe

- Filtrer les structures manifestement incompatibles.
- Construire le graphe pondéré avec NetworkX.
- Vérifier que les poids sont non négatifs.

## Étape 8 — Dijkstra et classement

- Exécuter Dijkstra depuis le nœud patient.
- Produire un classement Top 3 ou Top 5 configurable.
- Conserver les critères intermédiaires pour l'explicabilité.

## Étape 9 — Tests d'intégration

- Tester plusieurs besoins médicaux représentatifs.
- Tester l'absence de structure compatible et les données manquantes.
- Vérifier la reproductibilité des résultats.
- État : terminée pour les scénarios unitaires et d'intégration du moteur.

## Étape 10 — Démonstration finale

- Exécuter le moteur depuis `main.py`.
- Distinguer clairement les données synthétiques des données sources.
- Vérifier que le résultat reste une aide à l'orientation et non un diagnostic.
- État : terminée avec le scénario exécutable de `main.py`.

## Évolution chatbot

- Stabiliser l'interpréteur local : implémenté dans `modele/besoins.py` et `services/interpretation_besoin.py`.
- Créer les fonctions d'explication textuelle : implémenté dans `modele/orientation.py` et `services/generation_reponse.py`.
- Créer l'interface Streamlit sans géolocalisation : implémenté dans `interface/application_streamlit.py`.
- Connecter l'interface au moteur SIOM : implémenté.
- Ajouter l'historique de conversation : implémenté avec `st.session_state`.
- Ajouter la position manuelle : implémenté dans `services/localisation.py`.
- Ajouter la géolocalisation automatique : branchement optionnel prévu avec `streamlit-geolocation`.
- Ajouter Gemini derrière une abstraction : implémenté dans `services/client_llm.py`, désactivé par défaut.
- Tester les erreurs et demandes ambiguës : premiers tests de services ajoutés.
- Améliorer l'apparence du chatbot : version Streamlit fonctionnelle à enrichir après validation.