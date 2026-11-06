"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MapPin, 
  Clock, 
  Check, 
  Copy, 
  ArrowUpRight, 
  Building2, 
  ShieldCheck, 
  Activity 
} from "lucide-react";
import { modalBackdropVariants, modalContentVariants } from "@/shared/animations/variants";

export interface FacilityDetail {
  name: string;
  dept: string;
  dist: string;
  wait: string;
  equip: string;
  match: string;
  category: string;
  lat?: number;
  lon?: number;
}

interface FacilityModalProps {
  facility: FacilityDetail | null;
  onClose: () => void;
  cityName: string;
}

export function FacilityModal({ facility, onClose, cityName }: FacilityModalProps) {
  const [copiedPass, setCopiedPass] = useState(false);

  if (!facility) return null;

  const handleCopyPass = () => {
    navigator.clipboard?.writeText("MG-2026-VAL");
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
  };

  const mapsQuery = encodeURIComponent(`${facility.name}, ${cityName}, République Démocratique du Congo`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <AnimatePresence>
      <motion.div
        variants={modalBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm"
      >
        <motion.div
          variants={modalContentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Service vérifié • {facility.match}
                </span>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white mt-1 leading-snug">
                  {facility.name}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
              <span className="text-zinc-500 dark:text-zinc-400 block mb-1 font-medium">
                Pôle médical référent
              </span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                {facility.dept}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-1 font-medium">
                  <MapPin className="w-3.5 h-3.5" /> Distance estimée
                </span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 font-mono text-sm">
                  {facility.dist}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-1 font-medium">
                  <Clock className="w-3.5 h-3.5" /> Temps d&apos;accueil
                </span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  {facility.wait}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
              <span className="text-zinc-500 dark:text-zinc-400 block mb-1 font-medium">
                Ressources & Équipements certifiés
              </span>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {facility.equip}
              </p>
            </div>

            {/* Pass Triage */}
            <div className="p-3.5 rounded-xl bg-zinc-950 text-white dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider block">
                  Pass numérique d&apos;orientation
                </span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  MG-2026-VAL
                </span>
              </div>
              <button
                onClick={handleCopyPass}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 text-xs font-medium text-white transition-all cursor-pointer"
              >
                {copiedPass ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>Ouvrir dans Google Maps</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
