"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, ArrowRight } from "lucide-react";
import { RotatingHeadline } from "./components/RotatingHeadline";
import { BentoFeatures } from "./components/BentoFeatures";
import { StepsWorkflow } from "./components/StepsWorkflow";
import { fadeIn, slideUp } from "@/shared/animations/variants";

interface LandingViewProps {
  onSwitchView: (view: "landing" | "app" | "auth", authMode?: "login" | "register") => void;
  onLaunchConsultation: (initialPrompt?: string) => void;
  onTriggerGoogleAuth: () => void;
  cityName: string;
}

export function LandingView({
  onSwitchView,
  onLaunchConsultation,
  onTriggerGoogleAuth,
  cityName,
}: LandingViewProps) {
  return (
    <div className="min-h-screen text-obsidian dark:text-alabaster pt-32 sm:pt-40 pb-20">
      {/* =========================================================
           1. HERO SECTION & ACCROCHE ROTATIVE
           ========================================================= */}
      <section id="hero-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Mention Système — sans cadre ni point vert */}
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="font-mono text-xs sm:text-sm uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold mb-6"
        >
          Système intelligent d&apos;orientation médicale géolocalisé
        </motion.p>

        {/* Titre Cinétique avec rotation de la 2e ligne */}
        <motion.div variants={slideUp} initial="hidden" animate="visible">
          <RotatingHeadline />
        </motion.div>

        {/* Sous-titre Aéré */}
        <motion.p
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="mt-6 sm:mt-7 text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed font-sans"
        >
          Une intelligence adaptée qui comprend vos malaises en langage naturel et vous dirige vers la structure sanitaire la plus proche équipée pour vous soigner.
        </motion.p>

        {/* Actions Principales : Bouton Orienter vers le Chatbot */}
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={() => onLaunchConsultation()}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-obsidian hover:bg-emerald-600 text-white dark:bg-white dark:text-obsidian dark:hover:bg-emerald-400 dark:hover:text-obsidian font-display font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-luxury hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <Compass className="w-5 h-5 text-emerald-400 dark:text-emerald-600 group-hover:rotate-45 transition-transform duration-500" />
            <span>Orienter sans attendre</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => {
              document.getElementById("flow-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-display font-semibold text-sm transition-colors cursor-pointer"
          >
            Découvrir le protocole
          </button>
        </motion.div>

        {/* Micro-mention de disponibilité géographique */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-zinc-400 dark:text-zinc-500"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Triage clinique gratuit • Couverture nationale RDC ({cityName || "Kinshasa"})</span>
        </motion.div>
      </section>

      {/* =========================================================
           2. BENTO GRID 3 CARTES VISUELLES AVEC SPOTLIGHT
           ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <BentoFeatures />
      </motion.div>

      {/* =========================================================
           3. PARCOURS EN 3 ÉTAPES FONCTIONNELLES (CODE SPÉCIFIQUE REQUIS)
           ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <StepsWorkflow />
      </motion.div>

      {/* =========================================================
           4. BANNIÈRE FINALE MINIMALISTE (SYNCHRONISATION GOOGLE)
           ========================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40"
      >
        <div className="rounded-[32px] bg-obsidian text-white p-10 sm:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
          {/* Lueur subtile émeraude */}
          <div className="pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl" />

          <div className="max-w-xl relative z-10">
            <span className="font-mono text-[11px] uppercase tracking-widest text-emerald-400 block mb-3 font-semibold">
              Gardez une trace de chaque orientation
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight">
              Connectez-vous pour retrouver votre historique à tout moment.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
            <button
              type="button"
              onClick={onTriggerGoogleAuth}
              className="px-6 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-obsidian font-display font-bold text-xs sm:text-sm flex items-center gap-3 transition-colors shadow-lg cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Continuer avec Google</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* =========================================================
           5. PIED DE PAGE (FOOTER ÉPURÉ)
           ========================================================= */}
      <footer className="border-t border-zinc-200/70 dark:border-zinc-800/80 mt-28 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-display font-bold text-obsidian dark:text-white">MediGuide</span>
            <span>— Orientation médicale assistée par IA</span>
          </div>
          <p className="font-mono text-[11px]">
            © 2026 MediGuide RDC. En cas d&apos;urgence vitale, contactez les secours.
          </p>
        </div>
      </footer>
    </div>
  );
}
