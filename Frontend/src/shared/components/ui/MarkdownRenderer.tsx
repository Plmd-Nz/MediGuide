"use client";

import React, { useMemo } from "react";
import { Marked } from "marked";
import hljs from "highlight.js";
import { sanitizeHtml } from "@/shared/utils/sanitize";
import "highlight.js/styles/github-dark.css";

const markedInstance = new Marked({
  gfm: true,
  breaks: true,
});

markedInstance.use({
  renderer: {
    code({ text, lang }) {
      const language = (lang || "plaintext").trim().toLowerCase();
      let highlighted = "";
      if (language && hljs.getLanguage(language)) {
        try {
          highlighted = hljs.highlight(text, { language }).value;
        } catch {
          highlighted = text;
        }
      } else {
        try {
          highlighted = hljs.highlightAuto(text).value;
        } catch {
          highlighted = text;
        }
      }

      return `
        <div class="my-3 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-sm">
          <div class="flex items-center justify-between px-3.5 py-1.5 border-b border-zinc-800 bg-zinc-950 text-[11px] font-mono text-zinc-400">
            <span>${language || "code"}</span>
          </div>
          <pre class="p-3.5 text-xs font-mono overflow-x-auto text-zinc-200 bg-zinc-900 leading-relaxed hljs"><code>${highlighted}</code></pre>
        </div>
      `;
    },
    table({ header, rows }) {
      return `
        <div class="my-3 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <table class="w-full text-left text-xs text-zinc-800 dark:text-zinc-300">
            <thead class="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 font-mono">
              ${header}
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950/60">
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    },
    link({ href, title, text }) {
      return `<a href="${href}" ${title ? `title="${title}"` : ""} target="_blank" rel="noopener noreferrer" class="text-cyan-600 dark:text-cyan-400 hover:underline font-medium">${text}</a>`;
    },
  },
});

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const sanitizedHtml = useMemo(() => {
    const rawHtml = markedInstance.parse(content || "") as string;
    return sanitizeHtml(rawHtml);
  }, [content]);

  return (
    <div
      className="max-w-none text-[14px] leading-relaxed text-zinc-800 dark:text-zinc-200 space-y-2.5 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_strong]:text-zinc-900 dark:[&_strong]:text-white [&_strong]:font-semibold [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-300 dark:[&_blockquote]:border-zinc-700 [&_blockquote]:pl-3.5 [&_blockquote]:text-zinc-500 [&_blockquote]:italic"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
