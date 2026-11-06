"use client";

import React, { useEffect, useRef } from "react";

export function StepsWorkflow() {
  const stepsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("on");
            obs.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section id="flow-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40">
      <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 pt-16">
        <div className="mb-12">
          <span className="font-mono text-[11px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold block mb-2">
            Parcours Simplifié
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-obsidian dark:text-white tracking-tight">
            Comment fonctionne l&apos;orientation ?
          </h2>
        </div>

        {/* Le bloc exact requis */}
        <div className="steps" id="steps" ref={stepsRef}>
          <div className="st">
            <b className="st-badge">01</b>
            <h3 className="font-display font-bold text-lg text-obsidian dark:text-white pt-4 pb-1">
              Saisir ses malaises
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
              Indiquez vos symptômes, leur durée et leur intensité directement dans la barre MediGuide ou par message vocal.
            </p>
          </div>

          <div className="st">
            <b className="st-badge">02</b>
            <h3 className="font-display font-bold text-lg text-obsidian dark:text-white pt-4 pb-1">
              Triage &amp; Croisement GPS
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
              L&apos;IA détermine la spécialité médicale requise et filtre les 38 957 structures proches prêtes à vous recevoir.
            </p>
          </div>

          <div className="st">
            <b className="st-badge">03</b>
            <h3 className="font-display font-bold text-lg text-obsidian dark:text-white pt-4 pb-1">
              S&apos;orienter sans attente
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
              Suivez l&apos;itinéraire direct et présentez votre synthèse d&apos;orientation clinique et votre pas dès votre arrivée.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
