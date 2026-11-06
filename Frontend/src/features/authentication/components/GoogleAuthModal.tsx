"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { UserProfile, MockGoogleAccount } from "@/core/types";
import { modalBackdropVariants, modalContentVariants } from "@/shared/animations/variants";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (profile: UserProfile) => void;
}

const MOCK_ACCOUNTS: MockGoogleAccount[] = [
  {
    name: "Alexandre K.",
    email: "alexandre.patient@gmail.com",
    initials: "AK",
    role: "Patient Référent",
  },
  {
    name: "Dr. Sarah M.",
    email: "sarah.mediguide@gmail.com",
    initials: "SM",
    role: "Médecin Consultant",
  },
];

export function GoogleAuthModal({ isOpen, onClose, onSelectAccount }: GoogleAuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-modal-title"
        >
          <motion.div
            variants={modalContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Connexion sécurisée avec Google
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-5">
              <h4 id="google-modal-title" className="font-display font-bold text-xl text-zinc-950 dark:text-white">
                Choisissez un compte
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                pour synchroniser vos orientations vers <strong className="text-zinc-950 dark:text-white">MediGuide IA</strong>
              </p>

              <div className="mt-5 space-y-2.5">
                {MOCK_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() =>
                      onSelectAccount({
                        name: acc.name,
                        email: acc.email,
                        initials: acc.initials,
                      })
                    }
                    className="w-full p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-white hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3.5 text-left transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-display font-bold text-sm shadow-sm">
                      {acc.initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-zinc-950 dark:text-white">{acc.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{acc.email}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
              Google partagera votre nom et votre adresse e-mail avec MediGuide pour synchroniser vos orientations médicales.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
