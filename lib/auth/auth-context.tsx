"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithDiscord: () => Promise<void>;
  logout: () => Promise<void>;
  switchDevRole: (role: UserRole) => void;
  isStaff: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved local dev session first
    const savedDevUser = typeof window !== "undefined" ? localStorage.getItem("nomix_session_user") : null;
    if (savedDevUser) {
      try {
        setUser(JSON.parse(savedDevUser));
        setIsLoading(false);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            discord_id: session.user.user_metadata?.provider_id || session.user.id,
            username: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            display_name: session.user.user_metadata?.custom_claims?.global_name || session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            role: "applicant",
            created_at: session.user.created_at,
            updated_at: session.user.created_at,
          };
          setUser(profile);
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            discord_id: session.user.user_metadata?.provider_id || session.user.id,
            username: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            display_name: session.user.user_metadata?.custom_claims?.global_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            role: "applicant",
            created_at: session.user.created_at,
            updated_at: session.user.created_at,
          };
          setUser(profile);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Default to guest or preloaded demo applicant for rich UX
      const defaultUser: UserProfile = {
        id: "usr-demo-applicant",
        discord_id: "789123456789012345",
        username: "SpectreRider",
        display_name: "Spectre",
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        role: "applicant",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(defaultUser);
      setIsLoading(false);
    }
  }, []);

  const loginWithDiscord = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          scopes: "identify email guilds",
        },
      });
    } else {
      // Instant dev authentication with Discord mock
      const devProfile: UserProfile = {
        id: "00000000-0000-0000-0000-000000000001",
        discord_id: "789123456789012345",
        username: "SpectreRider",
        display_name: "Spectre",
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        role: "applicant",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(devProfile);
      localStorage.setItem("nomix_session_user", JSON.stringify(devProfile));
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem("nomix_session_user");
  };

  const switchDevRole = (role: UserRole) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      role,
      username: role === "admin" ? "NomixDirector" : role === "staff" ? "NomixStaff" : "SpectreRider",
      display_name: role === "admin" ? "Server Director" : role === "staff" ? "Staff Reviewer" : "Spectre",
    };
    setUser(updated);
    localStorage.setItem("nomix_session_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithDiscord,
        logout,
        switchDevRole,
        isStaff: user?.role === "staff" || user?.role === "admin",
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
