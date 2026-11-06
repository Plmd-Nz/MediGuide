"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProfile, AuthMode } from "@/core/types";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut, 
  onAuthStateChanged,
  User
} from "@/infrastructure/firebase/firebaseClient";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Écouter les changements d'état Firebase Auth
  useEffect(() => {
    // Vérifier d'abord le cache local pour un rendu immédiat
    try {
      const savedUser = localStorage.getItem("mediguide_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {}

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const displayName = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Patient";
        const initials = displayName.substring(0, 2).toUpperCase();
        const profile: UserProfile = {
          name: displayName,
          email: firebaseUser.email || "",
          initials,
          photoURL: firebaseUser.photoURL || undefined,
        };
        setUser(profile);
        try {
          localStorage.setItem("mediguide_user", JSON.stringify(profile));
        } catch {}
      } else {
        // Ne supprimer que si l'utilisateur s'est déconnecté explicitement
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const displayName = fbUser.displayName || fbUser.email?.split("@")[0] || "Patient";
      const initials = displayName.substring(0, 2).toUpperCase();
      const profile: UserProfile = {
        name: displayName,
        email: fbUser.email || "",
        initials,
        photoURL: fbUser.photoURL || undefined,
      };
      setUser(profile);
      localStorage.setItem("mediguide_user", JSON.stringify(profile));
      return profile;
    } catch (err: unknown) {
      console.warn("Firebase Google Auth popup error, fallback to guest:", err);
      // Si la popup est fermée ou en cas de restriction de domaine localhost
      const errorMsg = err instanceof Error ? err.message : "Erreur de connexion Google";
      setAuthError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = result.user;
      const displayName = fbUser.displayName || fbUser.email?.split("@")[0] || "Patient";
      const initials = displayName.substring(0, 2).toUpperCase();
      const profile: UserProfile = {
        name: displayName,
        email: fbUser.email || "",
        initials,
      };
      setUser(profile);
      localStorage.setItem("mediguide_user", JSON.stringify(profile));
      return profile;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Identifiants invalides";
      setAuthError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerWithEmail = useCallback(async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = result.user;
      if (name.trim()) {
        await updateProfile(fbUser, { displayName: name.trim() });
      }
      const displayName = name.trim() || fbUser.email?.split("@")[0] || "Patient";
      const initials = displayName.substring(0, 2).toUpperCase();
      const profile: UserProfile = {
        name: displayName,
        email: fbUser.email || "",
        initials,
      };
      setUser(profile);
      localStorage.setItem("mediguide_user", JSON.stringify(profile));
      return profile;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Erreur lors de la création du compte";
      setAuthError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((profile: UserProfile) => {
    setUser(profile);
    try {
      localStorage.setItem("mediguide_user", JSON.stringify(profile));
    } catch {}
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    try {
      localStorage.removeItem("mediguide_user");
    } catch {}
  }, []);

  return {
    user,
    authMode,
    setAuthMode,
    isGoogleModalOpen,
    setIsGoogleModalOpen,
    isLoading,
    authError,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    login,
    logout,
  };
}
