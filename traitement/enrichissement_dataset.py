"""
Script de redressement et d'enrichissement médical du dataset SIOM.
Assigne des services, spécialités, capacités cliniques, capacité litière (lits)
et disponibilités cohérentes selon la pyramide sanitaire de la RDC et les
spécificités réelles des grands centres hospitaliers (Kinshasa, Nord-Kivu/Goma/Beni/Butembo,
Sud-Kivu/Bukavu/Uvira, Haut-Katanga/Lubumbashi, Tshopo/Kisangani, etc.).
"""

import re
import unicodedata
import pandas as pd
from pathlib import Path


def normaliser_chaine(texte):
    """Supprime les accents, met en minuscules et normalise les espaces."""
    if not texte or pd.isna(texte):
        return ""
    texte = unicodedata.normalize("NFKD", str(texte))
    texte = "".join(c for c in texte if not unicodedata.combining(c))
    return " ".join(texte.lower().split())


# ==============================================================================
# 1. MATRICE NATIONALE SELON LA PYRAMIDE SANITAIRE DE LA RDC (PMA / PCA)
# ==============================================================================
PROFILES_PAR_TYPE = {
    # NIVEAU 1 : SOINS DE SANTE PRIMAIRES & POSTES DE SANTE
    "Poste de Sante": {
        "services": "Soins infirmiers; Consultation generale; Pharmacie",
        "specialites": "Medecine generale",
        "capacites": "Paludisme; Fievre; Plaies; Diarrhees; Infections respiratoires; Maladies infantiles",
        "lits": 4,
        "disponibilite": "Disponibilite limitee", # Ouvert en journee
    },
    "Site Soin Communautaire": {
        "services": "Soins infirmiers; Consultation generale",
        "specialites": "Medecine generale",
        "capacites": "Paludisme; Fievre; Diarrhees; Maladies infantiles",
        "lits": 2,
        "disponibilite": "Disponibilite limitee",
    },
    "Dispensaire": {
        "services": "Soins infirmiers; Consultation generale; Pharmacie",
        "specialites": "Medecine generale",
        "capacites": "Paludisme; Fievre; Plaies; Diarrhees; Infections respiratoires",
        "lits": 6,
        "disponibilite": "Disponibilite limitee",
    },

    # NIVEAU 2 : CENTRES DE SANTE (PAQUET MINIMUM D'ACTIVITES - PMA)
    "Centre de Sante": {
        "services": "Consultation generale; Maternite; Soins infirmiers; Vaccination; Pharmacie; Sante maternelle et infantile",
        "specialites": "Medecine generale; Obstetrique; Pediatrie",
        "capacites": "Paludisme; Fievre; Grossesse; Accouchement; Infections respiratoires; Infections digestives; Troubles digestifs; Maladies infantiles; Plaies",
        "lits": 20,
        "disponibilite": "Disponible",
    },
    "Centre Medical": {
        "services": "Consultation generale; Maternite; Soins infirmiers; Pharmacie; Laboratoire; Echographie",
        "specialites": "Medecine generale; Obstetrique; Pediatrie; Medecine interne",
        "capacites": "Paludisme; Fievre; Grossesse; Accouchement; Infections respiratoires; Infections digestives; Troubles digestifs; Maladies infantiles; Problemes dentaires",
        "lits": 30,
        "disponibilite": "Disponible",
    },

    # NIVEAU 3 : CENTRES DE SANTE DE REFERENCE & POLYCLINIQUES
    "Centre de Sante de Reference": {
        "services": "Consultation generale; Maternite; Urgences; Laboratoire; Echographie; Hospitalisation; Pharmacie; Soins infirmiers; Chirurgie mineure",
        "specialites": "Medecine generale; Obstetrique; Gynecologie; Pediatrie; Chirurgie generale; Medecine interne",
        "capacites": "Accouchement; Grossesse; Complications obstetricales; Paludisme; Fievre; Infections respiratoires; Infections digestives; Troubles digestifs; Interventions chirurgicales; Traumatismes; Plaies; Problemes ORL; Problemes dentaires",
        "lits": 60,
        "disponibilite": "Tres disponible",
    },
    "Centre Hopitalier": {
        "services": "Consultation generale; Maternite; Urgences; Laboratoire; Echographie; Hospitalisation; Chirurgie; Pharmacie; Soins infirmiers",
        "specialites": "Medecine generale; Gynecologie; Obstetrique; Pediatrie; Chirurgie generale; Medecine interne; Anesthesie-reanimation",
        "capacites": "Accouchement; Grossesse; Complications obstetricales; Paludisme; Fievre; Infections respiratoires; Infections digestives; Troubles digestifs; Interventions chirurgicales; Traumatismes; Fractures; Problemes ORL; Problemes dentaires",
        "lits": 80,
        "disponibilite": "Tres disponible",
    },
    "Polyclinque": {
        "services": "Consultation generale; Urgences; Laboratoire; Echographie; Radiologie; Pharmacie; Soins dentaires; ORL",
        "specialites": "Medecine generale; Pediatrie; Gynecologie; Cardiologie; Ophtalmologie; Dentisterie; Medecine interne",
        "capacites": "Paludisme; Fievre; Maladies cardiovasculaires; Problemes ORL; Problemes dentaires; Problemes ophtalmologiques; Maladies dermatologiques; Troubles digestifs; Traumatismes",
        "lits": 50,
        "disponibilite": "Tres disponible",
    },

    # NIVEAU 4 : HOPITAUX GENERAUX DE REFERENCE & CLINIQUES (PCA)
    "Hopital General de Reference": {
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Morgue; Soins neonatals",
        "specialites": "Chirurgie generale; Traumatologie; Orthopedie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation; Ophtalmologie; Infectiologie; Cardiologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Cholera; Maladies cardiovasculaires; Maladies infectieuses; Maladies neurologiques; Brulures; Urgences medicales; Problemes ORL; Problemes ophtalmologiques; Infections respiratoires; Infections digestives",
        "lits": 250,
        "disponibilite": "Tres disponible",
    },
    "Hopital": {
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Morgue",
        "specialites": "Chirurgie generale; Traumatologie; Orthopedie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation; Infectiologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Cholera; Maladies cardiovasculaires; Maladies infectieuses; Brulures; Urgences medicales; Infections respiratoires",
        "lits": 200,
        "disponibilite": "Tres disponible",
    },
    "Clinique": {
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie",
        "specialites": "Chirurgie generale; Traumatologie; Orthopedie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation; Cardiologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Maladies cardiovasculaires; Maladies neurologiques; Urgences medicales",
        "lits": 120,
        "disponibilite": "Tres disponible",
    },
    "Bureau Central de la Zone de Sante": {
        "services": "Consultation generale; Vaccination; Pharmacie",
        "specialites": "Medecine generale",
        "capacites": "Paludisme; Fievre; Maladies infectieuses",
        "lits": 0,
        "disponibilite": "Disponibilite limitee",
    },
}

# Profil de repli par defaut pour les valeurs inconnues ou NaN
PROFIL_DEFAUT = {
    "services": "Consultation generale; Soins infirmiers; Pharmacie",
    "specialites": "Medecine generale",
    "capacites": "Paludisme; Fievre; Infections respiratoires; Troubles digestifs",
    "lits": 15,
    "disponibilite": "Disponible",
}

# ==============================================================================
# 2. DICTIONNAIRE DES GRANDS HOPITAUX DE REFERENCE (DONNEES REELLES)
# ==============================================================================
OVERRIDES_GRANDS_HOPITAUX = [
    # --------------------------------------------------------------------------
    # NORD-KIVU (GOMA, BENI, BUTEMBO)
    # --------------------------------------------------------------------------
    {
        "patterns": [r"\bheal\s*africa\b"],
        "nom_standard": "Hopital Heal Africa (Goma)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Soins neonatals; Sante maternelle et infantile",
        "specialites": "Orthopedie; Traumatologie; Chirurgie generale; Chirurgie reparatrice; Gynecologie; Obstetrique; Pediatrie; Anesthesie-reanimation; Medecine interne",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Brulures; Urgences medicales; Plaies; Maladies infantiles",
        "lits": 250,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bvirunga\b"],
        "nom_standard": "Hopital General de Reference Virunga (Goma / Karisimbi)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Morgue",
        "specialites": "Chirurgie generale; Traumatologie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation; Infectiologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Cholera; Urgences medicales; Infections digestives; Infections respiratoires",
        "lits": 220,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"charite\s*maternelle"],
        "nom_standard": "Hopital General de Reference Charite Maternelle (Goma)",
        "services": "Urgences; Maternite; Chirurgie; Hospitalisation; Laboratoire; Echographie; Pharmacie; Sante maternelle et infantile; Soins neonatals",
        "specialites": "Gynecologie; Obstetrique; Pediatrie; Neonatologie; Chirurgie generale; Medecine interne",
        "capacites": "Accouchement; Grossesse; Complications obstetricales; Maladies infantiles; Malnutrition; Interventions chirurgicales; Infections respiratoires; Urgences medicales; Paludisme",
        "lits": 180,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bbethesda\b"],
        "nom_standard": "Centre Hospitalier Bethesda CBCA (Goma / Ndosho)",
        "services": "Urgences; Chirurgie; Hospitalisation; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie",
        "specialites": "Chirurgie generale; Traumatologie; Orthopedie; Anesthesie-reanimation; Medecine interne; Pediatrie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Brulures; Plaies; Urgences medicales; Infections respiratoires",
        "lits": 250,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bkyeshero\b"],
        "nom_standard": "Centre Hospitalier Kyeshero (Goma)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Echographie; Pharmacie",
        "specialites": "Medecine interne; Chirurgie generale; Gynecologie; Obstetrique; Pediatrie",
        "capacites": "Accouchement; Grossesse; Interventions chirurgicales; Paludisme; Fievre; Urgences medicales; Infections digestives",
        "lits": 120,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bcimak\b"],
        "nom_standard": "Clinique CIMAK (Goma)",
        "services": "Consultation generale; Urgences; Laboratoire; Radiologie; Scanner; Echographie; Chirurgie; Hospitalisation; Pharmacie",
        "specialites": "Radiologie; Medecine interne; Chirurgie generale; Cardiologie; Pediatrie; Gynecologie",
        "capacites": "Imagerie medicale; Maladies cardiovasculaires; Traumatismes; Fractures; Interventions chirurgicales; Urgences medicales; Fievre",
        "lits": 100,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"militaire\s*regional.*katindo", r"militaire\s*regional.*goma", r"hopital\s*militaire\s*regional$"],
        "nom_standard": "Hopital Militaire Regional de Katindo (Goma)",
        "services": "Urgences; Chirurgie; Hospitalisation; Laboratoire; Radiologie; Soins intensifs; Pharmacie",
        "specialites": "Chirurgie generale; Traumatologie; Orthopedie; Medecine interne; Anesthesie-reanimation",
        "capacites": "Traumatismes; Fractures; Interventions chirurgicales; Plaies; Brulures; Urgences medicales; Blessures par balle",
        "lits": 200,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bhgr\s*beni\b", r"hopital.*beni\b"],
        "nom_standard": "Hopital General de Reference de Beni (Nord-Kivu)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Morgue",
        "specialites": "Chirurgie generale; Traumatologie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Infectiologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Cholera; Maladies infectieuses; Urgences medicales",
        "lits": 250,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bmatanda\b"],
        "nom_standard": "Centre Hospitalier Matanda (Butembo)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Echographie; Radiologie; Pharmacie",
        "specialites": "Chirurgie generale; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Traumatologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Urgences medicales",
        "lits": 200,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bhgr.*katwa\b", r"\bcsr.*katwa\b", r"\bkatwa\b"],
        "nom_standard": "Hopital de Reference de Katwa (Butembo)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Pharmacie",
        "specialites": "Chirurgie generale; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Infectiologie",
        "capacites": "Accouchement; Grossesse; Complications obstetricales; Interventions chirurgicales; Paludisme; Maladies infectieuses; Urgences medicales",
        "lits": 180,
        "disponibilite": "Tres disponible",
    },

    # --------------------------------------------------------------------------
    # SUD-KIVU (BUKAVU, CIRIRI, PANZI, UVIRA)
    # --------------------------------------------------------------------------
    {
        "patterns": [r"\bpanzi\b"],
        "nom_standard": "Hopital General de Reference de Panzi (Bukavu)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Soins neonatals; Sante maternelle et infantile; Urgences psychiatriques; Soins infirmiers",
        "specialites": "Gynecologie; Obstetrique; Chirurgie generale; Chirurgie reparatrice; Traumatologie; Orthopedie; Pediatrie; Neonatologie; Medecine interne; Anesthesie-reanimation; Psychiatrie; Psychologie clinique; Infectiologie; Radiologie; Urologie",
        "capacites": "Complications obstetricales; Accouchement; Grossesse; Violences basees sur le genre; Interventions chirurgicales; Traumatismes; Traumatismes psychologiques; Fractures; Sante mentale; Troubles psychiatriques; Malnutrition; Maladies infantiles; Maladies infectieuses; Paludisme; Fievre; Urgences medicales; Plaies; Brulures; Drepanocytose; Infections respiratoires; Infections digestives; Troubles digestifs; Tuberculose",
        "lits": 450,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"hopital\s*provincial.*bukavu", r"ch\s*provincial", r"\bhpgrb\b", r"\bhopital\s*provincial\b"],
        "nom_standard": "Hopital Provincial General de Reference de Bukavu (HPGRB)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Scanner; Echographie; Soins intensifs; Pharmacie; Morgue; Soins neonatals; ORL; Soins ophtalmologiques; Sante maternelle et infantile",
        "specialites": "Medecine interne; Chirurgie generale; Chirurgie reparatrice; Chirurgie pediatrique; Cardiologie; Nephrologie; Traumatologie; Orthopedie; Gynecologie; Obstetrique; Pediatrie; Neonatologie; Anesthesie-reanimation; Ophtalmologie; Neurologie; Neurochirurgie; Infectiologie; Urologie; Oncologie; Radiologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Maladies cardiovasculaires; Maladies neurologiques; Cholera; Urgences medicales; Problemes ORL; Problemes ophtalmologiques; Maladies infectieuses; Paludisme; Fievre; Infections respiratoires; Infections digestives; Troubles digestifs; Brulures; Plaies; Imagerie medicale; Maladies infantiles; Maladies dermatologiques; Malnutrition; Tuberculose; Problemes dentaires",
        "lits": 450,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bdr\s*rau\b", r"\bciriri\b"],
        "nom_standard": "Hopital General de Reference Dr Rau de Ciriri (Bukavu)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Pharmacie; Soins ophtalmologiques; Sante maternelle et infantile; Soins infirmiers",
        "specialites": "Ophtalmologie; Chirurgie generale; Traumatologie; Orthopedie; Medecine interne; Gynecologie; Obstetrique; Pediatrie; Anesthesie-reanimation; Medecine generale",
        "capacites": "Problemes ophtalmologiques; Interventions chirurgicales; Accouchement; Grossesse; Complications obstetricales; Fractures; Traumatismes; Paludisme; Fievre; Urgences medicales; Maladies infantiles; Infections respiratoires; Infections digestives; Troubles digestifs; Plaies; Brulures; Malnutrition",
        "lits": 250,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bsosame\b"],
        "nom_standard": "Centre Medical SOSAME - Neuropsychiatrie (Bukavu)",
        "services": "Consultation generale; Hospitalisation; Laboratoire; Pharmacie; Urgences psychiatriques; Soins infirmiers",
        "specialites": "Psychiatrie; Neurologie; Medecine generale; Psychologie clinique",
        "capacites": "Maladies neurologiques; Troubles psychiatriques; Sante mentale; Addictions; Traumatismes psychologiques; Urgences medicales",
        "lits": 150,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bhgr\s*bagira\b", r"\bbagira\b.*hopital", r"hopital.*bagira\b"],
        "nom_standard": "Hopital General de Reference de Bagira (Bukavu)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Pharmacie; Morgue; Soins neonatals; Sante maternelle et infantile",
        "specialites": "Chirurgie generale; Traumatologie; Orthopedie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation; Infectiologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Fievre; Cholera; Urgences medicales; Infections respiratoires; Infections digestives; Troubles digestifs; Maladies infantiles; Plaies; Brulures; Malnutrition; Tuberculose",
        "lits": 200,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bhgr\s*kadutu\b", r"hopital.*kadutu\b"],
        "nom_standard": "Hopital General de Reference de Kadutu (Bukavu)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Morgue; Soins neonatals; Sante maternelle et infantile",
        "specialites": "Chirurgie generale; Traumatologie; Orthopedie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation; Infectiologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Fievre; Cholera; Urgences medicales; Infections respiratoires; Infections digestives; Troubles digestifs; Maladies infantiles; Plaies; Brulures; Malnutrition; Tuberculose",
        "lits": 220,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"saint\s*vincent.*kadutu", r"ch\s*saint\s*vincent", r"\bsaint\s*vincent\b"],
        "nom_standard": "Centre Hospitalier Saint Vincent (Bukavu / Kadutu)",
        "services": "Consultation generale; Urgences; Maternite; Chirurgie; Hospitalisation; Laboratoire; Echographie; Radiologie; Pharmacie; Sante maternelle et infantile",
        "specialites": "Medecine interne; Chirurgie generale; Traumatologie; Orthopedie; Gynecologie; Obstetrique; Pediatrie; Neonatologie",
        "capacites": "Accouchement; Grossesse; Complications obstetricales; Interventions chirurgicales; Traumatismes; Fractures; Paludisme; Fievre; Maladies infantiles; Infections respiratoires; Infections digestives; Troubles digestifs; Urgences medicales; Plaies; Malnutrition",
        "lits": 120,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"militaire\s*regional.*bukavu", r"\bch\s*fardc\b"],
        "nom_standard": "Hopital Militaire Regional de Bukavu (Sud-Kivu)",
        "services": "Urgences; Chirurgie; Hospitalisation; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Soins infirmiers",
        "specialites": "Chirurgie generale; Traumatologie; Orthopedie; Medecine interne; Anesthesie-reanimation; Medecine generale",
        "capacites": "Traumatismes; Fractures; Interventions chirurgicales; Blessures par balle; Brulures; Plaies; Urgences medicales; Paludisme; Fievre; Infections digestives; Infections respiratoires",
        "lits": 200,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"universitaire\s*uob\b", r"clin.*universitaire\s*uob\b"],
        "nom_standard": "Cliniques Universitaires UOB (Bukavu)",
        "services": "Consultation generale; Urgences; Laboratoire; Chirurgie; Hospitalisation; Pharmacie; Radiologie; Echographie",
        "specialites": "Medecine interne; Chirurgie generale; Traumatologie; Orthopedie; Cardiologie; Nephrologie; Pediatrie; Gynecologie; Infectiologie; Neurologie",
        "capacites": "Maladies infectieuses; Maladies cardiovasculaires; Maladies neurologiques; Traumatismes; Fractures; Interventions chirurgicales; Accouchement; Grossesse; Urgences medicales; Paludisme; Fievre; Infections respiratoires; Infections digestives; Troubles digestifs",
        "lits": 150,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bmwanzi\b"],
        "nom_standard": "Hopital Mwanzi Bukavu (Kadutu)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Echographie; Radiologie; Pharmacie",
        "specialites": "Chirurgie generale; Traumatologie; Orthopedie; Medecine interne; Gynecologie; Obstetrique; Pediatrie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Accouchement; Grossesse; Complications obstetricales; Paludisme; Fievre; Urgences medicales; Infections respiratoires; Infections digestives; Troubles digestifs",
        "lits": 150,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"clin.*ophtamologique", r"clin.*ophtalmologique"],
        "nom_standard": "Clinique Ophtalmologique de Bukavu (Ibanda)",
        "services": "Consultation generale; Urgences; Chirurgie mineure; Soins ophtalmologiques; Pharmacie; Hospitalisation",
        "specialites": "Ophtalmologie; Medecine generale",
        "capacites": "Problemes ophtalmologiques; Traumatismes; Urgences medicales; Plaies",
        "lits": 40,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"ami\s*des\s*enfants"],
        "nom_standard": "Clinique Pediatrique Ami des Enfants (Bukavu / Nyawera)",
        "services": "Consultation generale; Urgences; Hospitalisation; Laboratoire; Pharmacie; Soins neonatals; Sante maternelle et infantile",
        "specialites": "Pediatrie; Neonatologie; Medecine generale",
        "capacites": "Maladies infantiles; Malnutrition; Paludisme; Fievre; Infections respiratoires; Infections digestives; Troubles digestifs; Drepanocytose; Urgences medicales",
        "lits": 80,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bbiopharm\b"],
        "nom_standard": "Centre Hospitalier Biopharm (Bukavu / Nyawera)",
        "services": "Consultation generale; Urgences; Hospitalisation; Laboratoire; Echographie; Pharmacie",
        "specialites": "Medecine interne; Pediatrie; Gynecologie; Medecine generale",
        "capacites": "Paludisme; Fievre; Grossesse; Accouchement; Infections respiratoires; Troubles digestifs; Urgences medicales",
        "lits": 60,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bburhiba\b"],
        "nom_standard": "Centre Hospitalier Burhiba (Bukavu / Bagira)",
        "services": "Consultation generale; Maternite; Urgences; Laboratoire; Echographie; Hospitalisation; Pharmacie; Sante maternelle et infantile",
        "specialites": "Medecine generale; Gynecologie; Obstetrique; Pediatrie; Medecine interne",
        "capacites": "Accouchement; Grossesse; Complications obstetricales; Paludisme; Fievre; Maladies infantiles; Infections respiratoires; Infections digestives; Troubles digestifs; Urgences medicales",
        "lits": 80,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"st\s*luc\s*1\b", r"saint\s*luc\s*1\b"],
        "nom_standard": "Clinique Saint Luc 1 (Bukavu / Saio)",
        "services": "Consultation generale; Urgences; Chirurgie mineure; Maternite; Hospitalisation; Laboratoire; Pharmacie",
        "specialites": "Medecine generale; Gynecologie; Obstetrique; Pediatrie; Traumatologie",
        "capacites": "Paludisme; Fievre; Grossesse; Accouchement; Fractures; Traumatismes; Plaies; Infections respiratoires; Urgences medicales",
        "lits": 60,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"clin.*ebenezer\b"],
        "nom_standard": "Clinique Ebenezer (Bukavu / Nyawera)",
        "services": "Consultation generale; Urgences; Chirurgie mineure; Maternite; Hospitalisation; Laboratoire; Pharmacie",
        "specialites": "Medecine generale; Gynecologie; Obstetrique; Pediatrie; Traumatologie",
        "capacites": "Paludisme; Fievre; Grossesse; Accouchement; Fractures; Traumatismes; Plaies; Infections respiratoires; Urgences medicales",
        "lits": 60,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bhgr\s*uvira\b", r"hopital.*uvira\b"],
        "nom_standard": "Hopital General de Reference d'Uvira (Sud-Kivu)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Morgue",
        "specialites": "Chirurgie generale; Traumatologie; Orthopedie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Infectiologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Cholera; Urgences medicales; Infections respiratoires; Infections digestives; Troubles digestifs",
        "lits": 250,
        "disponibilite": "Tres disponible",
    },

    # --------------------------------------------------------------------------
    # KINSHASA (CAPITALE)
    # --------------------------------------------------------------------------
    {
        "patterns": [r"cinquantenaire"],
        "nom_standard": "Hopital du Cinquantenaire",
        "services": "Urgences; Chirurgie; Hospitalisation; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Morgue; Soins neonatals; ORL",
        "specialites": "Cardiologie; Chirurgie generale; Traumatologie; Neurochirurgie; Neurologie; Oncologie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation; Ophtalmologie; Urologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Maladies cardiovasculaires; Maladies neurologiques; Urgences medicales; Brulures; Accouchement; Grossesse; Cholera; Problemes ORL; Problemes ophtalmologiques; Infections digestives; Infections respiratoires",
        "lits": 500,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"mama\s*yemo", r"hgr\s*kinshasa", r"hopital\s*general\s*de\s*kinshasa"],
        "nom_standard": "Hopital General de Reference de Kinshasa (ex-Mama Yemo)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Morgue; Soins neonatals; ORL",
        "specialites": "Chirurgie generale; Traumatologie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation; Infectiologie; Cardiologie; Neurologie; Ophtalmologie; Urologie; Nephrologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Cholera; Maladies cardiovasculaires; Maladies infectieuses; Maladies neurologiques; Brulures; Urgences medicales; Problemes ORL; Problemes ophtalmologiques",
        "lits": 1000,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"monkole"],
        "nom_standard": "Centre Hospitalier Monkole",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Sante maternelle et infantile; Soins neonatals",
        "specialites": "Gynecologie; Obstetrique; Pediatrie; Chirurgie generale; Medecine interne; Anesthesie-reanimation; Neonatologie; Infectiologie; Traumatologie",
        "capacites": "Accouchement; Grossesse; Complications obstetricales; Maladies infantiles; Drepanocytose; Paludisme; Fievre; Interventions chirurgicales; Traumatismes; Fractures; Infections respiratoires; Infections digestives; Urgences medicales",
        "lits": 150,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"ngaliema"],
        "nom_standard": "Clinique Ngaliema",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Soins neonatals",
        "specialites": "Medecine interne; Chirurgie generale; Gynecologie; Obstetrique; Pediatrie; Cardiologie; Anesthesie-reanimation; Traumatologie; Urologie",
        "capacites": "Accouchement; Grossesse; Complications obstetricales; Interventions chirurgicales; Traumatismes; Fractures; Maladies cardiovasculaires; Maladies infectieuses; Urgences medicales; Paludisme; Fievre",
        "lits": 250,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"\bhj\b", r"hj\s*hospital"],
        "nom_standard": "HJ Hospitals",
        "services": "Urgences; Chirurgie; Hospitalisation; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Soins dentaires; ORL",
        "specialites": "Cardiologie; Ophtalmologie; Chirurgie generale; Medecine interne; Anesthesie-reanimation; Traumatologie; Urologie; Neurologie; Dentisterie",
        "capacites": "Maladies cardiovasculaires; Maladies neurologiques; Problemes ophtalmologiques; Problemes dentaires; Problemes ORL; Traumatismes; Fractures; Interventions chirurgicales; Urgences medicales; Brulures",
        "lits": 200,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"cliniques?\s*universitaires?\s*de\s*kinshasa", r"\bcuk\b"],
        "nom_standard": "Cliniques Universitaires de Kinshasa (CUK)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Morgue; Soins neonatals; ORL",
        "specialites": "Chirurgie generale; Traumatologie; Neurochirurgie; Neurologie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation; Ophtalmologie; Cardiologie; Infectiologie; Nephrologie; Psychiatrie; Dermatologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Cholera; Maladies cardiovasculaires; Maladies neurologiques; Maladies infectieuses; Maladies dermatologiques; Brulures; Urgences medicales; Problemes ORL; Problemes ophtalmologiques",
        "lits": 600,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"kalembe\s*lembe"],
        "nom_standard": "Centre Hospitalier Pediatrique de Kalembe Lembe",
        "services": "Urgences; Hospitalisation; Chirurgie; Laboratoire; Echographie; Radiologie; Pharmacie; Vaccination; Sante maternelle et infantile; Soins neonatals",
        "specialites": "Pediatrie; Chirurgie pediatrique; Neonatologie; Infectiologie; Medecine generale",
        "capacites": "Maladies infantiles; Infections respiratoires; Infections digestives; Paludisme; Fievre; Malnutrition; Interventions chirurgicales; Urgences medicales; Plaies",
        "lits": 180,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"biamba\s*marie\s*mutombo", r"\bchbmm\b"],
        "nom_standard": "Hopital Biamba Marie Mutombo",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie",
        "specialites": "Chirurgie generale; Traumatologie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation; Cardiologie; Nephrologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Maladies cardiovasculaires; Urgences medicales; Paludisme; Fievre",
        "lits": 300,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"saint\s*joseph.*limete", r"hopital\s*saint\s*joseph"],
        "nom_standard": "Hopital Saint Joseph de Limete",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Morgue",
        "specialites": "Chirurgie generale; Traumatologie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation; Infectiologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Fievre; Urgences medicales; Infections digestives; Infections respiratoires",
        "lits": 350,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"amitie\s*sino[- ]congolaise", r"\bhasc\b"],
        "nom_standard": "Hopital de l'Amitie Sino-Congolaise (N'djili)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie",
        "specialites": "Chirurgie generale; Traumatologie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation; Ophtalmologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Fievre; Urgences medicales; Problemes ophtalmologiques",
        "lits": 250,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"roi\s*baudouin"],
        "nom_standard": "Hopital Roi Baudouin 1er (Masina)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Pharmacie; Morgue",
        "specialites": "Chirurgie generale; Traumatologie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Infectiologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Fievre; Tuberculose; Urgences medicales",
        "lits": 200,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"hgr\s*kintambo", r"hopital.*kintambo"],
        "nom_standard": "Hopital General de Reference de Kintambo",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Morgue",
        "specialites": "Chirurgie generale; Traumatologie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Fievre; Urgences medicales; Brulures",
        "lits": 250,
        "disponibilite": "Tres disponible",
    },

    # --------------------------------------------------------------------------
    # HAUT-KATANGA (LUBUMBASHI)
    # --------------------------------------------------------------------------
    {
        "patterns": [r"jason\s*sendwe", r"\bsendwe\b"],
        "nom_standard": "Hopital General de Reference Jason Sendwe (Lubumbashi)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie; Morgue",
        "specialites": "Chirurgie generale; Traumatologie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Anesthesie-reanimation; Cardiologie; Nephrologie; Infectiologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Cholera; Maladies cardiovasculaires; Brulures; Urgences medicales",
        "lits": 800,
        "disponibilite": "Tres disponible",
    },
    {
        "patterns": [r"lubumbashi\s*universitaires", r"universitaire.*lubumbashi"],
        "nom_standard": "Cliniques Universitaires de Lubumbashi (UNILU)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Soins intensifs; Pharmacie",
        "specialites": "Chirurgie generale; Traumatologie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Cardiologie; Neurologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Maladies cardiovasculaires; Urgences medicales",
        "lits": 350,
        "disponibilite": "Tres disponible",
    },

    # --------------------------------------------------------------------------
    # TSHOPO (KISANGANI)
    # --------------------------------------------------------------------------
    {
        "patterns": [r"universitaires?\s*kisangani"],
        "nom_standard": "Cliniques Universitaires de Kisangani (UNIKIS)",
        "services": "Urgences; Chirurgie; Hospitalisation; Maternite; Laboratoire; Radiologie; Echographie; Pharmacie",
        "specialites": "Chirurgie generale; Traumatologie; Gynecologie; Obstetrique; Pediatrie; Medecine interne; Infectiologie",
        "capacites": "Fractures; Traumatismes; Interventions chirurgicales; Complications obstetricales; Accouchement; Grossesse; Paludisme; Urgences medicales",
        "lits": 300,
        "disponibilite": "Tres disponible",
    },
]


def assigner_profil(row):
    """Determine le profil medical coherent pour une structure donnee."""
    nom_norm = normaliser_chaine(row.get("essnom1", ""))
    esstype = str(row.get("esstype", "")).strip()

    # 1. Verifier si c'est un grand hopital repute (override)
    for override in OVERRIDES_GRANDS_HOPITAUX:
        for pattern in override["patterns"]:
            if re.search(pattern, nom_norm):
                return {
                    "services": override["services"],
                    "specialites": override["specialites"],
                    "capacite_prise_en_charge": override["capacites"],
                    "capacite_lits": override["lits"],
                    "disponibilite": override["disponibilite"],
                }

    # 2. Sinon, profil standard selon le niveau dans la pyramide sanitaire
    # Normalisation du type pour gerer d'eventuels problemes d'accents
    esstype_norm = normaliser_chaine(esstype)
    profil = None
    for type_cle, prof in PROFILES_PAR_TYPE.items():
        if normaliser_chaine(type_cle) == esstype_norm:
            profil = prof
            break

    if profil is None:
        profil = PROFIL_DEFAUT

    return {
        "services": profil["services"],
        "specialites": profil["specialites"],
        "capacite_prise_en_charge": profil["capacites"],
        "capacite_lits": profil["lits"],
        "disponibilite": profil["disponibilite"],
    }


def enrichir_dataset(chemin_source, chemin_destination):
    """Enrichit le dataset avec des donnees medicales realistes et coherentes."""
    print(f"Chargement du dataset source : {chemin_source}")
    try:
        df = pd.read_csv(chemin_source, dtype=str, keep_default_na=False, encoding="utf-8")
    except UnicodeDecodeError:
        df = pd.read_csv(chemin_source, dtype=str, keep_default_na=False, encoding="latin-1")
    print(f"Nombre total de structures a traiter : {len(df)}")

    # Nettoyage prealable des colonnes
    df.columns = [c.strip() for c in df.columns]
    if "disponibilites" in df.columns:
        df = df.rename(columns={"disponibilites": "disponibilite"})

    services_liste = []
    specialites_liste = []
    capacites_liste = []
    lits_liste = []
    dispo_liste = []

    for _, row in df.iterrows():
        p = assigner_profil(row)
        services_liste.append(p["services"])
        specialites_liste.append(p["specialites"])
        capacites_liste.append(p["capacite_prise_en_charge"])
        lits_liste.append(p["capacite_lits"])
        dispo_liste.append(p["disponibilite"])

    df["services"] = services_liste
    df["specialites"] = specialites_liste
    df["capacite_prise_en_charge"] = capacites_liste
    df["capacite_lits"] = lits_liste
    df["disponibilite"] = dispo_liste

    # Sauvegarde
    chemin_destination = Path(chemin_destination)
    chemin_destination.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(chemin_destination, index=False, encoding="utf-8")
    print(f"[OK] Dataset enrichi sauvegarde avec succes dans : {chemin_destination}")


if __name__ == "__main__":
    SRC_ORIGINAL = Path("donnees/dataset_original/GRID3_COD_health_facilities_v9_0_-2924174275266254925.csv")
    DEST = Path("donnees/dataset_prepare/dataset_prepare.csv")
    SRC = SRC_ORIGINAL if SRC_ORIGINAL.exists() else DEST
    enrichir_dataset(SRC, DEST)
