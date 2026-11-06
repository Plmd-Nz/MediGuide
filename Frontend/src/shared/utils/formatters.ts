export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function getUrgencyBadgeConfig(urgency?: string) {
  switch (urgency?.toLowerCase()) {
    case "rouge":
      return {
        label: "Urgence Vitale Immédiate",
        colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
        dotClass: "bg-rose-500",
      };
    case "jaune":
      return {
        label: "Soins Urgents Recommandés",
        colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        dotClass: "bg-amber-500",
      };
    default:
      return {
        label: "Consultation Prioritaire",
        colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        dotClass: "bg-emerald-500",
      };
  }
}
