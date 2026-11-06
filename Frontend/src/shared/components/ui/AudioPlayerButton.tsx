"use client";

import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface AudioPlayerButtonProps {
  text: string;
  lang?: string;
  label?: string;
}

export function AudioPlayerButton({ text, lang = "fr-FR", label = "Écouter" }: AudioPlayerButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    if (lang.toLowerCase().includes("swahili") || lang.toLowerCase().includes("sw")) {
      utterance.lang = "sw";
    } else {
      utterance.lang = "fr-FR";
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all text-xs font-medium cursor-pointer ${
        isPlaying
          ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 animate-pulse"
          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
      }`}
      title="Synthèse vocale"
      aria-label={isPlaying ? "Arrêter la lecture audio" : `Écouter : ${label}`}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[11px]">Arrêter</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="text-[11px]">{label}</span>
        </>
      )}
    </button>
  );
}
