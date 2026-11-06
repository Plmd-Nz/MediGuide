import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        obsidian: "#09090B",
        alabaster: "#FAFAFA",
        emerald: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          950: "#022C22",
        },
      },
      boxShadow: {
        luxury: "0 24px 60px -15px rgba(9, 9, 11, 0.05), 0 0 0 1px rgba(9, 9, 11, 0.05)",
        console: "0 30px 80px -20px rgba(9, 9, 11, 0.08), 0 0 0 1px rgba(9, 9, 11, 0.07)",
        "console-active": "0 35px 90px -20px rgba(16, 185, 129, 0.14), 0 0 0 1px rgba(16, 185, 129, 0.35)",
        pill: "0 12px 32px -8px rgba(9, 9, 11, 0.06), 0 0 0 1px rgba(9, 9, 11, 0.06)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        serif: ["'Instrument Serif'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
