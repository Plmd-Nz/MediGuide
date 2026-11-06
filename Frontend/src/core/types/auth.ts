export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  photoURL?: string;
}

export type AuthMode = "login" | "register";

export interface MockGoogleAccount {
  name: string;
  email: string;
  initials: string;
  role: string;
}
