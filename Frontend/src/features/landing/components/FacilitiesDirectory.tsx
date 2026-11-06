"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  Activity, 
  Search 
} from "lucide-react";
import { FacilityDetail } from "./FacilityModal";
import { slideUp } from "@/shared/animations/variants";

export const DEFAULT_FACILITIES: FacilityDetail[] = [
  {
    name: "Centre Hospitalier & Médical Saint-Luc",
    dept: "Urgences & Soins Intensifs 24/7",
    dist: "1.2 km (4 min)",
    wait: "~12 min",
    equip: "Plateau complet : Cardiologie, Médecine Interne, Scanner & Laboratoire d'urgence.",
    match: "98% Match",
    category: "urgence imagerie",
  },
  {
    name: "Clinique Mère & Enfant La Providence",
    dept: "Garde Pédiatrique Active",
    dist: "1.9 km (6 min)",
    wait: "~08 min",
    equip: "Spécialisé : Urgences pédiatriques, néonatologie, ORL infantile et pneumologie.",
    match: "96% Match",
    category: "pediatrie urgence",
  },
  {
    name: "Institut Orthopédique & Imagerie Centrale",
    dept: "Traumatologie & Radio Directe",
    dist: "2.3 km (7 min)",
    wait: "~15 min",
    equip: "Prise en charge rapide : Entorses, fractures, sutures, radiologie numérique et IRM.",
    match: "94% Match",
    category: "imagerie",
  },
  {
    name: "Polyclinique Pasteur Proximité",
    dept: "Consultations & Soins Primaires",
    dist: "2.4 km (8 min)",
    wait: "~18 min",
    equip: "Idéal pour : Migraines, troubles digestifs, infections urinaires, bilans sanguins rapides.",
    match: "92% Match",
    category: "urgence",
  },
];

interface FacilitiesDirectoryProps {
  onSelectFacility: (facility: FacilityDetail) => void;
  cityName: string;
}

export function FacilitiesDirectory({ onSelectFacility, cityName }: FacilitiesDirectoryProps) {
  const [filter, setFilter] = useState<"all" | "urgence" | "pediatrie" | "imagerie">("all");

  const filteredFacilities = DEFAULT_FACILITIES.filter((f) => {
    if (filter === "all") return true;
    return f.category.includes(filter);
  });

  return (
    <section className="py-16 sm:py-24 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-xs font-mono font-medium mb-3">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              Réseau Médical de Proximité • {cityName}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Structures médicales disponibles
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-light">
              Données en temps réel issues du registre national des 38 957 établissements.
            </p>
          </div>

          {/* Filtres de catégorie */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              Toutes les structures
            </button>
            <button
              type="button"
              onClick={() => setFilter("urgence")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                filter === "urgence"
                  ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              Urgences 24/7
            </button>
            <button
              type="button"
              onClick={() => setFilter("pediatrie")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                filter === "pediatrie"
                  ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              Pédiatrie
            </button>
            <button
              type="button"
              onClick={() => setFilter("imagerie")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                filter === "imagerie"
                  ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              Imagerie & Radio
            </button>
          </div>
        </div>

        {/* Grille des Établissements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFacilities.map((facility, index) => (
            <motion.div
              key={index}
              variants={slideUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 shadow-subtle hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 block">
                        {facility.dept}
                      </span>
                      <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                        {facility.name}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {facility.match}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-2 line-clamp-2">
                  {facility.equip}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    {facility.dist}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    {facility.wait}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectFacility(facility)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-950 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Fiche & Pass</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
