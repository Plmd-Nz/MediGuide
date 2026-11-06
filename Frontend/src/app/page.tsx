"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/shared/hooks/useTheme";
import { useAuth } from "@/features/authentication/hooks/useAuth";
import { useConsultation } from "@/features/consultation/hooks/useConsultation";
import { Navbar } from "@/shared/components/layout/Navbar";
import { SplashScreen } from "@/shared/components/feedback/SplashScreen";
import { LandingView } from "@/features/landing/LandingView";
import { AuthView } from "@/features/authentication/AuthView";
import { ConsultationView } from "@/features/consultation/ConsultationView";
import { viewSwitchVariants } from "@/shared/animations/variants";
import { AuthMode } from "@/core/types/auth";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { 
    user, 
    login, 
    logout, 
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    isGoogleModalOpen, 
    setIsGoogleModalOpen 
  } = useAuth();
  
  const consultationState = useConsultation(user);

  const [currentView, setCurrentView] = useState<"landing" | "app" | "auth">("landing");
  const [showSplash, setShowSplash] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>(undefined);

  const handleSwitchView = (view: "landing" | "app" | "auth", mode?: AuthMode) => {
    if (mode) setAuthMode(mode);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLaunchConsultation = (prompt?: string) => {
    if (prompt) {
      setInitialPrompt(prompt);
    }
    setCurrentView("app");
  };

  const handleTriggerGoogleAuth = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        login(loggedUser);
      }
    } catch {
      setAuthMode("login");
      setIsGoogleModalOpen(true);
      setCurrentView("auth");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-obsidian text-obsidian dark:text-alabaster flex flex-col font-sans transition-colors duration-200">
      {/* Animation d'accueil cinétique (Splash Screen MediGuide IA) */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Barre de navigation vitrine (affichée UNIQUEMENT sur landing et auth, jamais sur l'application dédiée) */}
      {currentView !== "app" && (
        <Navbar
          currentView={currentView}
          onSwitchView={handleSwitchView}
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          onLogout={logout}
        />
      )}

      {/* Vue active de l'application */}
      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {currentView === "landing" && (
            <motion.div
              key="landing"
              variants={viewSwitchVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1"
            >
              <LandingView
                onSwitchView={handleSwitchView}
                onLaunchConsultation={handleLaunchConsultation}
                onTriggerGoogleAuth={handleTriggerGoogleAuth}
                cityName={consultationState.currentCity.ville}
              />
            </motion.div>
          )}

          {currentView === "app" && (
            <motion.div
              key="app"
              variants={viewSwitchVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 h-screen"
            >
              <ConsultationView
                onBackToLanding={() => handleSwitchView("landing")}
                initialPrompt={initialPrompt}
                consultationState={consultationState}
                user={user}
                onLogout={logout}
                onTriggerGoogleAuth={handleTriggerGoogleAuth}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            </motion.div>
          )}

          {currentView === "auth" && (
            <motion.div
              key="auth"
              variants={viewSwitchVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1"
            >
              <AuthView
                initialMode={authMode}
                onLoginSuccess={(loggedUser) => {
                  login(loggedUser);
                  setCurrentView("landing");
                }}
                onBackToLanding={() => handleSwitchView("landing")}
                isGoogleModalOpen={isGoogleModalOpen}
                setIsGoogleModalOpen={setIsGoogleModalOpen}
                onGoogleSignIn={loginWithGoogle}
                onEmailSignIn={loginWithEmail}
                onEmailSignUp={registerWithEmail}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
