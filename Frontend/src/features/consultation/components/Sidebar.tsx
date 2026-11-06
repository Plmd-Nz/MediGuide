"use client";

import React from "react";
import Image from "next/image";
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Sun, 
  Moon, 
  LogOut, 
  ArrowLeft,
  X,
  Compass,
  Sparkles,
  PanelLeftClose
} from "lucide-react";
import { ConversationSession } from "@/core/types/consultation";
import { UserProfile } from "@/core/types/auth";

interface SidebarProps {
  sessions: ConversationSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isOpenDesktop?: boolean;
  onCloseDesktop?: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  onTriggerGoogleAuth: () => void;
  onBackToLanding: () => void;
}

export function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpenMobile,
  onCloseMobile,
  isOpenDesktop = true,
  onCloseDesktop = () => {},
  theme,
  toggleTheme,
  user,
  onLogout,
  onTriggerGoogleAuth,
  onBackToLanding,
}: SidebarProps) {
  return (
    <>
      {/* Backdrop sombre sur mobile */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Conteneur principal de la Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-72 sm:w-80 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-850/80 transition-all duration-300 ease-out select-none ${
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        } ${!isOpenDesktop ? "lg:w-0 lg:opacity-0 lg:border-r-0 lg:pointer-events-none lg:overflow-hidden" : ""}`}
      >
        {/* =========================================================
             1. EN-TÊTE : LOGO CARRÉ & IDENTITÉ MEDIGUIDE IA (FERMABLE AU CLIC)
             ========================================================= */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-850 shrink-0">
          <button
            type="button"
            onClick={() => {
              onCloseDesktop();
              onCloseMobile();
            }}
            className="flex items-center gap-3 group text-left p-1 -m-1 rounded-2xl hover:bg-zinc-200/50 dark:hover:bg-zinc-850/80 transition-all cursor-pointer"
            title="Cliquer pour fermer la barre latérale"
          >
            <div className="relative w-10 h-10 rounded-2xl bg-obsidian dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center shadow-sm overflow-hidden shrink-0 group-hover:scale-95 transition-transform">
              <Image
                src="/logo-square.svg"
                alt="MediGuide IA"
                width={36}
                height={36}
                className="w-8 h-8 object-contain transition-opacity group-hover:opacity-30"
                priority
              />
              <PanelLeftClose className="w-5 h-5 absolute text-zinc-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm tracking-tight text-obsidian dark:text-white">
                  MediGuide
                </span>
                <span className="font-serif italic font-normal text-emerald-600 dark:text-emerald-400 text-xs">
                  IA
                </span>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Fermer la barre ◀
              </p>
            </div>
          </button>

          {/* Bouton fermer sur desktop & mobile */}
          <button
            type="button"
            onClick={() => {
              onCloseDesktop();
              onCloseMobile();
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-obsidian dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
            aria-label="Fermer la barre latérale"
            title="Fermer la barre latérale"
          >
            <PanelLeftClose className="w-4 h-4 hidden lg:block" />
            <X className="w-5 h-5 lg:hidden" />
          </button>
        </div>

        {/* =========================================================
             2. BOUTON D'ACTION : NOUVELLE CONSULTATION
             ========================================================= */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => {
              onNewSession();
              onCloseMobile();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-obsidian hover:bg-emerald-600 text-white dark:bg-white dark:text-obsidian dark:hover:bg-emerald-400 dark:hover:text-obsidian font-display font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-200 shadow-sm cursor-pointer group active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>Nouvelle consultation</span>
          </button>
        </div>

        {/* =========================================================
             3. HISTORIQUE DES SESSIONS (ESPACÉ & AÉRÉ)
             ========================================================= */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          <div>
            <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              <span>Consultations récentes</span>
              <span className="text-[10px]">{sessions.length}</span>
            </div>

            <div className="space-y-1.5">
              {sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <div
                    key={session.id}
                    className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-colors cursor-pointer ${
                      isActive
                        ? "bg-zinc-200/60 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-semibold shadow-sm border border-zinc-300/60 dark:border-zinc-700/60"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                    onClick={() => {
                      onSelectSession(session.id);
                      onCloseMobile();
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-400 group-hover:text-emerald-500"
                        }`}
                      />
                      <div className="truncate">
                        <span className="truncate block font-medium text-zinc-800 dark:text-zinc-200">{session.title}</span>
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-normal block">
                          {session.cityName}
                        </span>
                      </div>
                    </div>

                    {/* Bouton de suppression */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-zinc-400 transition-all cursor-pointer"
                      title="Supprimer la consultation"
                      aria-label="Supprimer la session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================
             4. PIED DE SIDEBAR : PROFIL FIREBASE & OPTIONS
             ========================================================= */}
        <div className="p-3 sm:p-4 border-t border-zinc-200/70 dark:border-zinc-850/80 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/50">
          {/* État Utilisateur Firebase */}
          {user ? (
            <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {user.initials || "P"}
                </div>
                <div className="truncate min-w-0">
                  <p className="font-semibold text-xs text-obsidian dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate font-mono">
                    {user.email || "Compte Firebase"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Déconnexion Firebase"
                className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onTriggerGoogleAuth}
              className="w-full py-2.5 px-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 bg-white dark:bg-zinc-900 text-obsidian dark:text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"/>
              </svg>
              <span>Connexion avec Google</span>
            </button>
          )}

          {/* Outils : Thème & Retour Vitrine */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-obsidian dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour au site</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={theme === "dark" ? "Mode clair" : "Mode sombre"}
              aria-label="Basculer le thème"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
