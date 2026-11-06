export interface Hospital {
  id?: string;
  rang: number;
  identifiant?: string;
  grid3id?: string;
  essnom1?: string;
  structure?: string;
  esstype?: string;
  distance_km: number;
  disponibilite?: string;
  capacite_lits?: number | string;
  cout_orientation: number;
  score_services: number;
  score_specialites: number;
  score_capacite: number;
  score_disponibilite: number;
  score_adequation?: number;
  portee_spatiale?: "ville" | "province" | "interprovincial" | "national" | string;
  libelle_portee?: string;
  province?: string;
  zonesante?: string;
  airesante?: string;
  localite?: string;
  lat: number;
  lon: number;
}

export interface MedicalNeed {
  label: string;
  services: string[];
  specialites: string[];
  capacites: string[];
}

export interface City {
  ville: string;
  province: string;
  lat: number;
  lon: number;
  description: string;
}
