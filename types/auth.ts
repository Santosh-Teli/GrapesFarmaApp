// types/auth.ts
// Auth state types for the app — now uses Supabase ProfileRow

import type { ProfileRow } from "@/lib/supabase/types";

export type AppUser = ProfileRow;

export interface AuthState {
  user: AppUser | null;
  token: string | null;
  viewingUserId: string | null; // For Admin impersonation
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActive: number | null;
  login: (user: AppUser, token: string) => void;
  logout: () => void;
  initialize: () => void;
  updateActivity: () => void;
  setViewingUser: (userId: string | null) => void;
  clearViewingUser: () => void;
}
