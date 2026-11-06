"use client";

import React from "react";
import Image from "next/image";
import { Activity, Heart, Baby, Bone, Sparkles, ArrowUpRight } from "lucide-react";

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  cityName: string;
}

const CLINICAL_SUGGESTIONS = [
  {
    icon: Heart,
    title: "Douleur thoracique & essoufflement",
    desc: "Recherche immédiate d'un service d'urgences cardiologiques avec soins intensifs.",
    prompt: "J'ai une violente douleur thoracique avec oppression et essoufflement depuis 30 minutes.",
    tag: "Cardiologie / Urgence",
    color: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: Baby,
    title: "Fièvre élevée chez le nourrisson",
    desc: "Orientation pédiatrique prioritaire avec service de néonatologie et laboratoire.",
    prompt: "Mon bébé de 8 mois a plus de 39.5°C de fièvre avec vomissements et somnolence.",
    tag: "Pédiatrie d'urgence",
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Bone,
    title: "Traumatisme articulaire ou fracture",
    desc: "Localisation d'un hôpital équipé d'un service d'imagerie X et bloc de chirurgie.",
    prompt: "Chute sur la cheville, gonflement immédiat et incapacité totale de poser le pied.",
    tag: "Traumatologie & Radio",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Activity,
    title: "Migraine intense & vision floue",
    desc: "Triage neurologique avec disponibilité scanner/IRM et consultation spécialisée.",
    prompt: "Céphalée aiguë brutale avec troubles visuels et vertiges depuis ce matin.",
    tag: "Neurologie",
    color: "text-emerald-600 dark:text-emerald-400",
  },
];

export function ChatEmptyState({ onSelectPrompt, cityName }: ChatEmptyStateProps) {
  return (
    <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center text-center">
      {/* Logo Carré MédiGuide */}
      <div className="w-16 h-16 rounded-3xl bg-obsidian dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-center shadow-luxury mb-8">
        <Image
          src="/logo-square.svg"
          alt="MediGuide IA"
          width={48}
          height={48}
          className="w-10 h-10 object-contain"
          priority
        />
      </div>

      {/* Titre & Sous-titre Aéré */}
      <h2 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight text-obsidian dark:text-white leading-tight">
        Comment puis-je vous orienter aujourd&apos;hui ?
      </h2>
      <p className="mt-4 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl font-normal leading-relaxed font-sans">
        Décrivez les symptômes observés, leur durée et votre état général. L&apos;intelligence clinique analyse la situation et vous oriente vers l&apos;hôpital le plus compétent à <strong>{cityName}</strong>.
      </p>

      {/* Grille 4 Cartes Suggestions Espacées (Non collées) */}
      <div className="w-full mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 text-left">
        {CLINICAL_SUGGESTIONS.map((sug, i) => {
          const Icon = sug.icon;
          return (
            <div
              key={i}
              onClick={() => onSelectPrompt(sug.prompt)}
              className="group p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:shadow-luxury transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[170px]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${sug.color}`} />
                  </div>
                  <span className="text-[10px] font-mono uppercase font-semibold text-zinc-400 group-hover:text-emerald-500 transition-colors">
                    {sug.tag}
                  </span>
                </div>
                <h3 className="font-display font-bold text-sm text-obsidian dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {sug.title}
                </h3>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                  {sug.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-end text-xs text-zinc-400 group-hover:text-emerald-500 font-mono transition-colors">
                <span>Analyser</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
