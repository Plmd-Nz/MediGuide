"use client";

import { useState, useEffect, useCallback } from "react";

export type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem("mediguide_theme") as Theme) || "dark";
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } catch {
      applyTheme("dark");
    } finally {
      setMounted(true);
    }
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  };

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("mediguide_theme", next);
      } catch {}
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme, isMounted: mounted };
}
