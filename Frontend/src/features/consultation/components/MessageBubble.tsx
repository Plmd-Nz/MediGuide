"use client";

import React from "react";
import { ChatMessage } from "@/core/types/consultation";
import { Hospital } from "@/core/types/hospital";
import { MarkdownRenderer } from "@/shared/components/ui/MarkdownRenderer";
import { AudioPlayerButton } from "@/shared/components/ui/AudioPlayerButton";
import { HospitalCard } from "./HospitalCard";
import { Bot, Clock } from "lucide-react";
import { getUrgencyBadgeConfig } from "@/shared/utils/formatters";

interface MessageBubbleProps {
  message: ChatMessage;
  userLat?: number;
  userLon?: number;
  cityName?: string;
}

function formatMessageTime(ts: string | Date): string {
  if (ts instanceof Date) {
    return ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return typeof ts === "string" ? ts : "";
}

export function MessageBubble({ message, userLat, userLon, cityName }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-3xl rounded-tr-sm px-5 py-3.5 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] opacity-70 font-mono">
            <Clock className="w-3 h-3" />
            <span>{formatMessageTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  const urgencyConfig = message.orientation?.urgence 
    ? getUrgencyBadgeConfig(message.orientation.urgence)
    : null;

  return (
    <div className="flex gap-3 sm:gap-4 mb-8">
      {/* Avatar MediGuide */}
      <div className="w-9 h-9 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm mt-0.5">
        <Bot className="w-4 h-4" />
      </div>

      {/* Bubble Content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Header : MediGuide IA & Urgency & Voice button */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
              MediGuide IA
            </span>
            {urgencyConfig && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${urgencyConfig.colorClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${urgencyConfig.dotClass} animate-pulse`} />
                {urgencyConfig.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {message.orientation?.resume_audio && (
              <AudioPlayerButton 
                text={message.orientation.resume_audio} 
                label="Écouter le résumé"
              />
            )}
            <span className="text-[10px] text-zinc-400 font-mono">
              {formatMessageTime(message.timestamp)}
            </span>
          </div>
        </div>

        {/* Message Markdown Body */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-subtle text-sm text-zinc-800 dark:text-zinc-200">
          <MarkdownRenderer content={message.content} />
        </div>

        {/* Recommandations Hospitalières */}
        {message.orientation?.recommandations && message.orientation.recommandations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-1">
              <span>Structures sanitaires recommandées ({message.orientation.recommandations.length})</span>
              <span>Classées par adéquation clinique</span>
            </div>

            <div className="space-y-3">
              {message.orientation.recommandations.map((hospital: Hospital, index: number) => (
                <HospitalCard
                  key={hospital.id || hospital.structure || index}
                  hospital={hospital}
                  isTopChoice={index === 0}
                  userLat={userLat}
                  userLon={userLon}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
