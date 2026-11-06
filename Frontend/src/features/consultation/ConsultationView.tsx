"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Menu,
  MapPin, 
  Loader2, 
  Bot,
  PanelLeft
} from "lucide-react";
import { useConsultation } from "./hooks/useConsultation";
import { MessageBubble } from "./components/MessageBubble";
import { ConsultationComposer } from "./components/ConsultationComposer";
import { LocationModal } from "./components/LocationModal";
import { VoiceRecorderModal } from "./components/VoiceRecorderModal";
import { Sidebar } from "./components/Sidebar";
import { ChatEmptyState } from "./components/ChatEmptyState";
import { fadeIn } from "@/shared/animations/variants";
import { UserProfile } from "@/core/types/auth";

interface ConsultationViewProps {
  onBackToLanding: () => void;
  initialPrompt?: string;
  consultationState?: ReturnType<typeof useConsultation>;
  user?: UserProfile | null;
  onLogout?: () => void;
  onTriggerGoogleAuth?: () => void;
  theme?: "dark" | "light";
  toggleTheme?: () => void;
}

export function ConsultationView({
  onBackToLanding,
  initialPrompt,
  consultationState,
  user = null,
  onLogout = () => {},
  onTriggerGoogleAuth = () => {},
  theme = "dark",
  toggleTheme = () => {},
}: ConsultationViewProps) {
  const localState = useConsultation(user);
  const state = consultationState || localState;

  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isSidebarOpenDesktop, setIsSidebarOpenDesktop] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const initialPromptHandled = useRef(false);

  // Auto-scroll sur nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.isLoading]);

  // Exécution du prompt initial si transmis
  useEffect(() => {
    if (initialPrompt && !initialPromptHandled.current) {
      initialPromptHandled.current = true;
      state.sendMessage(initialPrompt);
    }
  }, [initialPrompt, state]);

  const isEmpty = state.messages.length <= 1;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-obsidian text-obsidian dark:text-alabaster font-sans">
      {/* =========================================================
           1. BARRE LATÉRALE (SIDEBAR GAUCHE TYPE GEMINI / NCORIA)
           ========================================================= */}
      <Sidebar
        sessions={state.sessions}
        activeSessionId={state.activeSessionId}
        onSelectSession={state.selectSession}
        onNewSession={state.createNewSession}
        onDeleteSession={state.deleteSession}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isOpenDesktop={isSidebarOpenDesktop}
        onCloseDesktop={() => setIsSidebarOpenDesktop(false)}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        onLogout={onLogout}
        onTriggerGoogleAuth={onTriggerGoogleAuth}
        onBackToLanding={onBackToLanding}
      />

      {/* =========================================================
           2. ESPACE DE CHAT CENTRAL PLEIN ÉCRAN
           ========================================================= */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* HEADER APPLICATIF MINIMALISTE */}
        <header className="h-16 px-4 sm:px-6 border-b border-zinc-200/80 dark:border-zinc-850 flex items-center justify-between shrink-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Bouton Menu Mobile */}
            <button
              type="button"
              onClick={() => setIsOpenMobile(true)}
              className="p-2 -ml-1 text-zinc-500 hover:text-obsidian dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-850 lg:hidden cursor-pointer"
              aria-label="Ouvrir le menu des conversations"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Bouton Réouverture Sidebar sur Desktop quand fermée */}
            {!isSidebarOpenDesktop && (
              <button
                type="button"
                onClick={() => setIsSidebarOpenDesktop(true)}
                className="hidden lg:flex items-center justify-center p-2 rounded-xl text-zinc-500 hover:text-obsidian dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
                title="Ouvrir la barre latérale"
                aria-label="Ouvrir la barre latérale"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}

            {/* Logo de l'application & Titre MediGuide AI dans la barre du haut */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-obsidian dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center shadow-sm shrink-0">
                <Image
                  src="/logo-square.svg"
                  alt="MediGuide AI"
                  width={24}
                  height={24}
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm sm:text-base tracking-tight text-obsidian dark:text-white">
                  MediGuide
                </span>
                <span className="font-serif italic font-normal text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                  AI
                </span>
              </div>
            </div>
          </div>

          {/* Outils : Uniquement le bouton de géolocalisation */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => state.setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-mono font-medium text-obsidian dark:text-white transition-all shadow-sm cursor-pointer"
              title="Modifier la localisation GPS patient"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="truncate max-w-[120px] sm:max-w-[180px]">
                {state.currentCity.ville}
              </span>
            </button>
          </div>
        </header>

        {/* ZONE DE MESSAGES AVEC DÉFILEMENT FLUIDE & RESPIRATION */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 scrollbar-gutter-stable">
          {isEmpty ? (
            <ChatEmptyState
              onSelectPrompt={state.sendMessage}
              cityName={state.currentCity.ville}
            />
          ) : (
            <div className="max-w-3xl w-full mx-auto space-y-8 pb-4">
              {state.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  userLat={state.userCoords.lat}
                  userLon={state.userCoords.lon}
                  cityName={state.currentCity.ville}
                />
              ))}

              {/* Indicateur de chargement en direct */}
              {state.isLoading && (
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-2xl bg-obsidian dark:bg-white text-white dark:text-obsidian flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex items-center gap-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500 shrink-0" />
                    <span className="font-mono">
                      Analyse clinique, croisement spatial et calcul de l&apos;itinéraire GPS en cours...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* COMPOSER DE SAISIE FIXE EN BAS (NON COLLÉ) */}
        <div className="shrink-0 p-4 sm:p-6 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-obsidian dark:via-obsidian/95 dark:to-transparent z-10">
          <div className="max-w-3xl mx-auto">
            <ConsultationComposer
              onSendMessage={state.sendMessage}
              onOpenVoiceModal={() => state.setIsVoiceModalOpen(true)}
              onOpenLocationModal={() => state.setIsLocationModalOpen(true)}
              isLoading={state.isLoading}
              currentCityName={state.currentCity.ville}
            />
          </div>
        </div>
      </div>

      {/* =========================================================
           3. MODALES LOCALISATION & VOCALE
           ========================================================= */}
      <LocationModal
        isOpen={state.isLocationModalOpen}
        onClose={() => state.setIsLocationModalOpen(false)}
        currentLat={state.userCoords.lat}
        currentLon={state.userCoords.lon}
        currentCityName={state.currentCity.ville}
        onSelectLocation={state.setLocation}
        cities={state.cities}
      />

      <VoiceRecorderModal
        isOpen={state.isVoiceModalOpen}
        onClose={() => state.setIsVoiceModalOpen(false)}
        onSendAudio={state.sendAudio}
        isLoading={state.isLoading}
      />
    </div>
  );
}
