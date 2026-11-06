"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

export function AuthCardShowcase() {
  return (
    <div className="lg:col-span-6 bg-zinc-950 text-white p-8 sm:p-12 lg:p-14 bg-grid-dark flex flex-col justify-between relative overflow-hidden">
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-zinc-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>IA Médicale Connectée</span>
        </div>
        <h3 className="mt-6 font-display font-extrabold text-3xl sm:text-4xl leading-tight">
          Votre assistant de santé personnel, partout avec vous.
        </h3>
        <p className="mt-3 text-zinc-400 text-sm leading-relaxed max-w-lg">
          Lorsqu'un malaise survient, chaque minute compte. MediGuide analyse vos symptômes et vous guide directement vers l'établissement de santé capable de vous recevoir.
        </p>
      </div>

      {/* Carte Flottante Aperçu de Triage */}
      <div className="my-8 p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/15 space-y-4 animate-float relative z-10 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Orientation MediGuide #MG-904</p>
              <p className="text-[11px] text-zinc-400 font-mono">Synchronisé avec Google Account</p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Prise en charge prête
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-xs space-y-1.5">
          <p className="text-zinc-400">Symptômes déclarés :</p>
          <p className="text-white font-medium">« Vertiges rotatoires, acouphènes et fatigue soudaine »</p>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <div>
            <p className="text-zinc-400">Structure recommandée :</p>
            <p className="font-bold text-white mt-0.5">Clinique ORL & Vestibulaire (1.6 km)</p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-zinc-950 font-bold">
            Itinéraire <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Citation médicale */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
        <p className="text-xs text-zinc-300 italic">
          « MediGuide évite l'engorgement des urgences en orientant chaque patient vers le bon plateau technique dès les premiers symptômes. »
        </p>
        <span className="font-mono text-xs text-zinc-400 shrink-0">Médecine & IA</span>
      </div>
    </div>
  );
}
