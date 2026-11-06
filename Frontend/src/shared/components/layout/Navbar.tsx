"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  LogOut, 
  Sun, 
  Moon, 
  Compass, 
  User as UserIcon,
  MessageSquare
} from "lucide-react";
import { UserProfile } from "@/core/types";

interface NavbarProps {
  currentView: "landing" | "app" | "auth";
  onSwitchView: (view: "landing" | "app" | "auth", authMode?: "login" | "register") => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export function Navbar({
  currentView,
  onSwitchView,
  theme,
  toggleTheme,
  user,
  onLogout,
}: NavbarProps) {
  return (
    <header className="fixed top-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto bg-white/85 dark:bg-obsidian/85 backdrop-blur-xl shadow-pill border border-zinc-200/70 dark:border-zinc-800/80 rounded-full px-3 py-2 flex items-center gap-2 sm:gap-6 transition-all duration-300">
        {/* Identité MediGuide */}
        <button
          type="button"
          onClick={() => onSwitchView("landing")}
          className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full focus:outline-none group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-obsidian dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-105 shrink-0 shadow-sm">
            <Image
              src="/logo-square.svg"
              alt="MediGuide"
              width={24}
              height={24}
              className="w-5 h-5 object-contain"
            />
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-obsidian dark:text-white">
            MediGuide
          </span>
        </button>

        {/* Liens de navigation épurés */}
        <div className="hidden md:flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <button
            type="button"
            onClick={() => {
              onSwitchView("landing");
              setTimeout(() => {
                document.getElementById("console-section")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              currentView === "landing"
                ? "text-obsidian dark:text-white font-semibold bg-zinc-100/70 dark:bg-zinc-800/60"
                : "hover:text-obsidian dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
            }`}
          >
            Triage IA
          </button>
          <button
            type="button"
            onClick={() => {
              onSwitchView("landing");
              setTimeout(() => {
                document.getElementById("bento-section")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="px-3.5 py-1.5 rounded-full hover:text-obsidian dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            Précision
          </button>
          <button
            type="button"
            onClick={() => {
              onSwitchView("landing");
              setTimeout(() => {
                document.getElementById("flow-section")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="px-3.5 py-1.5 rounded-full hover:text-obsidian dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            Parcours
          </button>
          <button
            type="button"
            onClick={() => onSwitchView("app")}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === "app"
                ? "text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40"
                : "hover:text-obsidian dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-500" />
            <span>Consultation</span>
          </button>
        </div>

        {/* Action Connexion / Utilisateur Connecté / Thème */}
        <div className="flex items-center gap-2">
          {/* Bouton Thème */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 text-zinc-500 hover:text-obsidian dark:text-zinc-400 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={theme === "dark" ? "Mode clair" : "Mode sombre"}
            aria-label="Basculer le thème"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Invité */}
          {!user ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSwitchView("auth", "login")}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-obsidian dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => onSwitchView("app")}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-obsidian text-white hover:bg-emerald-600 dark:bg-white dark:text-obsidian dark:hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-600" />
                <span className="hidden sm:inline">Orienter</span>
              </button>
            </div>
          ) : (
            /* Badge Patient Connecté */
            <div className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30">
              <div className="w-6 h-6 rounded-full bg-obsidian dark:bg-white text-white dark:text-obsidian text-[10px] font-mono font-bold flex items-center justify-center">
                {user.initials || "DR"}
              </div>
              <span className="text-xs font-semibold text-obsidian dark:text-white hidden sm:inline">
                {user.name}
              </span>
              <button
                type="button"
                onClick={onLogout}
                title="Se déconnecter"
                className="text-zinc-400 hover:text-obsidian dark:hover:text-white transition-colors p-1 cursor-pointer"
                aria-label="Se déconnecter"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
