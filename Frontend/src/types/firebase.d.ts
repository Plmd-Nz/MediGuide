declare module "firebase/app" {
  export interface FirebaseApp {
    name: string;
    options: Record<string, unknown>;
  }
  export function initializeApp(options: Record<string, unknown>): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(): FirebaseApp;
}

declare module "firebase/auth" {
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }
  export interface UserCredential {
    user: User;
  }
  export class GoogleAuthProvider {
    setCustomParameters(params: Record<string, string>): void;
  }
  export function getAuth(app?: any): any;
  export function signInWithPopup(auth: any, provider: any): Promise<UserCredential>;
  export function signInWithEmailAndPassword(auth: any, email: string, pass: string): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(auth: any, email: string, pass: string): Promise<UserCredential>;
  export function updateProfile(user: any, profile: { displayName?: string; photoURL?: string }): Promise<void>;
  export function signOut(auth: any): Promise<void>;
  export function onAuthStateChanged(auth: any, callback: (user: User | null) => void): () => void;
}
