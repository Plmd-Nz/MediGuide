"use client";

import React, { useState, useRef } from "react";
import { 
  ArrowUpRight, 
  Navigation, 
  RotateCcw, 
  ExternalLink,
  ArrowRight
} from "lucide-react";

export interface ScenarioDetail {
  input: string;
  urgency: string;
  specialty: string;
  hospital: string;
  note: string;
  match: number;
  distance: string;
  wait: string;
  lat?: number;
  lon?: number;
}

export const SCENARIOS: Record<string, ScenarioDetail> = {
  thorax: {
    input: "Douleur thoracique oppressante et essoufflement au repos",
    urgency: "Priorité Niveau 1 • Urgence",
    specialty: "Cardiologie & Soins Intensifs 24/7",
    hospital: "Centre Hospitalier Saint-Luc",
    note: "Plateau vérifié : ECG 12 dérivations, dosage troponine rapide et cardiologue de garde présents sur place.",
    match: 99,
    distance: "1.2 km",
    wait: "~04 min",
    lat: -4.325,
    lon: 15.312,
  },
  pediatrie: {
    input: "Enfant 3 ans : fièvre à 39°C et toux sifflante nocturne",
    urgency: "Priorité Pédiatrique",
    specialty: "Urgences Pédiatriques & Respiratoires",
    hospital: "Clinique Mère & Enfant La Providence",
    note: "Pédiatre de garde disponible immédiatement, box de nébulisation et accueil infantile sans attente.",
    match: 98,
    distance: "1.8 km",
    wait: "~07 min",
    lat: -4.332,
    lon: 15.298,
  },
  migraine: {
    input: "Migraine aiguë avec éclairs visuels et photophobie",
    urgency: "Consultation Ciblée",
    specialty: "Neurologie & Urgences Céphalées",
    hospital: "Polyclinique Pasteur Proximité",
    note: "Unité calme équipée pour le diagnostic neuro-ophtalmique et l'imagerie cérébrale rapide.",
    match: 96,
    distance: "2.3 km",
    wait: "~12 min",
    lat: -4.341,
    lon: 15.305,
  },
  trauma: {
    input: "Chute sur la cheville avec gonflement et appui impossible",
    urgency: "Filière Traumatologie",
    specialty: "Orthopédie & Radiologie Numérique",
    hospital: "Institut Orthopédique Central",
    note: "Radiographie numérique directe sans rendez-vous et pose d'orthèse par un traumatologue.",
    match: 99,
    distance: "2.0 km",
    wait: "~10 min",
    lat: -4.318,
    lon: 15.321,
  },
};

interface SymptomConsoleProps {
  onLaunchConsultation: (initialPrompt?: string) => void;
  cityName: string;
}

export function SymptomConsole({ onLaunchConsultation, cityName }: SymptomConsoleProps) {
  const [symptomInput, setSymptomInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScenarioDetail | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const runTriage = (data: ScenarioDetail) => {
    setIsScanning(true);
    setResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setResult(data);
    }, 750);
  };

  const handleScenarioClick = (key: string) => {
    const data = SCENARIOS[key];
    if (!data) return;
    setSymptomInput(data.input);
    runTriage(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = symptomInput.trim();
    if (!val) {
      inputRef.current?.focus();
      return;
    }

    const lower = val.toLowerCase();
    let chosen: ScenarioDetail;
    if (lower.includes("enfant") || lower.includes("fièvre") || lower.includes("toux")) {
      chosen = SCENARIOS.pediatrie;
    } else if (lower.includes("migraine") || lower.includes("tête") || lower.includes("oeil") || lower.includes("vision")) {
      chosen = SCENARIOS.migraine;
    } else if (lower.includes("cheville") || lower.includes("chute") || lower.includes("fracture") || lower.includes("bras")) {
      chosen = SCENARIOS.trauma;
    } else {
      chosen = {
        input: val,
        urgency: "Consultation Recommandée",
        specialty: "Médecine Interne & Diagnostic Rapide",
        hospital: `Centre Hospitalier de ${cityName}`,
        note: `Pour « ${val} », ce centre dispose d'un médecin d'urgence et d'un plateau technique adapté.`,
        match: 97,
        distance: "1.4 km",
        wait: "~09 min",
      };
    }

    runTriage(chosen);
  };

  const resetConsole = () => {
    setResult(null);
    setIsScanning(false);
    setSymptomInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="w-full text-left">
      <div
        className={`bg-white dark:bg-zinc-900 rounded-[28px] p-3 sm:p-4 transition-all duration-500 border border-zinc-200/70 dark:border-zinc-800 ${
          result ? "shadow-console-active" : "shadow-console"
        }`}
      >
        {/* Barre de Saisie Principale */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 bg-alabaster dark:bg-zinc-950 rounded-2xl px-4 py-3 border border-zinc-200/60 dark:border-zinc-800 focus-within:border-emerald-500/60 dark:focus-within:border-emerald-500/60 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-obsidian dark:bg-white text-white dark:text-obsidian flex items-center justify-center shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-600 ai-orb" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            placeholder="Décrivez ce que vous ressentez (ex : douleur thoracique, forte fièvre...)"
            className="w-full bg-transparent text-sm sm:text-base text-obsidian dark:text-white placeholder-zinc-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-obsidian hover:bg-emerald-600 text-white dark:bg-white dark:text-obsidian dark:hover:bg-emerald-400 dark:hover:text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <span>Analyser</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          </button>
        </form>

        {/* 4 Pilules de Symptômes Épurées */}
        <div className="mt-3 px-1 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScenarioClick("thorax")}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100/80 dark:bg-zinc-800 hover:bg-obsidian hover:text-white dark:hover:bg-white dark:hover:text-obsidian transition-all cursor-pointer"
            >
              Douleur thoracique
            </button>
            <button
              type="button"
              onClick={() => handleScenarioClick("pediatrie")}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100/80 dark:bg-zinc-800 hover:bg-obsidian hover:text-white dark:hover:bg-white dark:hover:text-obsidian transition-all cursor-pointer"
            >
              Fièvre pédiatrique
            </button>
            <button
              type="button"
              onClick={() => handleScenarioClick("migraine")}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100/80 dark:bg-zinc-800 hover:bg-obsidian hover:text-white dark:hover:bg-white dark:hover:text-obsidian transition-all cursor-pointer"
            >
              Migraine &amp; troubles visuels
            </button>
            <button
              type="button"
              onClick={() => handleScenarioClick("trauma")}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100/80 dark:bg-zinc-800 hover:bg-obsidian hover:text-white dark:hover:bg-white dark:hover:text-obsidian transition-all cursor-pointer"
            >
              Traumatisme cheville
            </button>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 shrink-0 pr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> GPS actif ({cityName})
          </span>
        </div>

        {/* ÉTAT 1 : SCAN NEURONAL SVG TEMPS RÉEL */}
        {isScanning && (
          <div className="pt-6 pb-4 px-4 border-t border-zinc-100 dark:border-zinc-800 mt-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-3">
              <span className="flex items-center gap-2 text-obsidian dark:text-zinc-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Analyse clinique &amp; vérification des plateaux techniques proches...
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">0.4s</span>
            </div>
            {/* Onde Biométrique SVG */}
            <div className="h-12 w-full bg-alabaster dark:bg-zinc-950 rounded-xl overflow-hidden flex items-center px-4 border border-zinc-100 dark:border-zinc-800">
              <svg className="w-full h-8 stroke-emerald-500" viewBox="0 0 600 40" fill="none">
                <path
                  d="M0 20 H120 L135 6 L150 34 L168 4 L185 36 L200 14 L215 20 H380 L395 8 L410 32 L425 5 L442 35 L458 20 H600"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="route-path-animated"
                />
              </svg>
            </div>
          </div>
        )}

        {/* ÉTAT 2 : RÉSULTAT UNIQUE D'ORIENTATION + CARTE VECTORIELLE */}
        {!isScanning && result && (
          <div className="pt-5 px-2 sm:px-3 pb-2 border-t border-zinc-100 dark:border-zinc-800 mt-4 animate-in fade-in duration-400">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-alabaster dark:bg-zinc-950/80 rounded-2xl p-4 sm:p-6 border border-zinc-200/70 dark:border-zinc-800">
              {/* Détails Cliniques & Hôpital Recommandé (7 col) */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    {result.urgency}
                  </span>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {result.specialty}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Structure recommandée à proximité
                  </p>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-obsidian dark:text-white mt-0.5">
                    {result.hospital}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                    {result.note}
                  </p>
                </div>

                {/* Métriques */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-200/70 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block">Adéquation</span>
                    <span className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
                      {result.match}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block">Distance</span>
                    <span className="font-mono font-bold text-lg text-obsidian dark:text-white">
                      {result.distance}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block">Attente</span>
                    <span className="font-mono font-bold text-lg text-obsidian dark:text-white">
                      {result.wait}
                    </span>
                  </div>
                </div>

                {/* Bouton de passerelle vers la consultation complète */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onLaunchConsultation(result.input)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <span>Ouvrir l&apos;espace complet d&apos;orientation clinique</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Carte Vectorielle GPS Animée (5 col) */}
              <div className="md:col-span-5 bg-obsidian text-white rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[210px] shadow-lg">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 z-10">
                  <span>ITINÉRAIRE DIRECT</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Trafic fluide
                  </span>
                </div>

                {/* Tracé SVG entre Patient et Hôpital */}
                <div className="my-3 relative z-10">
                  <svg className="w-full h-24 overflow-visible" viewBox="0 0 240 80" fill="none">
                    <line x1="0" y1="20" x2="240" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="240" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <path
                      d="M 24 62 C 85 62, 95 18, 210 22"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="route-path-animated"
                    />
                    <circle cx="24" cy="62" r="5" fill="#FFFFFF" />
                    <text x="14" y="77" fill="#A1A1AA" fontSize="9" fontFamily="JetBrains Mono">
                      Vous
                    </text>
                    <circle cx="210" cy="22" r="9" fill="rgba(16, 185, 129, 0.25)" />
                    <circle cx="210" cy="22" r="4.5" fill="#10B981" />
                    <text x="175" y="10" fill="#34D399" fontSize="9" fontFamily="JetBrains Mono">
                      Hôpital
                    </text>
                  </svg>
                </div>

                <div className="flex items-center justify-between gap-2 z-10 pt-2 border-t border-white/10">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${result.hospital}, ${cityName}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Lancer l&apos;itinéraire</span>
                  </a>
                  <button
                    type="button"
                    onClick={resetConsole}
                    title="Nouvelle analyse"
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
