"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastProps {
  message: string | null;
  type?: "success" | "error" | "info";
  onClose?: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-medium shadow-2xl border border-zinc-800/80 dark:border-zinc-200"
          role="status"
          aria-live="polite"
        >
          {type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {type === "info" && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
          
          <span className="max-w-xs">{message}</span>

          {onClose && (
            <button
              onClick={onClose}
              className="ml-1 p-0.5 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Fermer la notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
