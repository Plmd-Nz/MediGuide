import { apiClient } from "./client";
import { City, OrientationRequestPayload, OrientationResult } from "@/core/types";

export interface HealthCheckResponse {
  statut: string;
  structures_chargees: number;
  modele_actif: string;
  gemini_disponible: boolean;
  langues_vocales: string[];
}

export const medicalService = {
  /**
   * Analyse des symptômes textuels et calcul d'orientation spatiale
   */
  async orienter(payload: OrientationRequestPayload): Promise<OrientationResult> {
    return apiClient<OrientationResult>("/orientation", {
      method: "POST",
      timeoutMs: 60000,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  /**
   * Récupère la liste des villes de référence en RDC
   */
  async getVilles(): Promise<City[]> {
    return apiClient<City[]>("/villes", {
      method: "GET",
    });
  },

  /**
   * Vérifie la disponibilité du moteur FastAPI et de Gemini
   */
  async getHealth(): Promise<HealthCheckResponse> {
    return apiClient<HealthCheckResponse>("/health", {
      method: "GET",
    });
  },
};
