"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MapPin, Loader2 } from "lucide-react";

interface ConsultationComposerProps {
  onSendMessage: (text: string) => void;
  onOpenVoiceModal: () => void;
  onOpenLocationModal: () => void;
  isLoading: boolean;
  currentCityName?: string;
}

export function ConsultationComposer({
  onSendMessage,
  onOpenVoiceModal,
  onOpenLocationModal,
  isLoading,
  currentCityName,
}: ConsultationComposerProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-6 pt-2">
      {/* Boîte de composition principale */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-3 shadow-lg transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Décrivez les symptômes ou posez une question à MediGuide..."
          disabled={isLoading}
          className="w-full px-3 py-2 text-sm bg-transparent border-0 resize-none text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-0 leading-relaxed max-h-40 overflow-y-auto"
        />

        {/* Barre d'outils inférieure */}
        <div className="flex items-center justify-between pt-2 px-1 border-t border-zinc-100 dark:border-zinc-800/80 mt-1">
          {/* Outils secondaires : localisation */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Modifier la localisation du patient"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span className="truncate max-w-[130px] sm:max-w-[200px]">
                {currentCityName || "Position patient"}
              </span>
            </button>
          </div>

          {/* Outils d'envoi : micro & bouton envoyer */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenVoiceModal}
              disabled={isLoading}
              className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
              title="Enregistrement vocal en langues nationales"
              aria-label="Enregistrement vocal"
            >
              <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm active:scale-95"
              aria-label="Envoyer le message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mt-2">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
          MediGuide IA aide à l&apos;orientation médicale • Ne remplace pas l&apos;avis d&apos;un médecin assermenté
        </span>
      </div>
    </div>
  );
}
