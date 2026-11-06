import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function getUrgencyColor(urgency: string) {
  switch (urgency?.toLowerCase()) {
    case "rouge":
      return "text-red-400 bg-red-950/60 border-red-500/40";
    case "jaune":
      return "text-amber-400 bg-amber-950/60 border-amber-500/40";
    default:
      return "text-emerald-400 bg-emerald-950/60 border-emerald-500/40";
  }
}

export function getScopeBadge(scope: string) {
  switch (scope?.toLowerCase()) {
    case "ville":
      return {
        label: "Ville / Local",
        class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        description: "Orientation immédiate au niveau de la ville",
      };
    case "province":
      return {
        label: "Province",
        class: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        description: "Élargi à toute la province",
      };
    case "interprovincial":
      return {
        label: "Interprovincial (~3 prov.)",
        class: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        description: "Rayon élargi aux provinces limitrophes",
      };
    default:
      return {
        label: "National (RDC)",
        class: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        description: "Recherche étendue à l'échelle nationale",
      };
  }
}
