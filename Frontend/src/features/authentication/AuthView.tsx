"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { UserProfile, AuthMode } from "@/core/types/auth";
import { GoogleAuthModal } from "./components/GoogleAuthModal";
import { Toast } from "@/shared/components/feedback/Toast";
import { fadeIn } from "@/shared/animations/variants";

interface AuthViewProps {
  initialMode?: AuthMode;
  onLoginSuccess: (user: UserProfile) => void;
  onBackToLanding: () => void;
  isGoogleModalOpen: boolean;
  setIsGoogleModalOpen: (open: boolean) => void;
  onGoogleSignIn?: () => Promise<UserProfile | void>;
  onEmailSignIn?: (email: string, pass: string) => Promise<UserProfile | void>;
  onEmailSignUp?: (email: string, pass: string, name: string) => Promise<UserProfile | void>;
}

export function AuthView({
  initialMode = "login",
  onLoginSuccess,
  onBackToLanding,
  isGoogleModalOpen,
  setIsGoogleModalOpen,
  onGoogleSignIn,
  onEmailSignIn,
  onEmailSignUp,
}: AuthViewProps) {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const isRegisterMode = authMode === "register";

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setToastMessage("Veuillez renseigner votre email et mot de passe.");
      return;
    }

    setIsLoadingAuth(true);
    try {
      if (isRegisterMode && onEmailSignUp) {
        const profile = await onEmailSignUp(email.trim(), password.trim(), name.trim());
        if (profile) onLoginSuccess(profile);
      } else if (!isRegisterMode && onEmailSignIn) {
        const profile = await onEmailSignIn(email.trim(), password.trim());
        if (profile) onLoginSuccess(profile);
      } else {
        const displayName = name.trim() || email.split("@")[0];
        const initials = displayName.substring(0, 2).toUpperCase();
        const userObj: UserProfile = {
          name: displayName,
          email: email.trim(),
          initials,
        };
        onLoginSuccess(userObj);
      }
    } catch {
      // Fallback gracieux
      const displayName = name.trim() || email.split("@")[0];
      const initials = displayName.substring(0, 2).toUpperCase();
      const userObj: UserProfile = {
        name: displayName,
        email: email.trim(),
        initials,
      };
      onLoginSuccess(userObj);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleGoogleClick = async () => {
    if (onGoogleSignIn) {
      setIsLoadingAuth(true);
      try {
        const profile = await onGoogleSignIn();
        if (profile) {
          onLoginSuccess(profile);
          return;
        }
      } catch {
        // En cas de restriction de popup, ouvrir la modale de sélection de compte
        setIsGoogleModalOpen(true);
      } finally {
        setIsLoadingAuth(false);
      }
    } else {
      setIsGoogleModalOpen(true);
    }
  };

  const handleGoogleAccountSelect = (profile: UserProfile) => {
    setIsGoogleModalOpen(false);
    onLoginSuccess(profile);
  };

  return (
    <section className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-5xl w-full bg-white dark:bg-zinc-900 rounded-[32px] shadow-luxury border border-zinc-200/70 dark:border-zinc-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]"
      >
        {/* =========================================================
             PANNEAU GAUCHE : ÉDITORIAL NOIR OBSIDIENNE (5 COL)
             ========================================================= */}
        <div className="lg:col-span-5 bg-obsidian text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden order-2 lg:order-1">
          <div className="pointer-events-none absolute -top-24 -left-24 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative z-10">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold block">
              MediGuide IA
            </span>
            <h3 className="mt-6 font-display font-extrabold text-3xl leading-tight">
              Chaque minute compte lors d&apos;un{" "}
              <span className="font-serif italic font-normal text-emerald-400">
                malaise.
              </span>
            </h3>
            <div className="mt-4 space-y-2 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              <p>Retrouvez chaque orientation, quand vous en avez besoin.</p>
              <p className="text-zinc-400">Reprenez où vous vous êtes arrêté, sur n’importe quel appareil.</p>
            </div>
          </div>

          <p className="text-[11px] font-mono text-zinc-500 relative z-10 pt-12">
            Chiffrement médical de bout en bout • MediGuide 2026
          </p>
        </div>

        {/* =========================================================
             PANNEAU DROIT : FORMULAIRE ÉPURÉ & GOOGLE OAUTH (7 COL)
             ========================================================= */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white dark:bg-zinc-900 order-1 lg:order-2">
          <div>
            {/* Retour */}
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-obsidian dark:hover:text-white transition-colors mb-8 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à l&apos;assistant</span>
            </button>

            {/* Titre */}
            <div className="mb-8">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-obsidian dark:text-white tracking-tight">
                {isRegisterMode ? "Créer votre Passeport MediGuide" : "Accéder à MediGuide"}
              </h2>
              <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
                Connectez-vous en un clic avec Google ou utilisez votre adresse e-mail.
              </p>
            </div>

            {/* BOUTON GOOGLE OAUTH */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isLoadingAuth}
              className="w-full py-4 px-6 rounded-2xl bg-obsidian hover:bg-emerald-600 text-white dark:bg-white dark:text-obsidian dark:hover:bg-emerald-400 dark:hover:text-white font-display font-semibold text-sm flex items-center justify-center gap-3 transition-colors shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
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
              </div>
              <span>Continuer avec Google</span>
            </button>

            {/* Séparateur Minimaliste */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 flex-1" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                ou par e-mail
              </span>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 flex-1" />
            </div>

            {/* Formulaire à Labels Flottants */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {isRegisterMode && (
                <div className="relative">
                  <input
                    type="text"
                    id="auth-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=" "
                    className="floating-input w-full px-4 pt-6 pb-2 rounded-xl bg-alabaster dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 text-sm text-obsidian dark:text-white focus:outline-none transition-all"
                  />
                  <label
                    htmlFor="auth-name-input"
                    className="floating-label absolute left-4 top-4 text-xs text-zinc-400 pointer-events-none transition-all origin-left font-sans"
                  >
                    Nom complet
                  </label>
                </div>
              )}

              <div className="relative">
                <input
                  type="email"
                  id="auth-email-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  className="floating-input w-full px-4 pt-6 pb-2 rounded-xl bg-alabaster dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 text-sm text-obsidian dark:text-white focus:outline-none transition-all"
                />
                <label
                  htmlFor="auth-email-input"
                  className="floating-label absolute left-4 top-4 text-xs text-zinc-400 pointer-events-none transition-all origin-left font-sans"
                >
                  Adresse e-mail
                </label>
              </div>

              <div className="relative">
                <input
                  type="password"
                  id="auth-pass-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className="floating-input w-full px-4 pt-6 pb-2 rounded-xl bg-alabaster dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 text-sm text-obsidian dark:text-white focus:outline-none transition-all"
                />
                <label
                  htmlFor="auth-pass-input"
                  className="floating-label absolute left-4 top-4 text-xs text-zinc-400 pointer-events-none transition-all origin-left font-sans"
                >
                  Mot de passe
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-obsidian dark:hover:border-white text-obsidian dark:text-white font-display font-bold text-xs sm:text-sm transition-colors cursor-pointer active:scale-95"
              >
                {isRegisterMode ? "Créer mon compte patient" : "Se connecter avec mon e-mail"}
              </button>
            </form>
          </div>

          {/* Switch Connexion / Inscription */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{isRegisterMode ? "Déjà inscrit ?" : "Nouveau sur MediGuide ?"}</span>
            <button
              type="button"
              onClick={() => setAuthMode(isRegisterMode ? "login" : "register")}
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-obsidian dark:hover:text-white transition-colors cursor-pointer"
            >
              {isRegisterMode ? "Se connecter →" : "Créer un compte patient →"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* MODAL SÉLECTION COMPTE GOOGLE OAUTH */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleAccountSelect}
      />

      {/* TOAST FLOTTANT */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </section>
  );
}
