import { ENV_CONFIG } from "@/core/config/env";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Client HTTP centralisé avec bascule transparente de proxy et gestion des délais
 */
export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = ENV_CONFIG.DEFAULT_TIMEOUT_MS, params, ...customConfig } = options;

  let url = endpoint.startsWith("http") ? endpoint : `${ENV_CONFIG.API_BASE_URL}${endpoint}`;

  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) query.append(key, String(val));
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response = await fetch(url, {
      ...customConfig,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(customConfig.headers || {}),
      },
    });

    // En cas d'échec sur le rewrite proxy en dev, tentative directe vers le fallback local
    if (!response.ok && !endpoint.startsWith("http") && response.status >= 500) {
      const fallbackUrl = `${ENV_CONFIG.API_FALLBACK_URL}${endpoint}`;
      try {
        response = await fetch(fallbackUrl, {
          ...customConfig,
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            ...(customConfig.headers || {}),
          },
        });
      } catch {
        // En cas d'échec de la seconde tentative, on traite la réponse originelle
      }
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message =
        errorBody.detail ||
        errorBody.message ||
        `Erreur serveur (${response.status}: ${response.statusText})`;
      throw new ApiError(message, response.status, "HTTP_ERROR", errorBody);
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("La requête a expiré. Veuillez vérifier votre connexion.", 408, "TIMEOUT");
    }

    // Tentative directe si réseau non joignable
    if (!endpoint.startsWith("http")) {
      try {
        const fallbackUrl = `${ENV_CONFIG.API_FALLBACK_URL}${endpoint}`;
        const fallbackRes = await fetch(fallbackUrl, {
          ...customConfig,
          headers: {
            Accept: "application/json",
            ...(customConfig.headers || {}),
          },
        });
        if (fallbackRes.ok) {
          return (await fallbackRes.json()) as T;
        }
      } catch {}
    }

    const message = error instanceof Error ? error.message : "Erreur de communication réseau inconnue";
    throw new ApiError(message, 0, "NETWORK_ERROR");
  }
}
