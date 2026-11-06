"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChatMessage, OrientationResult, ConversationSession } from "@/core/types/consultation";
import { City } from "@/core/types/hospital";
import { UserProfile } from "@/core/types/auth";
import { DEFAULT_CITIES } from "@/core/constants/cities";
import { medicalService } from "@/infrastructure/api/medicalService";
import { voiceService } from "@/infrastructure/api/voiceService";

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-msg",
  role: "assistant",
  content:
    "Bonjour, je suis **MediGuide IA**, votre assistant d'orientation médicale pour la République Démocratique du Congo.\n\nDécrivez la situation clinique du patient (nature des symptômes, durée, intensité, antécédents) ou enregistrez une note vocale en langues nationales (Lingala, Swahili, Kikongo, Tshiluba). Je déterminerai l'urgence et vous dirigerai vers l'établissement adapté le plus proche.",
  timestamp: new Date(),
};

function createEmptySession(cityName: string): ConversationSession {
  const id = `session-${Date.now()}`;
  return {
    id,
    title: "Nouvelle consultation",
    cityName,
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [DEFAULT_WELCOME_MESSAGE],
  };
}

export function useConsultation(user?: UserProfile | null) {
  const [cities, setCities] = useState<City[]>(DEFAULT_CITIES);
  
  // Position initiale neutre avant détection GPS
  const [currentCity, setCurrentCity] = useState<City>(() => ({
    ville: "Position actuelle (GPS)",
    province: "RDC",
    lat: -4.322447,
    lon: 15.307045,
    description: "Position de l'appareil",
  }));
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number }>({
    lat: -4.322447,
    lon: 15.307045,
  });
  const [spatialFiltering, setSpatialFiltering] = useState(true);

  // Demande de permission et géolocalisation automatique de l'appareil au démarrage
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setUserCoords({ lat, lon });
          setCurrentCity({
            ville: "Ma position (GPS)",
            province: "Détectée",
            lat,
            lon,
            description: "Coordonnées de l'appareil",
          });
        },
        (err) => {
          // Si l'utilisateur refuse ou en cas d'indisponibilité, repli neutre sur Kinshasa
          console.warn("Géolocalisation automatique refusée ou indisponible :", err.message);
          setUserCoords({ lat: -4.322447, lon: 15.307045 });
          setCurrentCity({
            ville: "Kinshasa",
            province: "Kinshasa",
            lat: -4.322447,
            lon: 15.307045,
            description: "Capitale nationale",
          });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  }, []);

  // Clé de stockage : UNIQUEMENT pour les utilisateurs authentifiés avec compte
  const storageKey = user?.email ? `mediguide_sessions_${user.email}` : null;

  // Sessions multi-conversations
  const [sessions, setSessions] = useState<ConversationSession[]>(() => {
    if (typeof window !== "undefined" && storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {}
    }
    return [createEmptySession(currentCity.ville)];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || "default";
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Synchronisation des sessions au changement d'utilisateur (connexion / déconnexion)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSessions(parsed);
            setActiveSessionId(parsed[0].id);
            return;
          }
        }
      } catch {}
      const fresh = [createEmptySession(currentCity.ville)];
      setSessions(fresh);
      setActiveSessionId(fresh[0].id);
    } else {
      // Utilisateur non connecté : supprimer toute trace de sessions d'invité
      try {
        localStorage.removeItem("mediguide_sessions");
      } catch {}
      const guest = [createEmptySession(currentCity.ville)];
      setSessions(guest);
      setActiveSessionId(guest[0].id);
    }
  }, [storageKey, user?.email]);

  // Sauvegarde des sessions : UNIQUEMENT pour les comptes connectés
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(sessions));
      } catch {}
    }
  }, [sessions, storageKey]);

  // Nettoyage au déchargement pour les utilisateurs invités non connectés
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!user) {
        try {
          localStorage.removeItem("mediguide_sessions");
        } catch {}
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user]);

  // Session active
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0] || createEmptySession(currentCity.ville);
  }, [sessions, activeSessionId, currentCity.ville]);

  const messages = activeSession.messages;

  // Charger les villes au démarrage
  useEffect(() => {
    let isMounted = true;
    medicalService
      .getVilles()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setCities(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const setLocation = useCallback((lat: number, lon: number, cityName: string) => {
    setUserCoords({ lat, lon });
    setCurrentCity((prev) => ({
      ...prev,
      ville: cityName,
      lat,
      lon,
    }));
  }, []);

  // Créer une nouvelle session
  const createNewSession = useCallback(() => {
    const newSession = createEmptySession(currentCity.ville);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setError(null);
  }, [currentCity.ville]);

  // Changer de session
  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setError(null);
  }, []);

  // Supprimer une session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh = createEmptySession(currentCity.ville);
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeSessionId, currentCity.ville]);

  // Envoyer un message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };

      // Mettre à jour la session avec le message utilisateur et le titre si 1er message
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === activeSessionId) {
            const isFirst = session.messages.length <= 1;
            const newTitle = isFirst
              ? content.length > 32
                ? content.substring(0, 32).trim() + "..."
                : content.trim()
              : session.title;

            return {
              ...session,
              title: newTitle,
              updatedAt: new Date(),
              messages: [...session.messages, userMsg],
            };
          }
          return session;
        })
      );

      setIsLoading(true);
      setError(null);

      try {
        const result: OrientationResult = await medicalService.orienter({
          message: content,
          latitude: userCoords.lat,
          longitude: userCoords.lon,
          nombre_recommandations: 3,
          filtrage_spatial: spatialFiltering,
        });

        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            result.synthese_clinique ||
            result.justification ||
            result.explication_textuelle ||
            "Orientation médicale calculée avec succès.",
          orientation: result,
          timestamp: new Date(),
        };

        setSessions((prev) =>
          prev.map((session) => {
            if (session.id === activeSessionId) {
              return {
                ...session,
                updatedAt: new Date(),
                messages: [...session.messages, assistantMsg],
              };
            }
            return session;
          })
        );
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Erreur lors de l'orientation médicale.";
        setError(errMsg);

        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Une anomalie est survenue lors de la communication avec le serveur d'orientation : ${errMsg}\n\nVeuillez vérifier la connexion ou réitérer votre demande.`,
          timestamp: new Date(),
        };

        setSessions((prev) =>
          prev.map((session) => {
            if (session.id === activeSessionId) {
              return {
                ...session,
                updatedAt: new Date(),
                messages: [...session.messages, errorMsg],
              };
            }
            return session;
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, activeSessionId, userCoords, spatialFiltering]
  );

  // Envoyer de l'audio
  const sendAudio = useCallback(
    async (audioBlob: Blob, _mimeType: string) => {
      if (isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-audio-${Date.now()}`,
        role: "user",
        content: "🎤 [Message vocal soumis en langue nationale]",
        timestamp: new Date(),
        isVoice: true,
      };

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              updatedAt: new Date(),
              messages: [...session.messages, userMsg],
            };
          }
          return session;
        })
      );

      setIsLoading(true);
      setError(null);

      try {
        const result: OrientationResult = await voiceService.submitVoice(audioBlob, {
          latitude: userCoords.lat,
          longitude: userCoords.lon,
          nombre_recommandations: 3,
          filtrage_spatial: spatialFiltering,
        });

        let bodyText =
          result.synthese_clinique ||
          result.justification ||
          result.explication_textuelle ||
          "Message audio analysé avec succès.";
        if (result.transcription) {
          bodyText = `**Transcription :** *« ${result.transcription} »*\n\n` + bodyText;
        }

        const assistantMsg: ChatMessage = {
          id: `assistant-audio-${Date.now()}`,
          role: "assistant",
          content: bodyText,
          orientation: result,
          timestamp: new Date(),
        };

        setSessions((prev) =>
          prev.map((session) => {
            if (session.id === activeSessionId) {
              return {
                ...session,
                title: result.transcription ? result.transcription.substring(0, 30) + "..." : "Consultation vocale",
                updatedAt: new Date(),
                messages: [...session.messages, assistantMsg],
              };
            }
            return session;
          })
        );
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Erreur lors du traitement du message vocal.";
        setError(errMsg);

        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Le message vocal n'a pas pu être traité : ${errMsg}`,
          timestamp: new Date(),
        };

        setSessions((prev) =>
          prev.map((session) => {
            if (session.id === activeSessionId) {
              return {
                ...session,
                updatedAt: new Date(),
                messages: [...session.messages, errorMsg],
              };
            }
            return session;
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, activeSessionId, userCoords, spatialFiltering]
  );

  const resetConsultation = useCallback(() => {
    createNewSession();
  }, [createNewSession]);

  return {
    sessions,
    activeSession,
    activeSessionId,
    messages,
    isLoading,
    error,
    cities,
    currentCity,
    userCoords,
    spatialFiltering,
    setSpatialFiltering,
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    isLocationModalOpen,
    setIsLocationModalOpen,
    sendMessage,
    sendAudio,
    setLocation,
    createNewSession,
    selectSession,
    deleteSession,
    resetConsultation,
  };
}
