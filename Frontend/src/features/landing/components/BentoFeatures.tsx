"use client";

import React from "react";
import { Check } from "lucide-react";

export function BentoFeatures() {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <section id="bento-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28">
      {/* Grille 3 Cartes Aérées avec Spotlight Curseur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARTE 1 : Analyse Sémantique & Onde ECG Interactive */}
        <div
          onMouseMove={handleMouseMove}
          className="spotlight-card p-8 flex flex-col justify-between min-h-[380px] group"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs text-zinc-400">01 / COMPRÉHENSION</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <h3 className="font-display font-bold text-xl text-obsidian dark:text-white">
              Dialogue Clinique Naturel
            </h3>
            <p className="mt-2.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
              Exprimez vos malaises avec vos propres mots ou en langues nationales (Lingala, Swahili, Kikongo, Tshiluba). L&apos;IA détecte les signes de gravité.
            </p>
          </div>

          {/* Visuel : Onde Biométrique Réactive */}
          <div className="relative z-10 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <div className="h-28 rounded-2xl bg-alabaster dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 p-4 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-400">SIGNAL SYMPTOMATIQUE</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Temps réel</span>
              </div>
              <svg
                className="w-full h-12 stroke-obsidian dark:stroke-white group-hover:stroke-emerald-500 transition-colors duration-500"
                viewBox="0 0 300 50"
                fill="none"
              >
                <path
                  d="M 0 25 Q 35 25, 50 25 L 65 10 L 80 42 L 95 6 L 112 44 L 128 18 L 142 25 L 210 25 L 225 12 L 240 38 L 255 25 L 300 25"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* CARTE 2 : Radar Géospatial des Hôpitaux */}
        <div
          onMouseMove={handleMouseMove}
          className="spotlight-card p-8 flex flex-col justify-between min-h-[380px] group"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs text-zinc-400">02 / PROXIMITÉ</span>
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Rayon RDC
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-obsidian dark:text-white">
              Radar Sanitaire Live
            </h3>
            <p className="mt-2.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
              Localisation instantanée près de votre position (Ville → Province → Interprovincial → National).
            </p>
          </div>

          {/* Visuel : Radar Concentrique Minimaliste */}
          <div className="relative z-10 mt-8 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative bg-alabaster/60 dark:bg-zinc-950/60">
              <div className="w-24 h-24 rounded-full border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 ai-orb" />
              </div>
              <div
                className="absolute inset-0 rounded-full radar-beam"
                style={{
                  background: "conic-gradient(from 0deg, rgba(16, 185, 129, 0.16), transparent 65deg)",
                }}
              />
              <div
                className="absolute top-6 right-8 w-2.5 h-2.5 rounded-full bg-obsidian dark:bg-white ring-4 ring-emerald-500/20"
                title="Structure Niveau 1"
              />
              <div
                className="absolute bottom-8 left-7 w-2 h-2 rounded-full bg-emerald-600"
                title="Structure Niveau 2"
              />
            </div>
          </div>
        </div>

        {/* CARTE 3 : Jauge de Correspondance du Plateau Technique */}
        <div
          onMouseMove={handleMouseMove}
          className="spotlight-card p-8 flex flex-col justify-between min-h-[380px] group"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs text-zinc-400">03 / PLATEAU TECHNIQUE</span>
              <span className="w-2 h-2 rounded-full bg-obsidian dark:bg-white" />
            </div>
            <h3 className="font-display font-bold text-xl text-obsidian dark:text-white">
              Adéquation Certifiée
            </h3>
            <p className="mt-2.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
              Ne vous déplacez jamais vers un centre non équipé : MediGuide valide la présence du bloc ou service requis.
            </p>
          </div>

          {/* Visuel : Anneau de Précision Circulaire */}
          <div className="relative z-10 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase text-zinc-400 block">Indice de fiabilité</span>
              <span className="font-display font-extrabold text-4xl text-obsidian dark:text-white tracking-tight">
                99.2<span className="text-emerald-500">%</span>
              </span>
              <span className="block text-xs text-zinc-400 mt-1">Services vérifiés 24h/24</span>
            </div>
            <div className="w-20 h-20 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" stroke="#E4E4E7" strokeWidth="6" fill="none" className="dark:stroke-zinc-800" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#10B981"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray="201"
                  strokeDashoffset="16"
                  strokeLinecap="round"
                />
              </svg>
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 absolute" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
