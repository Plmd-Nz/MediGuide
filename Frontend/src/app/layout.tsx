import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediGuide AI — L'Intelligence Artificielle d'Orientation Médicale",
  description:
    "Système d'orientation médicale géolocalisé en République Démocratique du Congo. Triage clinique en langage naturel et 4 langues nationales.",
  icons: {
    icon: [
      { url: "/logo-square.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo-square.svg",
    apple: "/logo-square.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white dark:bg-obsidian text-obsidian dark:text-alabaster font-sans selection:bg-emerald-500 selection:text-white ambient-canvas min-h-screen">
        {children}
      </body>
    </html>
  );
}
