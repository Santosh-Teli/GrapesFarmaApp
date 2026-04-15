// store/authStore.ts — Supabase-backed auth store
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/supabase/types";

export type AppUser = Omit<ProfileRow, never>;

interface AuthState {
  user: AppUser | null;
  token: string | null;
  viewingUserId: string | null;
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

const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      viewingUserId: null,
      isAuthenticated: false,
      isLoading: true,
      lastActive: null,

      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          viewingUserId: null,
          lastActive: Date.now(),
        });
      },

      logout: async () => {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          viewingUserId: null,
          lastActive: null,
        });
      },

      updateActivity: () => {
        if (get().isAuthenticated) {
          set({ lastActive: Date.now() });
        }
      },

      setViewingUser: (userId) => set({ viewingUserId: userId }),
      clearViewingUser: () => set({ viewingUserId: null }),

      initialize: () => {
        const { lastActive, isAuthenticated, logout } = get();

        // Session timeout check
        if (
          isAuthenticated &&
          lastActive &&
          Date.now() - lastActive > SESSION_TIMEOUT
        ) {
          logout();
          set({ isLoading: false });
          return;
        }

        // Listen for Supabase auth state changes
        if (typeof window !== "undefined") {
          const supabase = getSupabaseClient();

          supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
              // Fetch profile
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

              if (profile) {
                set({
                  user: profile,
                  token: session.access_token,
                  isAuthenticated: true,
                  lastActive: Date.now(),
                  isLoading: false,
                });
              } else {
                set({ isLoading: false });
              }
            } else {
              set({ isLoading: false });
            }
          });
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        viewingUserId: state.viewingUserId,
        lastActive: state.lastActive,
      }),
      onRehydrateStorage: () => (state) => {
        state?.initialize();
      },
    }
  )
);
