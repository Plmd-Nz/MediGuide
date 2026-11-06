import DOMPurify from "dompurify";

/**
 * Assainit le code HTML généré pour prévenir les injections XSS
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (typeof window === "undefined") {
    // Rendu côté serveur initial : échappement minimal des scripts
    return dirtyHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  }
  return DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  });
}
