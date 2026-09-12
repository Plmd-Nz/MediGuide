"""Interface conversationnelle professionnelle de SIOM."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st

from modele.orientation import obtenir_recommandations
from services.generation_reponse import formater_reponse_orientation
from services.interpretation_besoin import interpreter_demande_gemini, interpreter_demande_locale
from services.client_llm import ClientGemini
from services.localisation import obtenir_position_manuelle, valider_position
from traitement.nettoyage import charger_dataset, nettoyer_dataset

CHEMIN_DATASET_PREPARE = Path("donnees/dataset_prepare/dataset_prepare.csv")


def _appliquer_css():
    """Applique le thème visuel de l'interface."""
    st.markdown(
        """
        <style>
        :root {
            --bg: #0f172a;
            --panel: #111827;
            --panel-soft: #1f2937;
            --line: rgba(148,163,184,0.22);
            --text: #e5e7eb;
            --muted: #94a3b8;
            --primary: #38bdf8;
            --primary-soft: rgba(56,189,248,0.12);
            --success: #34d399;
            --warning: #fbbf24;
            --danger: #f87171;
        }
        html, body, [data-testid="stAppViewContainer"] {
            background: linear-gradient(180deg, #020817 0%, #111827 100%);
            color: var(--text);
        }
        .block-container {
            padding-top: 2rem;
            padding-bottom: 3rem;
            max-width: 1100px;
        }
        .siom-header {
            padding: 1.2rem 1.5rem;
            border: 1px solid var(--line);
            border-radius: 18px;
            background: rgba(15, 23, 42, 0.85);
            margin-bottom: 1.25rem;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.28);
        }
        .siom-title {
            font-size: 2.5rem !important;
            font-weight: 800 !important;
            letter-spacing: -0.05em;
            margin: 0;
        }
        .siom-subtitle {
            color: var(--muted);
            margin-top: 0.35rem;
            font-size: 1rem;
        }
        .siom-card {
            background: rgba(17, 24, 39, 0.9);
            border: 1px solid var(--line);
            border-radius: 16px;
            padding: 1rem 1.2rem;
            margin-bottom: 1rem;
        }
        .stChatMessage {
            border-radius: 16px !important;
            border: 1px solid var(--line) !important;
            background: rgba(17,24,39,0.8) !important;
        }
        .stChatMessage[data-testid="chat-message-user"] {
            background: rgba(14, 116, 144, 0.18) !important;
            border-color: rgba(56,189,248,0.4) !important;
        }
        .stChatMessage[data-testid="chat-message-assistant"] {
            background: rgba(15, 23, 42, 0.9) !important;
        }
        .stTextInput > div > div > input,
        .stNumberInput > div > div > input {
            background: rgba(15, 23, 42, 0.9);
            color: var(--text);
            border: 1px solid var(--line);
            border-radius: 12px;
        }
        .stButton > button {
            background: linear-gradient(135deg, #0ea5e9, #2563eb);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 700;
        }
        .stButton > button:hover {
            filter: brightness(1.08);
        }
        [data-testid="stSidebar"] {
            background: rgba(2, 6, 23, 0.9);
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def charger_donnees():
    """Charge le dataset une seule fois par session Streamlit."""
    if "donnees_siom" not in st.session_state:
        donnees = charger_dataset(CHEMIN_DATASET_PREPARE)
        st.session_state.donnees_siom = nettoyer_dataset(donnees)
    return st.session_state.donnees_siom


def initialiser_session():
    """Initialise l'historique de conversation et la position."""
    st.session_state.setdefault("messages", [])
    st.session_state.setdefault("position", None)
    st.session_state.setdefault("utiliser_gemini", False)


def est_gemini_configure():
    """Vérifie si la clé Gemini est présente."""
    try:
        ClientGemini()
        return True
    except ValueError:
        return False


def afficher_geolocalisation():
    """Affiche le bouton optionnel de géolocalisation du navigateur."""
    try:
        from streamlit_geolocation import streamlit_geolocation
    except ImportError:
        st.caption("Le composant de géolocalisation n'est pas installé. Utilisez la saisie manuelle.")
        return

    position = streamlit_geolocation()
    if position and position.get("latitude") is not None:
        try:
            st.session_state.position = valider_position(
                position["latitude"], position["longitude"]
            )
            st.success("Position du navigateur récupérée.")
        except ValueError as erreur:
            st.error(str(erreur))


def afficher_position():
    """Affiche la position actuelle et le formulaire de secours manuel."""
    with st.container():
        st.subheader("Position du patient")
        with st.form("formulaire_position", clear_on_submit=False):
            col1, col2 = st.columns(2)
            with col1:
                latitude = st.number_input("Latitude", value=-4.338311667, format="%.7f")
            with col2:
                longitude = st.number_input("Longitude", value=15.27582667, format="%.7f")
            position_validee = st.form_submit_button("Utiliser cette position", use_container_width=True)
        afficher_geolocalisation()

    if position_validee:
        try:
            st.session_state.position = obtenir_position_manuelle(latitude, longitude)
            st.success("Position manuelle enregistrée.")
        except ValueError as erreur:
            st.error(str(erreur))

    if st.session_state.position:
        latitude, longitude = st.session_state.position
        st.caption(f"Position utilisée : {latitude:.7f}, {longitude:.7f}")


def traiter_message(message, donnees, utiliser_gemini=False):
    """Interprète une demande locale et calcule ses recommandations."""
    if not st.session_state.position:
        return "Veuillez d'abord fournir votre position manuellement ou via le navigateur."

    try:
        if utiliser_gemini:
            besoin, categories = interpreter_demande_gemini(message, donnees)
        else:
            besoin, categories = interpreter_demande_locale(message, donnees)
    except Exception as erreur:
        if utiliser_gemini:
            st.warning("Gemini n'est pas disponible. Le moteur local SIOM est utilisé à la place.")
            try:
                besoin, categories = interpreter_demande_locale(message, donnees)
            except ValueError as erreur_locale:
                return str(erreur_locale)
        else:
            return str(erreur)

    latitude, longitude = st.session_state.position
    recommandations = obtenir_recommandations(
        donnees,
        latitude,
        longitude,
        besoin,
        nombre_recommandations=3,
    )
    reponse = formater_reponse_orientation(besoin, recommandations)
    return f"Besoins identifiés : {', '.join(categories)}.\n\n{reponse}"


def main():
    """Lance l'interface conversationnelle SIOM."""
    st.set_page_config(page_title="SIOM", page_icon="🏥", layout="wide")
    _appliquer_css()
    initialiser_session()
    donnees = charger_donnees()

    st.markdown(
        """
        <div class="siom-header">
            <div class="siom-title">SIOM</div>
            <div class="siom-subtitle">Aide à l'orientation médicale, sans diagnostic médical</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    sidebar = st.sidebar
    sidebar.header("Paramètres")
    if est_gemini_configure():
        st.session_state.utiliser_gemini = sidebar.toggle(
            "Utiliser Gemini pour structurer la demande",
            value=False,
            help="Gemini interprète la phrase; le moteur SIOM calcule toujours le classement.",
        )
        sidebar.caption("Mode intelligent actif : Gemini + moteur SIOM")
    else:
        st.session_state.utiliser_gemini = False
        sidebar.caption("Gemini non configuré. Le moteur local SIOM reste actif.")

    sidebar.markdown("---")
    sidebar.subheader("Méthodes de localisation")
    sidebar.caption("1. géolocalisation navigateur\n2. saisie manuelle")

    col_gauche, col_droite = st.columns([1.65, 1])
    with col_gauche:
        st.subheader("Conversation")
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["contenu"])

        message = st.chat_input("Décrivez votre besoin d'orientation...")
        if message:
            st.session_state.messages.append({"role": "user", "contenu": message})
            reponse = traiter_message(
                message,
                donnees,
                st.session_state.utiliser_gemini,
            )
            st.session_state.messages.append({"role": "assistant", "contenu": reponse})
            st.rerun()

    with col_droite:
        afficher_position()


if __name__ == "__main__":
    main()
