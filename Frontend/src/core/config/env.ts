/**
 * Configuration centrale des URLs et constantes de l'environnement MediGuide
 */
export const ENV_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
  API_FALLBACK_URL: "http://127.0.0.1:8000/api",
  DEFAULT_TIMEOUT_MS: 60000,
  APP_NAME: "MediGuide",
  APP_VERSION: "3.2",
  DEFAULT_RADIUS_KM: 25,
  TOTAL_FACILITIES_RDC: 38957,
} as const;
