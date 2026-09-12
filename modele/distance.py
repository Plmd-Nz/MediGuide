"""Calcul des distances géographiques du projet SIOM."""

from math import asin, cos, isfinite, radians, sin, sqrt


RAYON_TERRESTRE_KM = 6371.0


def _valider_coordonnees(latitude, longitude, nom_point):
	"""Vérifie qu'un point géographique contient des coordonnées valides."""
	try:
		latitude = float(latitude)
		longitude = float(longitude)
	except (TypeError, ValueError) as erreur:
		raise ValueError(
			f"Les coordonnées du point {nom_point} doivent être numériques."
		) from erreur

	if not isfinite(latitude) or not isfinite(longitude):
		raise ValueError(
			f"Les coordonnées du point {nom_point} doivent être finies."
		)

	if not -90 <= latitude <= 90:
		raise ValueError(
			f"La latitude du point {nom_point} doit être comprise entre -90 et 90."
		)

	if not -180 <= longitude <= 180:
		raise ValueError(
			f"La longitude du point {nom_point} doit être comprise entre -180 et 180."
		)

	return latitude, longitude


def calculer_distance_haversine(
	latitude_patient,
	longitude_patient,
	latitude_structure,
	longitude_structure,
):
	"""Calcule la distance approximative en kilomètres entre deux points GPS."""
	latitude_patient, longitude_patient = _valider_coordonnees(
		latitude_patient,
		longitude_patient,
		"du patient",
	)
	latitude_structure, longitude_structure = _valider_coordonnees(
		latitude_structure,
		longitude_structure,
		"de la structure",
	)

	difference_latitude = radians(latitude_structure - latitude_patient)
	difference_longitude = radians(longitude_structure - longitude_patient)
	latitude_patient_rad = radians(latitude_patient)
	latitude_structure_rad = radians(latitude_structure)

	terme_haversine = (
		sin(difference_latitude / 2) ** 2
		+ cos(latitude_patient_rad)
		* cos(latitude_structure_rad)
		* sin(difference_longitude / 2) ** 2
	)
	angle_central = 2 * asin(sqrt(terme_haversine))

	return RAYON_TERRESTRE_KM * angle_central
