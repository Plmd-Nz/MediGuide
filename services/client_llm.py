"""Abstraction optionnelle pour un fournisseur LLM compatible Gemini."""

import json
import os
import urllib.request

from dotenv import load_dotenv


load_dotenv()


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
        self.cle_api = cle_api or os.getenv("GEMINI_API_KEY")
        self.modele = modele or os.getenv("GEMINI_MODEL") or "gemini-flash-latest"
        self.modeles_de_repli = [
            self.modele,
            "gemini-flash-latest",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
        ]
        if not self.cle_api:
            raise ValueError("La variable GEMINI_API_KEY n'est pas configurée.")

    def _demander(self, prompt):
        dernier_erreur = None
        for modele in dict.fromkeys(self.modeles_de_repli):
            self.modele = modele
            url = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{self.modele}:generateContent?key={self.cle_api}"
            )
            donnees = {
                "contents": [{"parts": [{"text": prompt}]}],
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
                with urllib.request.urlopen(requete, timeout=20) as reponse:
                    resultat = json.loads(reponse.read().decode("utf-8"))
                return resultat["candidates"][0]["content"]["parts"][0]["text"]
            except Exception as erreur:
                dernier_erreur = erreur
                message = str(erreur).lower()
                if "not found" not in message and "unsupported" not in message and "not available" not in message:
                    raise
        raise RuntimeError(
            "Aucun modèle Gemini disponible pour cette clé API."
        ) from dernier_erreur

    def interpreter(self, texte, categories_autorisees):
        """Demande au LLM un JSON limité aux catégories autorisées."""
        prompt = (
            "Tu es un extracteur de besoins d'orientation médicale, pas un outil de diagnostic. "
            "Retourne uniquement un JSON de la forme "
            '{"besoins":[{"categorie":"...","capacites":[],"services":[],"specialites":[]}]}.'
            "N'utilise que les catégories, capacités, services et spécialités autorisés. "
            f"Les valeurs autorisées sont : {json.dumps(categories_autorisees, ensure_ascii=False)}. "
            f"Demande utilisateur : {texte}"
        )
        resultat = json.loads(self._demander(prompt))
        if not isinstance(resultat, dict) or not isinstance(resultat.get("besoins"), list):
            raise ValueError("Gemini a retourné une structure JSON inattendue.")
        return resultat

    def reformuler(self, donnees_resultat):
        """Reformule uniquement les résultats fournis par le moteur SIOM."""
        prompt = (
            "Reformule en français simple ces résultats d'orientation. "
            "N'ajoute aucune structure, distance ou information. "
            f"Données SIOM : {json.dumps(donnees_resultat, ensure_ascii=False)}"
        )
        return self._demander(prompt)
