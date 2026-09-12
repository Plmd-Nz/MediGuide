"""Construction du graphe et classement par Dijkstra."""

from math import isfinite

import networkx as nx


NOEUD_PATIENT = "patient"


def _obtenir_valeur(structure, nom, valeur_par_defaut=None):
	"""Lit une valeur dans un dictionnaire ou dans un objet compatible."""
	if isinstance(structure, dict):
		return structure.get(nom, valeur_par_defaut)
	return getattr(structure, nom, valeur_par_defaut)


def _valider_cout(cout):
	"""Vérifie qu'un poids d'arête est valide pour Dijkstra."""
	try:
		cout = float(cout)
	except (TypeError, ValueError) as erreur:
		raise ValueError("Le coût d'une structure doit être numérique.") from erreur

	if not isfinite(cout) or cout < 0:
		raise ValueError("Le coût d'une structure doit être fini et positif ou nul.")

	return cout


def construire_graphe(structures, noeud_patient=NOEUD_PATIENT):
	"""Construit un graphe patient-structures pondéré par le coût d'orientation."""
	graphe = nx.Graph()
	graphe.add_node(noeud_patient, type_noeud="patient")

	for structure in structures:
		identifiant = _obtenir_valeur(structure, "identifiant")
		identifiant = identifiant or _obtenir_valeur(structure, "grid3id")
		if not identifiant:
			raise ValueError("Chaque structure doit posséder un identifiant.")
		if identifiant == noeud_patient:
			raise ValueError("L'identifiant d'une structure ne peut pas être celui du patient.")
		if identifiant in graphe:
			raise ValueError(f"Identifiant de structure dupliqué : {identifiant}.")

		cout = _valider_cout(
			_obtenir_valeur(structure, "cout_orientation")
		)
		attributs = dict(structure) if isinstance(structure, dict) else {
			"structure": _obtenir_valeur(structure, "structure"),
		}
		attributs["identifiant"] = identifiant
		attributs["type_noeud"] = "structure"
		graphe.add_node(identifiant, **attributs)
		graphe.add_edge(noeud_patient, identifiant, poids=cout)

	return graphe


def obtenir_classement_dijkstra(
	graphe,
	noeud_patient=NOEUD_PATIENT,
	nombre_recommandations=None,
):
	"""Retourne les structures classées par coût croissant avec Dijkstra."""
	if noeud_patient not in graphe:
		raise ValueError("Le nœud du patient est absent du graphe.")
	if nombre_recommandations is not None and nombre_recommandations < 1:
		raise ValueError("Le nombre de recommandations doit être positif.")

	distances = nx.single_source_dijkstra_path_length(
		graphe,
		noeud_patient,
		weight="poids",
	)
	classement = []

	for identifiant, cout in sorted(
		(
			(identifiant, cout)
			for identifiant, cout in distances.items()
			if identifiant != noeud_patient
		),
		key=lambda element: (element[1], str(element[0])),
	):
		attributs = dict(graphe.nodes[identifiant])
		attributs["cout_orientation"] = cout
		attributs["rang"] = len(classement) + 1
		classement.append(attributs)

		if (
			nombre_recommandations is not None
			and len(classement) >= nombre_recommandations
		):
			break

	return classement
