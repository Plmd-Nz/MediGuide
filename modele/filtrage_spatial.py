"""
Module de pré-filtrage spatial progressif pour l'orientation médicale (SIOM).

Hiérarchie de recherche spatiale :
1. Ville / Agglomération locale du patient (rayon ~25 km ou même zone de santé).
   Si des structures compatibles atteignent au moins 80 % d'adéquation, on s'arrête là.
2. Toute la province du patient (si aucune structure locale n'atteint 80 %).
   Si des structures provinciales atteignent au moins 80 % d'adéquation, on s'arrête là.
3. Rayon interprovincial élargi (~300 km, englobant environ 3 provinces limitrophes).
   Si des structures régionales atteignent au moins 80 % d'adéquation, on s'arrête là.
4. Toute l'étendue de la République (si aucune structure régionale n'atteint 80 %).
"""

from math import isfinite
from modele.criteres import (
    calculer_score_capacite,
    calculer_score_capacite_affine,
    calculer_score_services,
    calculer_score_services_affine,
    calculer_score_specialites,
    calculer_score_specialites_affine,
    calculer_score_disponibilite,
)
from modele.distance import calculer_distance_haversine


RAYON_VILLE_KM = 25.0
RAYON_INTERPROVINCIAL_KM = 400.0
SEUIL_ADEQUATION_RECOMMANDEE = 0.80

LIBELLES_PORTEE = {
    "ville": "Ville / Proximité locale",
    "province": "Province complète",
    "interprovincial": "Rayon interprovincial (provinces limitrophes)",
    "national": "National (toute l'étendue de la RDC)",
}


def calculer_score_adequation(structure, besoin):
    """Calcule l'adéquation clinique globale entre la structure et le besoin exprimé [0, 1]."""
    scores = []
    if besoin.capacites_recherchees:
        scores.append(
            calculer_score_capacite(
                structure.get("capacite_prise_en_charge"),
                besoin.capacites_recherchees,
            )
        )
    if besoin.services_recherches:
        scores.append(
            calculer_score_services(
                structure.get("services"),
                besoin.services_recherches,
            )
        )
    if besoin.specialites_recherchees:
        scores.append(
            calculer_score_specialites(
                structure.get("specialites"),
                besoin.specialites_recherchees,
            )
        )
    if not scores:
        return 1.0
    return sum(scores) / len(scores)


def _evaluer_candidat(structure, latitude_patient, longitude_patient, besoin):
    """Évalue une structure unique et retourne son dictionnaire enrichi ou None si incompatible."""
    score_capacite = calculer_score_capacite(
        structure.get("capacite_prise_en_charge"),
        besoin.capacites_recherchees,
    )
    if besoin.capacites_recherchees and score_capacite == 0.0:
        return None

    try:
        lat = float(str(structure.get("lat", "")).replace(",", "."))
        lon = float(str(structure.get("lon", "")).replace(",", "."))
        distance_km = calculer_distance_haversine(
            latitude_patient,
            longitude_patient,
            lat,
            lon,
        )
    except (ValueError, TypeError):
        return None

    score_services = calculer_score_services_affine(
        structure.get("services"), besoin.services_recherches
    )
    score_specialites = calculer_score_specialites_affine(
        structure.get("specialites"), besoin.specialites_recherchees
    )
    score_capacite = calculer_score_capacite_affine(
        structure.get("capacite_prise_en_charge"),
        besoin.capacites_recherchees,
        lits=structure.get("capacite_lits"),
    )
    score_dispo = calculer_score_disponibilite(structure.get("disponibilite"))
    score_adequation = calculer_score_adequation(structure, besoin)

    return {
        **structure,
        "distance_km": distance_km,
        "score_services": score_services,
        "score_specialites": score_specialites,
        "score_capacite": score_capacite,
        "score_disponibilite": score_dispo,
        "score_adequation": score_adequation,
    }


def identifier_contexte_patient(structures, latitude_patient, longitude_patient):
    """Identifie la province et la zone de santé les plus proches du patient."""
    meilleure_structure = None
    distance_min_sq = float("inf")

    for s in structures:
        try:
            lat = float(str(s.get("lat", "")).replace(",", "."))
            lon = float(str(s.get("lon", "")).replace(",", "."))
            d2 = (lat - latitude_patient) ** 2 + (lon - longitude_patient) ** 2
            if d2 < distance_min_sq:
                distance_min_sq = d2
                meilleure_structure = s
        except (ValueError, TypeError):
            continue

    if meilleure_structure:
        return (
            meilleure_structure.get("province"),
            meilleure_structure.get("zonesante"),
            meilleure_structure.get("localite"),
        )
    return None, None, None


def prefiltrer_structures_par_palier(
    structures,
    latitude_patient,
    longitude_patient,
    besoin,
    seuil_adequation=SEUIL_ADEQUATION_RECOMMANDEE,
    rayon_ville_km=RAYON_VILLE_KM,
    rayon_interprovincial_km=RAYON_INTERPROVINCIAL_KM,
):
    """
    Applique la recherche par escalade spatiale :
    1. Ville -> 2. Province -> 3. Rayon interprovincial -> 4. République entière.
    Retourne (structures_evaluees, palier_atteint).
    """
    province_patient, zone_patient, localite_patient = identifier_contexte_patient(
        structures, latitude_patient, longitude_patient
    )

    # --------------------------------------------------------------------------
    # PALIER 1 : VILLE / AGGLOMÉRATION LOCALE
    # --------------------------------------------------------------------------
    candidats_ville = []
    for s in structures:
        # Même zone de santé dans la même province, ou même localité
        meme_zone = (
            zone_patient
            and s.get("zonesante") == zone_patient
            and s.get("province") == province_patient
        )
        # Pré-filtre rapide par boîte englobante (~0.35 degré correspond à ~38 km max)
        try:
            lat = float(str(s.get("lat", "")).replace(",", "."))
            lon = float(str(s.get("lon", "")).replace(",", "."))
            dans_boite = (
                abs(lat - latitude_patient) <= 0.35
                and abs(lon - longitude_patient) <= 0.35
            )
        except (ValueError, TypeError):
            dans_boite = False

        if meme_zone or dans_boite:
            eval_s = _evaluer_candidat(s, latitude_patient, longitude_patient, besoin)
            if eval_s is not None and (eval_s["distance_km"] <= rayon_ville_km or meme_zone):
                candidats_ville.append(eval_s)

    if candidats_ville and any(c["score_adequation"] >= seuil_adequation for c in candidats_ville):
        # On a trouvé des recommandations correspondantes au-delà du seuil dans la ville
        return candidats_ville, "ville"

    # --------------------------------------------------------------------------
    # PALIER 2 : TOUTE LA PROVINCE DU PATIENT
    # --------------------------------------------------------------------------
    candidats_province = []
    if province_patient:
        for s in structures:
            if s.get("province") == province_patient:
                eval_s = _evaluer_candidat(s, latitude_patient, longitude_patient, besoin)
                if eval_s is not None:
                    candidats_province.append(eval_s)

        if candidats_province and any(c["score_adequation"] >= seuil_adequation for c in candidats_province):
            return candidats_province, "province"

    # --------------------------------------------------------------------------
    # PALIER 3 : RAYON INTERPROVINCIAL ÉLARGI (~3 PROVINCES, ~300 KM)
    # --------------------------------------------------------------------------
    candidats_interprovinciaux = []
    # Pré-filtre rapide par boîte englobante (~4.0 degrés correspondent à ~440 km)
    for s in structures:
        try:
            lat = float(str(s.get("lat", "")).replace(",", "."))
            lon = float(str(s.get("lon", "")).replace(",", "."))
            if abs(lat - latitude_patient) > 4.0 or abs(lon - longitude_patient) > 4.0:
                continue
        except (ValueError, TypeError):
            continue

        eval_s = _evaluer_candidat(s, latitude_patient, longitude_patient, besoin)
        if eval_s is not None and eval_s["distance_km"] <= rayon_interprovincial_km:
            candidats_interprovinciaux.append(eval_s)

    if candidats_interprovinciaux and any(c["score_adequation"] >= seuil_adequation for c in candidats_interprovinciaux):
        return candidats_interprovinciaux, "interprovincial"

    # --------------------------------------------------------------------------
    # PALIER 4 : TOUTE L'ÉTENDUE DE LA RÉPUBLIQUE (NATIONAL)
    # --------------------------------------------------------------------------
    # Si même dans les provinces voisines il n'y a pas de bonne recommandation (>= 80 %),
    # on regarde sur toute l'étendue de la république
    candidats_nationaux = []
    for s in structures:
        eval_s = _evaluer_candidat(s, latitude_patient, longitude_patient, besoin)
        if eval_s is not None:
            candidats_nationaux.append(eval_s)

    # Si des candidats ont été trouvés au niveau national
    if candidats_nationaux:
        return candidats_nationaux, "national"

    # Si aucun candidat n'est compatible sur toute la république
    # On retourne ce qu'on avait pu trouver aux échelons précédents ou une liste vide
    for repli, nom in (
        (candidats_interprovinciaux, "interprovincial"),
        (candidats_province, "province"),
        (candidats_ville, "ville"),
    ):
        if repli:
            return repli, nom

    return [], "national"
