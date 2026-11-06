import { Variants, Transition } from "framer-motion";

export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

export const softEase: Transition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
};

// Fondu simple
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: softEase },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Entrée glissée vers le haut avec respiration
export const slideUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: softEase },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

// Conteneur avec décalage séquentiel des enfants
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Modale (Fond & Contenu)
export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0, transition: smoothSpring },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.15 } },
};

// Déploiement accordéon (pour les détails de scores)
export const accordionVariants: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto", transition: softEase },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

// Transition de vue globale (Page switch)
export const viewSwitchVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2 } },
};
