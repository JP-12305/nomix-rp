"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithDiscord: () => Promise<void>;
  logout: () => Promise<void>;
  isStaff: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    const loadProfile = async (sessionUser: any) => {
      try {
        const discordId = sessionUser.user_metadata?.provider_id || sessionUser.user_metadata?.sub || sessionUser.id;
        const username = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.email?.split("@")[0] || "User";
        const displayName = sessionUser.user_metadata?.custom_claims?.global_name || sessionUser.user_metadata?.full_name || username;
        const avatarUrl = sessionUser.user_metadata?.avatar_url;

        // Fetch existing profile to get their real role (staff/admin/applicant)
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .single();

        if (existingProfile) {
          setUser({
            id: existingProfile.id,
            discord_id: existingProfile.discord_id || discordId,
            username: existingProfile.username || username,
            display_name: existingProfile.display_name || displayName,
            avatar_url: existingProfile.avatar_url || avatarUrl,
            role: existingProfile.role || "applicant",
            created_at: existingProfile.created_at,
            updated_at: existingProfile.updated_at,
          });
        } else {
          // Upsert new profile record with default role 'applicant'
          const newProfile: UserProfile = {
            id: sessionUser.id,
            discord_id: discordId,
            username,
            display_name: displayName,
            avatar_url: avatarUrl,
            role: "applicant",
            created_at: sessionUser.created_at,
            updated_at: sessionUser.created_at,
          };
          await supabase.from("profiles").upsert({
            id: sessionUser.id,
            discord_id: discordId,
            username,
            display_name: displayName,
            avatar_url: avatarUrl,
            role: "applicant",
          });
          setUser(newProfile);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithDiscord = async () => {
    try {
      if (!isSupabaseConfigured()) {
        console.error("Supabase is not configured.");
        alert("Authentication configuration is missing. Please check your Supabase environment variables.");
        return;
      }

      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log("Initiating Discord OAuth with redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: redirectUrl,
          scopes: "identify email",
        },
      });

      if (error) {
        console.error("Supabase Discord OAuth error:", error);
        alert(`Discord Login Error: ${error.message}`);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("Unexpected error during Discord login:", err);
      alert(`Unexpected login error: ${err?.message || err}`);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithDiscord,
        logout,
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
