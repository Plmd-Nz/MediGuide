"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, ArrowUp, X, RotateCcw, AlertCircle } from "lucide-react";
import { NATIONAL_LANGUAGES } from "@/core/constants/languages";
import { modalBackdropVariants, modalContentVariants } from "@/shared/animations/variants";

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendAudio: (audioBlob: Blob, mimeType: string) => void;
  isLoading?: boolean;
}

export function VoiceRecorderModal({
  isOpen,
  onClose,
  onSendAudio,
  isLoading = false,
}: VoiceRecorderModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState(NATIONAL_LANGUAGES[0]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  const handleReset = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordDuration(0);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setErrorMsg(null);
  };

  const startRecording = async () => {
    setErrorMsg(null);
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "audio/webm";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      setErrorMsg("Accès au microphone refusé ou non disponible sur votre appareil.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const handleSend = () => {
    if (!audioBlob) return;
    const mime = audioBlob.type || "audio/webm";
    onSendAudio(audioBlob, mime);
    onClose();
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  Triage Vocal Multimodal
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    Voice-First IA
                  </span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
                  Lingala, Swahili, Kikongo, Tshiluba ou Français
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            {/* Langues */}
            <div>
              <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Langue parlée
              </div>
              <div className="flex flex-wrap gap-1.5">
                {NATIONAL_LANGUAGES.map((l) => {
                  const isSelected = selectedLang.code === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setSelectedLang(l)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-sm"
                          : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                      }`}
                    >
                      {l.nom}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="text-zinc-400 dark:text-zinc-500 font-mono">Exemple : </span>
                <span className="text-zinc-800 dark:text-zinc-300 italic">&ldquo;{selectedLang.exemple}&rdquo;</span>
              </div>
            </div>

            {/* Zone d'enregistrement */}
            <div className="flex flex-col items-center justify-center py-6 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-750 space-y-4">
              {/* Visual Equalizer Bars */}
              <div className="flex items-center justify-center gap-1.5 h-12">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isRecording
                        ? "bg-emerald-500 animate-pulse"
                        : audioBlob
                        ? "bg-zinc-400 dark:bg-zinc-500 h-4"
                        : "bg-zinc-300 dark:bg-zinc-700 h-2"
                    }`}
                    style={{
                      height: isRecording ? `${Math.max(8, ((i % 5) + 1) * 7)}px` : undefined,
                    }}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-2xl font-mono font-bold text-zinc-950 dark:text-white tracking-wider">
                {formatSeconds(recordDuration)}
              </div>

              {/* Record / Stop Button */}
              {!isRecording && !audioBlob && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Commencer l'enregistrement"
                >
                  <Mic className="w-6 h-6" />
                </button>
              )}

              {isRecording && (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-md transition-transform animate-pulse cursor-pointer"
                  aria-label="Arrêter l'enregistrement"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
              )}

              {audioBlob && !isRecording && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Recommencer
                  </button>

                  {audioUrl && (
                    <audio controls src={audioUrl} className="h-8 max-w-[180px] rounded" />
                  )}
                </div>
              )}

              <p className="text-xs text-zinc-500 font-light">
                {isRecording
                  ? "Enregistrement en cours..."
                  : audioBlob
                  ? "Message audio prêt pour analyse"
                  : "Cliquez sur le micro pour enregistrer votre message"}
              </p>
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!audioBlob || isLoading}
                className="px-4 py-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                <ArrowUp className="w-4 h-4" />
                <span>{isLoading ? "Traitement..." : "Analyser & Orienter"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
