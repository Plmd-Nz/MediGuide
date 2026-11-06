"""Abstraction optionnelle pour un fournisseur LLM compatible Gemini."""

import json
import os
import urllib.request
from pathlib import Path

from dotenv import load_dotenv

CHEMIN_ENV = Path(__file__).resolve().parents[1] / ".env"
if CHEMIN_ENV.exists():
    load_dotenv(CHEMIN_ENV, override=True)
else:
    load_dotenv(override=True)


class ClientLLM:
    """Contrat minimal d'un client d'interprétation ou de reformulation."""

    def interpreter(self, texte, categories_autorisees):
        """Interprète une demande structurée."""
        raise NotImplementedError

    def reformuler(self, donnees_resultat):
        """Reformule des résultats déjà calculés par SIOM."""
        raise NotImplementedError


class ClientGemini(ClientLLM):
    """Client Gemini facultatif, activé uniquement avec une clé API."""

    def __init__(self, cle_api=None, modele=None):
        if CHEMIN_ENV.exists():
            load_dotenv(CHEMIN_ENV, override=True)
        self.cle_api = (cle_api or os.getenv("GEMINI_API_KEY") or "").strip()
        self.modele = (modele or os.getenv("GEMINI_MODEL") or "gemini-3.8-flash").strip()
        self.modeles_de_repli = [
            self.modele,
            "gemini-3.5-flash-lite",
            "gemini-3.8-flash",
            "gemini-3.5-flash",
            "gemini-flash-lite-latest",
            "gemini-3-flash-preview",
        ]
        if not self.cle_api:
            raise ValueError("La variable GEMINI_API_KEY n'est pas configurée.")
        # Évite les blocages de détection automatique de proxy WPAD sous Windows
        self._opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

    def _demander(self, prompt, inline_data=None):
        dernier_erreur = None
        for modele in dict.fromkeys(self.modeles_de_repli):
            self.modele = modele
            url = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{self.modele}:generateContent?key={self.cle_api}"
            )
            parts = []
            if inline_data:
                parts.append({"inlineData": inline_data})
            parts.append({"text": prompt})

            donnees = {
                "contents": [{"parts": parts}],
                "generationConfig": {
                    "temperature": 0,
                    "responseMimeType": "application/json",
                },
            }
            requete = urllib.request.Request(
                url,
                data=json.dumps(donnees).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            try:
                with self._opener.open(requete, timeout=10) as reponse:
                    resultat = json.loads(reponse.read().decode("utf-8"))
                candidates = resultat.get("candidates", [])
                if not candidates:
                    continue
                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts or "text" not in parts[0]:
                    continue
                return parts[0]["text"]
            except Exception as erreur:
                dernier_erreur = erreur
                message = str(erreur).lower()
                # En cas d'erreur de modèle indisponible (404, 503, 429, etc.), on tente le modèle suivant
                if any(motif in message for motif in ("not found", "unsupported", "not available", "503", "429", "unavailable", "timeout", "timed out", "quota", "resource")):
                    continue
                continue
        raise RuntimeError(
            "Aucun modèle Gemini disponible pour cette clé API."
        ) from dernier_erreur

    def interpreter(self, texte, categories_autorisees):
        """Demande au LLM un JSON limité aux catégories autorisées."""
        prompt = (
            "Tu es un extracteur de besoins d'orientation médicale pour la RDC, pas un outil de diagnostic. "
            "Retourne uniquement un JSON de la forme "
            '{"besoins":[{"categorie":"...","capacites":[],"services":[],"specialites":[]}]}.\n'
            "RÈGLES IMPORTANTES :\n"
            "1. N'utilise que les catégories, capacités, services et spécialités autorisés dans la liste fournie.\n"
            f"2. Liste des valeurs autorisées : {json.dumps(categories_autorisees, ensure_ascii=False)}.\n"
            "3. Si la demande exprime un besoin général de consultation, de soins ou une salutation orientée santé, "
            'utilise au minimum : {"categorie":"Consultation générale","capacites":[],"services":["Consultation générale"],"specialites":["Médecine générale"]}.\n'
            f"Demande utilisateur : {texte}"
        )
        resultat = json.loads(self._demander(prompt))
        if not isinstance(resultat, dict) or not isinstance(resultat.get("besoins"), list):
            raise ValueError("Gemini a retourné une structure JSON inattendue.")
        return resultat

    def interpreter_audio(self, audio_bytes, mime_type, categories_autorisees):
        """Comprend directement un enregistrement vocal en langue nationale ou français (Audio-to-Intent)."""
        import base64
        b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
        inline_data = {
            "mimeType": mime_type or "audio/webm",
            "data": b64_audio,
        }
        prompt = (
            "Tu es l'assistant médical d'orientation multimodale SIOM pour la République Démocratique du Congo. "
            "Écoute cet enregistrement audio où un patient ou un soignant décrit une situation de santé "
            "(qui peut être exprimée en Lingala, Swahili, Kikongo, Tshiluba ou Français).\n\n"
            "INSTRUCTIONS STRICTES :\n"
            "1. Détecte la langue parlée (ex: 'Lingala', 'Swahili', 'Kikongo', 'Tshiluba' ou 'Français').\n"
            "2. Transcris fidèlement les paroles dans le champ 'transcription'.\n"
            "3. Résume le problème médical en français dans le champ 'resume_medical'.\n"
            "4. Évalue le niveau d'urgence estimé dans le champ 'urgence' : 'rouge' (urgence vitale immédiate), "
            "'jaune' (urgence médicale avérée), ou 'vert' (soins ambulatoires standard).\n"
            "5. Extrais les besoins d'orientation médicale autorisés dans le champ 'besoins' "
            'sous la forme : [{"categorie": "...", "capacites": [], "services": [], "specialites": []}].\n'
            f"Valeurs autorisées : {json.dumps(categories_autorisees, ensure_ascii=False)}.\n"
            "Si aucun terme spécifique n'est détecté, utilise au minimum la consultation générale.\n"
            "6. Dans le champ 'guidance_vocale', rédige un message d'orientation rassurant, concis et clair "
            "DANS LA LANGUE LOCALE DÉTECTÉE (Lingala, Swahili, etc.) pour guider la personne vers les secours ou la structure la plus proche.\n\n"
            "Retourne uniquement un JSON valide avec ces 6 clés exactes : "
            '{"langue": "...", "transcription": "...", "resume_medical": "...", "urgence": "rouge|jaune|vert", "besoins": [...], "guidance_vocale": "..."}'
        )
        brut = self._demander(prompt, inline_data=inline_data)
        resultat = json.loads(brut)
        if not isinstance(resultat, dict) or "besoins" not in resultat:
            raise ValueError("Structure JSON inattendue reçue pour l'audio.")
        return resultat

    def reformuler(self, donnees_resultat):
        """Reformule uniquement les résultats fournis par le moteur SIOM."""
        prompt = (
            "Reformule en français simple ces résultats d'orientation. "
            "N'ajoute aucune structure, distance ou information. "
            f"Données SIOM : {json.dumps(donnees_resultat, ensure_ascii=False)}"
        )
        return self._demander(prompt)
