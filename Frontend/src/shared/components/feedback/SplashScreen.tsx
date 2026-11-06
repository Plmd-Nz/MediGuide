"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<"writing" | "complete">("writing");

  useEffect(() => {
    // Vérifier si l'utilisateur préfère réduire les mouvements
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // Durée d'écriture et de contemplation avant déverrouillage de la page
    const timerStage = setTimeout(() => {
      setStage("complete");
    }, 1700);

    const timerComplete = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(timerStage);
      clearTimeout(timerComplete);
    };
  }, [onComplete]);

  return (
    <motion.div
      key="splash-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        y: -30,
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-obsidian text-white select-none px-6"
      style={{ willChange: "transform, opacity" }}
    >
      {/* Lueur d'ambiance centrale émeraude */}
      <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none -translate-y-6" />

      {/* Contenu central */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Pastille orbe animée */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl relative"
        >
          <span className="w-3 h-3 rounded-full bg-emerald-400 ai-orb" />
          <span className="absolute inset-0 rounded-2xl border border-emerald-400/20 animate-ping" />
        </motion.div>

        {/* Titre écrit avec animation progressive : MediGuide IA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5 font-display text-4xl sm:text-6xl font-extrabold tracking-tight"
        >
          <span className="text-white">MediGuide</span>
          <span className="text-emerald-400 font-serif italic font-normal text-3xl sm:text-5xl ml-1">
            IA
          </span>
        </motion.div>

        {/* Sous-titre clinique */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-3 text-xs sm:text-sm font-mono uppercase tracking-widest text-zinc-400 font-medium"
        >
          Système d&apos;orientation médicale géolocalisé
        </motion.p>

        {/* Ligne de chargement haute précision */}
        <div className="mt-8 w-44 sm:w-56 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-emerald-400 origin-left"
          />
        </div>
      </div>
    </motion.div>
  );
}
