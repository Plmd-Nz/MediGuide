import { Hospital, MedicalNeed } from "./hospital";

export interface OrientationResult {
  type_reponse: "orientation" | "salutation" | "voice_triage" | string;
  mode_utilise?: string;
  message?: string;
  categories_identifiees?: string[];
  besoin_interprete?: MedicalNeed;
  portee_spatiale?: string;
  libelle_portee?: string;
  recommandations: Hospital[];
  explication_textuelle?: string;
  synthese_clinique?: string;
  justification?: string;
  // Champs Voice-First Triage
  langue_detectee?: string;
  transcription?: string;
  resume_medical?: string;
  resume_audio?: string;
  audio_url?: string;
  urgence?: "rouge" | "jaune" | "vert" | string;
  guidance_vocale?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string | Date;
  audioUrl?: string;
  orientation?: OrientationResult;
  isVoice?: boolean;
}

export interface OrientationRequestPayload {
  message: string;
  latitude: number;
  longitude: number;
  nombre_recommandations?: number;
  filtrage_spatial?: boolean;
}

export interface ConversationSession {
  id: string;
  title: string;
  cityName: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  messages: ChatMessage[];
}
