"use client";

import React, { useEffect, useState } from "react";

const PHRASES = [
  "sachez si c'est urgent.",
  "trouvez la bonne structure de santé.",
  "partez sans perdre de temps.",
];

export function RotatingHeadline() {
  const [index, setIndex] = useState(0);
  const [animClass, setAnimClass] = useState<"in" | "out">("in");

  useEffect(() => {
    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isReduced) {
      return;
    }

    const interval = setInterval(() => {
      setAnimClass("out");
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % PHRASES.length);
        setAnimClass("in");
      }, 450);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-[68px] tracking-[-0.035em] text-obsidian dark:text-white leading-[1.08] max-w-4xl mx-auto">
      <span className="l1">Décrivez vos symptômes,</span>
      <span
        className="l2 font-serif italic font-normal text-emerald-600 dark:text-emerald-400"
        id="rot"
        aria-live="off"
      >
        <b className={animClass}>{PHRASES[index]}</b>
      </span>
    </h1>
  );
}
