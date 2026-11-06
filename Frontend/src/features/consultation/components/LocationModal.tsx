"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { City } from "@/core/types/hospital";
import { MapPin, Navigation, X, Check, Search, AlertCircle } from "lucide-react";
import { modalBackdropVariants, modalContentVariants } from "@/shared/animations/variants";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLat: number;
  currentLon: number;
  currentCityName?: string;
  onSelectLocation: (lat: number, lon: number, cityName: string) => void;
  cities: City[];
}

export function LocationModal({
  isOpen,
  onClose,
  currentLat,
  currentLon,
  currentCityName,
  onSelectLocation,
  cities,
}: LocationModalProps) {
  const [search, setSearch] = useState("");
  const [manualLat, setManualLat] = useState(currentLat.toString());
  const [manualLon, setManualLon] = useState(currentLon.toString());
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSearching = search.trim().length > 0;
  const filteredCities = cities.filter(
    (c) =>
      c.ville.toLowerCase().includes(search.toLowerCase()) ||
      c.province.toLowerCase().includes(search.toLowerCase())
  );
  // Afficher une dizaine par défaut, ou tous les résultats de recherche
  const displayedCities = isSearching ? filteredCities : filteredCities.slice(0, 10);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        onSelectLocation(lat, lon, "Position GPS");
        onClose();
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(`Impossible d'obtenir la position (${err.message}). Veuillez sélectionner une ville.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleApplyManual = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon)) {
      setGpsError("Coordonnées GPS invalides.");
      return;
    }
    if (lat < -15 || lat > 6 || lon < 11 || lon > 32) {
      setGpsError("Ces coordonnées se situent en dehors du territoire de la RDC.");
      return;
    }
    onSelectLocation(lat, lon, `Coordonnées (${lat.toFixed(2)}, ${lon.toFixed(2)})`);
    onClose();
  };

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
          className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">Position du patient</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">Pour le filtrage spatial et le calcul d&apos;adéquation</p>
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
          <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Bouton GPS Direct */}
            <div>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={gpsLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold text-xs transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
              >
                <Navigation className={`w-4 h-4 ${gpsLoading ? "animate-spin" : ""}`} />
                <span>{gpsLoading ? "Recherche satellite en cours..." : "Détecter automatiquement ma position GPS"}</span>
              </button>
              {gpsError && (
                <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{gpsError}</span>
                </div>
              )}
            </div>

            {/* Recherche et Liste des Villes RDC */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Villes et territoires de la RDC
                </label>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                  {isSearching ? `${filteredCities.length} résultat(s)` : "10 principales affichées"}
                </span>
              </div>

              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher une ville ou province (ex: Kinshasa, Goma, Matadi...)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Liste verticale élégante */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-64 overflow-y-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950/40">
                {displayedCities.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-400">
                    Aucune ville trouvée pour &quot;{search}&quot;.
                  </div>
                ) : (
                  displayedCities.map((c) => {
                    const isSelected = currentCityName?.toLowerCase().includes(c.ville.toLowerCase());
                    return (
                      <button
                        key={`${c.ville}-${c.province}`}
                        type="button"
                        onClick={() => {
                          onSelectLocation(c.lat, c.lon, `${c.ville} (${c.province})`);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-medium"
                            : "hover:bg-zinc-100/70 dark:hover:bg-zinc-850/60 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-emerald-500" : "text-zinc-400"}`} />
                          <div className="truncate">
                            <span className="text-xs font-semibold">{c.ville}</span>
                            <span className="ml-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                              {c.province}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                            {c.lat.toFixed(2)}, {c.lon.toFixed(2)}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              <p className="mt-2 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 text-center">
                50 villes et territoires de santé répertoriés en RDC
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
