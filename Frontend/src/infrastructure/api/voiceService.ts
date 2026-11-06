import { apiClient } from "./client";
import { OrientationResult } from "@/core/types";

export interface VoiceTriageParams {
  latitude: number;
  longitude: number;
  nombre_recommandations?: number;
  filtrage_spatial?: boolean;
}

export const voiceService = {
  /**
   * Triage vocal direct (Lingala, Swahili, Kikongo, Tshiluba, Français)
   */
  async submitVoice(audioBlob: Blob, params: VoiceTriageParams): Promise<OrientationResult> {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio_enregistrement.webm");
    formData.append("latitude", params.latitude.toString());
    formData.append("longitude", params.longitude.toString());
    formData.append("nombre_recommandations", (params.nombre_recommandations || 3).toString());
    formData.append("filtrage_spatial", params.filtrage_spatial !== false ? "true" : "false");

    return apiClient<OrientationResult>("/voice-triage", {
      method: "POST",
      body: formData,
      timeoutMs: 30000, // Traitement vocal multimodal plus généreux
    });
  },
};
