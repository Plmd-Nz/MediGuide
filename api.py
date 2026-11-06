"""
API REST FastAPI pour le Système Intelligent d'Orientation Médicale (SIOM / MediGuide).
Expose les fonctionnalités d'orientation multicritère, de hiérarchie spatiale
et de triage vocal multimodal en langues nationales (Voice-First AI).
"""

from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List, Optional
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from modele.filtrage_spatial import LIBELLES_PORTEE
from modele.orientation import BesoinMedical, obtenir_recommandations
from services.client_llm import ClientGemini
from services.generation_reponse import formater_reponse_orientation
from services.interpretation_besoin import (
    interpreter_demande_gemini,
    interpreter_demande_locale,
    _extraire_valeurs_dataset,
)
from services.localisation import valider_position
from traitement.nettoyage import charger_dataset, nettoyer_dataset

# Chargement de l'environnement
ROOT = Path(__file__).resolve().parent
CHEMIN_ENV = ROOT / ".env"
if CHEMIN_ENV.exists():
    load_dotenv(CHEMIN_ENV, override=True)
else:
    load_dotenv(override=True)

CHEMIN_DATASET = ROOT / "donnees" / "dataset_prepare" / "dataset_prepare.csv"

# État global en mémoire
donnees_global = None
vocabulaire_dataset = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Charge et nettoie le dataset une seule fois au démarrage."""
    global donnees_global, vocabulaire_dataset
    print("[API] Chargement et préparation du dataset SIOM...")
    donnees_global = nettoyer_dataset(charger_dataset(CHEMIN_DATASET))
    vocabulaire_dataset = _extraire_valeurs_dataset(donnees_global)
    print(f"[API] Dataset prêt en mémoire : {len(donnees_global)} structures médicales.")
    yield
    print("[API] Arrêt du serveur.")


app = FastAPI(
    title="MediGuide API - SIOM",
    description="Système d'aide à l'orientation médicale pour la RDC (Voice-First & Multicritère).",
    version="2.0.0",
    lifespan=lifespan,
)

# Configuration CORS pour Next.js (port 3000) et autres origines de développement
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================================================
# MODÈLES DE DONNÉES PYDANTIC
# ==============================================================================
class RequeteOrientation(BaseModel):
    message: str
    latitude: float
    longitude: float
    nombre_recommandations: int = 3
    utiliser_gemini: bool = True
    filtrage_spatial: bool = True


class RequetePosition(BaseModel):
    latitude: float
    longitude: float


# Villes majeures de la RDC pour sélection rapide dans l'UI
VILLES_RDC = [
    {
        "ville": "Lubumbashi",
        "province": "Haut-Katanga",
        "lat": -11.425791,
        "lon": 27.652373,
        "description": "Lubumbashi (Haut-Katanga)"
    },
    {
        "ville": "Goma",
        "province": "Nord-Kivu",
        "lat": -1.296437,
        "lon": 29.097208,
        "description": "Goma (Nord-Kivu)"
    },
    {
        "ville": "Bukavu",
        "province": "Sud-Kivu",
        "lat": -2.590835,
        "lon": 28.57602,
        "description": "Bukavu (Sud-Kivu)"
    },
    {
        "ville": "Kisangani",
        "province": "Tshopo",
        "lat": 0.439954,
        "lon": 25.209503,
        "description": "Kisangani (Tshopo)"
    },
    {
        "ville": "Matadi",
        "province": "Kongo-Central",
        "lat": -5.369423,
        "lon": 13.662018,
        "description": "Matadi (Kongo-Central)"
    },
    {
        "ville": "Kananga",
        "province": "Kasaï-Central",
        "lat": -5.883781,
        "lon": 22.49042,
        "description": "Kananga (Kasaï-Central)"
    },
    {
        "ville": "Mbuji-Mayi",
        "province": "Kasaï-Oriental",
        "lat": -6.162991,
        "lon": 23.569706,
        "description": "Mbuji-Mayi (Kasaï-Oriental)"
    },
    {
        "ville": "Kolwezi",
        "province": "Lualaba",
        "lat": -10.66148,
        "lon": 25.720488,
        "description": "Kolwezi (Lualaba)"
    },
    {
        "ville": "Kikwit",
        "province": "Kwilu",
        "lat": -4.979375,
        "lon": 18.870835,
        "description": "Kikwit (Kwilu)"
    },
    {
        "ville": "Tshikapa",
        "province": "Kasaï",
        "lat": -6.4459,
        "lon": 20.869221,
        "description": "Tshikapa (Kasaï)"
    },
    {
        "ville": "Bunia",
        "province": "Ituri",
        "lat": 1.557124,
        "lon": 29.849629,
        "description": "Bunia (Ituri)"
    },
    {
        "ville": "Butembo",
        "province": "Nord-Kivu",
        "lat": 0.243686,
        "lon": 29.319112,
        "description": "Butembo (Nord-Kivu)"
    },
    {
        "ville": "Kalemie",
        "province": "Tanganyika",
        "lat": -6.421255,
        "lon": 29.338584,
        "description": "Kalemie (Tanganyika)"
    },
    {
        "ville": "Mbandaka",
        "province": "Equateur",
        "lat": 0.051421,
        "lon": 18.702691,
        "description": "Mbandaka (Equateur)"
    },
    {
        "ville": "Uvira",
        "province": "Sud-Kivu",
        "lat": -3.657055,
        "lon": 28.926313,
        "description": "Uvira (Sud-Kivu)"
    },
    {
        "ville": "Kindu",
        "province": "Maniema",
        "lat": -2.860755,
        "lon": 26.122095,
        "description": "Kindu (Maniema)"
    },
    {
        "ville": "Boma",
        "province": "Kongo-Central",
        "lat": -5.332093,
        "lon": 12.895715,
        "description": "Boma (Kongo-Central)"
    },
    {
        "ville": "Isiro",
        "province": "Haut-Uele",
        "lat": 2.937123,
        "lon": 28.258592,
        "description": "Isiro (Haut-Uele)"
    },
    {
        "ville": "Aru",
        "province": "Ituri",
        "lat": 2.608344,
        "lon": 30.788266,
        "description": "Aru (Ituri)"
    },
    {
        "ville": "Bandundu",
        "province": "Kwilu",
        "lat": -3.970011,
        "lon": 18.012882,
        "description": "Bandundu (Kwilu)"
    },
    {
        "ville": "Boende",
        "province": "Tshuapa",
        "lat": -0.120452,
        "lon": 21.437834,
        "description": "Boende (Tshuapa)"
    },
    {
        "ville": "Bokungu",
        "province": "Tshuapa",
        "lat": -0.846308,
        "lon": 22.655197,
        "description": "Bokungu (Tshuapa)"
    },
    {
        "ville": "Bumba",
        "province": "Mongala",
        "lat": 2.38983,
        "lon": 22.477239,
        "description": "Bumba (Mongala)"
    },
    {
        "ville": "Buta",
        "province": "Bas-Uele",
        "lat": 3.403555,
        "lon": 25.210465,
        "description": "Buta (Bas-Uele)"
    },
    {
        "ville": "Gbadolite",
        "province": "Nord-Ubangi",
        "lat": 3.922295,
        "lon": 21.099157,
        "description": "Gbadolite (Nord-Ubangi)"
    },
    {
        "ville": "Gemena",
        "province": "Sud-Ubangi",
        "lat": 3.035456,
        "lon": 19.455025,
        "description": "Gemena (Sud-Ubangi)"
    },
    {
        "ville": "Inongo",
        "province": "Mai-Ndombe",
        "lat": -2.193338,
        "lon": 18.410369,
        "description": "Inongo (Mai-Ndombe)"
    },
    {
        "ville": "Kabalo",
        "province": "Tanganyika",
        "lat": -6.289565,
        "lon": 27.114736,
        "description": "Kabalo (Tanganyika)"
    },
    {
        "ville": "Kabinda",
        "province": "Lomami",
        "lat": -6.125568,
        "lon": 24.736511,
        "description": "Kabinda (Lomami)"
    },
    {
        "ville": "Kabondo Dianda",
        "province": "Haut-Lomami",
        "lat": -8.415372,
        "lon": 26.428777,
        "description": "Kabondo Dianda (Haut-Lomami)"
    },
    {
        "ville": "Kahemba",
        "province": "Kwango",
        "lat": -7.227568,
        "lon": 18.38606,
        "description": "Kahemba (Kwango)"
    },
    {
        "ville": "Kamina",
        "province": "Haut-Lomami",
        "lat": -7.773304,
        "lon": 25.038131,
        "description": "Kamina (Haut-Lomami)"
    },
    {
        "ville": "Kasongo",
        "province": "Maniema",
        "lat": -4.159546,
        "lon": 26.666888,
        "description": "Kasongo (Maniema)"
    },
    {
        "ville": "Kenge",
        "province": "Kwango",
        "lat": -5.794432,
        "lon": 17.260278,
        "description": "Kenge (Kwango)"
    },
    {
        "ville": "Kinshasa-Centre",
        "province": "Kinshasa",
        "lat": -4.375584,
        "lon": 15.325845,
        "description": "Kinshasa-Centre (Kinshasa)"
    },
    {
        "ville": "Kinshasa-Est",
        "province": "Kinshasa",
        "lat": -4.391746,
        "lon": 15.463331,
        "description": "Kinshasa-Est (Kinshasa)"
    },
    {
        "ville": "Kinshasa-Ouest",
        "province": "Kinshasa",
        "lat": -4.378338,
        "lon": 15.270121,
        "description": "Kinshasa-Ouest (Kinshasa)"
    },
    {
        "ville": "Kisenge",
        "province": "Lualaba",
        "lat": -9.437334,
        "lon": 23.030491,
        "description": "Kisenge (Lualaba)"
    },
    {
        "ville": "Likasi",
        "province": "Haut-Katanga",
        "lat": -10.46713,
        "lon": 26.936374,
        "description": "Likasi (Haut-Katanga)"
    },
    {
        "ville": "Lisala",
        "province": "Mongala",
        "lat": 2.054658,
        "lon": 21.058508,
        "description": "Lisala (Mongala)"
    },
    {
        "ville": "Lodja",
        "province": "Sankuru",
        "lat": -3.442761,
        "lon": 23.449784,
        "description": "Lodja (Sankuru)"
    },
    {
        "ville": "Lokutu",
        "province": "Tshopo",
        "lat": 1.193399,
        "lon": 23.71149,
        "description": "Lokutu (Tshopo)"
    },
    {
        "ville": "Lubutu",
        "province": "Maniema",
        "lat": -1.23826,
        "lon": 26.519795,
        "description": "Lubutu (Maniema)"
    },
    {
        "ville": "Luiza",
        "province": "Kasaï-Central",
        "lat": -7.214172,
        "lon": 22.347762,
        "description": "Luiza (Kasaï-Central)"
    },
    {
        "ville": "Mbanza Ngungu",
        "province": "Kongo-Central",
        "lat": -5.30761,
        "lon": 15.043444,
        "description": "Mbanza Ngungu (Kongo-Central)"
    },
    {
        "ville": "Mweka",
        "province": "Kasaï",
        "lat": -4.730439,
        "lon": 21.217657,
        "description": "Mweka (Kasaï)"
    },
    {
        "ville": "Mweneditu",
        "province": "Lomami",
        "lat": -7.184173,
        "lon": 23.533124,
        "description": "Mweneditu (Lomami)"
    },
    {
        "ville": "Nioki",
        "province": "Mai-Ndombe",
        "lat": -2.985766,
        "lon": 17.568112,
        "description": "Nioki (Mai-Ndombe)"
    },
    {
        "ville": "Tshumbe",
        "province": "Sankuru",
        "lat": -4.396888,
        "lon": 24.338963,
        "description": "Tshumbe (Sankuru)"
    },
    {
        "ville": "Watsa",
        "province": "Haut-Uele",
        "lat": 3.079383,
        "lon": 29.804388,
        "description": "Watsa (Haut-Uele)"
    }
]


# ==============================================================================
# ROUTES API
# ==============================================================================
@app.get("/api/health")
def verifier_sante():
    """Retourne l'état du serveur et de la base de données."""
    global donnees_global
    cle_gemini = bool(os.getenv("GEMINI_API_KEY"))
    modele = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    return {
        "statut": "operationnel",
        "structures_chargees": len(donnees_global) if donnees_global is not None else 0,
        "gemini_disponible": cle_gemini,
        "modele_actif": modele,
        "modeles_supportes": ["gemini-3.8-flash", "gemini-3.5-flash"],
        "langues_vocales": ["Lingala", "Swahili", "Kikongo", "Tshiluba", "Français"],
    }


@app.get("/api/villes")
def lister_villes_rdc():
    """Retourne les grandes villes de la RDC avec coordonnées de référence."""
    return VILLES_RDC


@app.post("/api/orientation")
@app.post("/api/orienter")
def traiter_orientation(requete: RequeteOrientation):
    """
    Traite une demande textuelle d'orientation médicale.
    Exécute l'analyse d'intention (Gemini ou local) et le moteur de classement multicritère.
    """
    global donnees_global
    if donnees_global is None:
        raise HTTPException(status_code=503, detail="Le dataset médical n'est pas encore prêt.")

    # 1. Validation de la position
    try:
        latitude, longitude = valider_position(requete.latitude, requete.longitude)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

    # 2. Gestion des salutations polies
    salutations = {
        "bonjour", "bonsoir", "salut", "hello", "hi", "coucou",
        "mbote", "jambo", "habari", "betu", "bapoyo",
        "aide", "aidez-moi", "aide-moi", "qui es-tu", "qui es-tu ?"
    }
    msg_propre = requete.message.strip().lower()
    if msg_propre in salutations:
        return {
            "type_reponse": "salutation",
            "message": (
                "Mbote ! Jambo ! Bonjour ! 👋 Je suis MediGuide, votre assistant intelligent d'orientation médicale pour la RDC.\n\n"
                "Décrivez vos symptômes ou votre situation de santé (en français ou dans votre langue nationale : Lingala, Swahili, etc.) "
                "ou enregistrez un message vocal avec le micro. Je vous orienterai vers la structure la plus proche et la plus adaptée."
            ),
            "recommandations": [],
        }

    # 3. Interprétation du besoin
    besoin = None
    categories = []
    mode_utilise = "local"

    if requete.utiliser_gemini and os.getenv("GEMINI_API_KEY"):
        try:
            besoin, categories = interpreter_demande_gemini(requete.message, donnees_global)
            mode_utilise = "gemini"
        except Exception:
            # Repli automatique sur le moteur local
            try:
                besoin, categories = interpreter_demande_locale(requete.message, donnees_global)
                mode_utilise = "repli_local"
            except ValueError as err_loc:
                raise HTTPException(status_code=422, detail=str(err_loc))
    else:
        try:
            besoin, categories = interpreter_demande_locale(requete.message, donnees_global)
            mode_utilise = "local"
        except ValueError as err_loc:
            raise HTTPException(status_code=422, detail=str(err_loc))

    # 4. Calcul des recommandations avec escalade spatiale
    recommandations = obtenir_recommandations(
        donnees_global,
        latitude,
        longitude,
        besoin,
        nombre_recommandations=requete.nombre_recommandations,
        filtrage_spatial=requete.filtrage_spatial,
    )

    portee = recommandations[0].get("portee_spatiale", "ville") if recommandations else "aucune"
    libelle_portee = recommandations[0].get("libelle_portee", "Ville / Proximité locale") if recommandations else ""

    explication = formater_reponse_orientation(besoin, recommandations)

    return {
        "type_reponse": "orientation",
        "mode_utilise": mode_utilise,
        "categories_identifiees": list(categories),
        "besoin_interprete": {
            "label": besoin.besoin_medical,
            "services": list(besoin.services_recherches),
            "specialites": list(besoin.specialites_recherchees),
            "capacites": list(besoin.capacites_recherchees),
        },
        "portee_spatiale": portee,
        "libelle_portee": libelle_portee,
        "recommandations": recommandations,
        "explication_textuelle": explication,
    }


@app.post("/api/voice-triage")
async def traiter_vocal(
    audio: UploadFile = File(...),
    latitude: float = Form(-2.50),
    longitude: float = Form(28.86),
    nombre_recommandations: int = Form(3),
    filtrage_spatial: bool = Form(True),
):
    """
    Point d'entrée multimodal Audio-to-Intent (Concept 3 : Voice-First African AI).
    Prend un enregistrement audio (Lingala, Swahili, Kikongo, Tshiluba, Français),
    l'analyse avec Gemini 3.8 Flash, extrait les besoins et exécute l'orientation.
    Retourne la transcription, la langue détectée, le niveau d'urgence,
    les recommandations et une guidance vocale formulée dans la langue locale.
    """
    global donnees_global, vocabulaire_dataset
    if donnees_global is None:
        raise HTTPException(status_code=503, detail="Le dataset médical n'est pas encore prêt.")

    # 1. Validation de la position
    try:
        latitude, longitude = valider_position(latitude, longitude)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

    # 2. Lecture du fichier audio
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Fichier audio vide.")

    mime_type = audio.content_type or "audio/webm"

    # 3. Traitement multimodal avec Gemini 3.8 Flash
    cle_api = os.getenv("GEMINI_API_KEY")
    if not cle_api:
        raise HTTPException(
            status_code=503,
            detail="La clé GEMINI_API_KEY est requise pour le traitement audio multimodal.",
        )

    client = ClientGemini()
    vocabulaire_autorise = {
        "capacites": sorted(vocabulaire_dataset["capacites"], key=str.casefold),
        "services": sorted(vocabulaire_dataset["services"], key=str.casefold),
        "specialites": sorted(vocabulaire_dataset["specialites"], key=str.casefold),
    }

    try:
        analyse_audio = client.interpreter_audio(audio_bytes, mime_type, vocabulaire_autorise)
    except Exception as err:
        raise HTTPException(status_code=502, detail=f"Erreur d'analyse audio Gemini : {err}")

    # 4. Conversion en BesoinMedical
    capacites_brutes = []
    services_brutes = []
    specialites_brutes = []
    categories = []

    for item in analyse_audio.get("besoins", []):
        if isinstance(item, dict):
            capacites_brutes.extend(item.get("capacites", []))
            services_brutes.extend(item.get("services", []))
            specialites_brutes.extend(item.get("specialites", []))
            if item.get("categorie"):
                categories.append(item["categorie"])

    # Normalisation
    from modele.besoins import _normaliser_texte, ALIASES_DATASET
    index_cap = {_normaliser_texte(v): v for v in vocabulaire_dataset["capacites"]}
    index_serv = {_normaliser_texte(v): v for v in vocabulaire_dataset["services"]}
    index_spec = {_normaliser_texte(v): v for v in vocabulaire_dataset["specialites"]}

    capacites = []
    services = []
    specialites = []

    for val in capacites_brutes + services_brutes + specialites_brutes:
        norm = _normaliser_texte(val)
        if not norm:
            continue
        if norm in index_cap and index_cap[norm] not in capacites:
            capacites.append(index_cap[norm])
        if norm in index_serv and index_serv[norm] not in services:
            services.append(index_serv[norm])
        if norm in index_spec and index_spec[norm] not in specialites:
            specialites.append(index_spec[norm])
        if norm in ALIASES_DATASET:
            cible = _normaliser_texte(ALIASES_DATASET[norm])
            if cible in index_cap and index_cap[cible] not in capacites:
                capacites.append(index_cap[cible])
            if cible in index_serv and index_serv[cible] not in services:
                services.append(index_serv[cible])
            if cible in index_spec and index_spec[cible] not in specialites:
                specialites.append(index_spec[cible])

    if not capacites and not services and not specialites:
        capacites = ["Paludisme", "Fièvre"]
        services = ["Consultation générale"]

    besoin = BesoinMedical(
        " et ".join(dict.fromkeys(categories)) or analyse_audio.get("resume_medical", "Demande vocale"),
        services_recherches=tuple(dict.fromkeys(services)),
        specialites_recherchees=tuple(dict.fromkeys(specialites)),
        capacites_recherchees=tuple(dict.fromkeys(capacites)),
    )

    # 5. Calcul des recommandations
    recommandations = obtenir_recommandations(
        donnees_global,
        latitude,
        longitude,
        besoin,
        nombre_recommandations=nombre_recommandations,
        filtrage_spatial=filtrage_spatial,
    )

    portee = recommandations[0].get("portee_spatiale", "ville") if recommandations else "aucune"
    libelle_portee = recommandations[0].get("libelle_portee", "") if recommandations else ""

    return {
        "type_reponse": "voice_triage",
        "langue_detectee": analyse_audio.get("langue", "Français"),
        "transcription": analyse_audio.get("transcription", ""),
        "resume_medical": analyse_audio.get("resume_medical", ""),
        "urgence": analyse_audio.get("urgence", "jaune"),
        "guidance_vocale": analyse_audio.get("guidance_vocale", ""),
        "besoin_interprete": {
            "label": besoin.besoin_medical,
            "services": list(besoin.services_recherches),
            "specialites": list(besoin.specialites_recherchees),
            "capacites": list(besoin.capacites_recherchees),
        },
        "portee_spatiale": portee,
        "libelle_portee": libelle_portee,
        "recommandations": recommandations,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
