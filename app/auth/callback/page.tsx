"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Loader2, AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loginWithDiscord } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      try {
        if (typeof window === "undefined") return;

        // 1. Parse Hash Fragment (Implicit OAuth flow: #access_token=...&refresh_token=...)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const hashError = hashParams.get("error_description") || hashParams.get("error");
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (hashError) {
            console.error("[AUTH CALLBACK] Hash error:", hashError);
            if (isMounted) setErrorMsg(decodeURIComponent(hashError));
            return;
          }

          if (accessToken && refreshToken) {
            console.log("[AUTH CALLBACK] Found tokens in hash fragment, setting session...");
            const { data, error: setSessionErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!setSessionErr && data.session) {
              console.log("[AUTH CALLBACK] ✅ Hash session established successfully!");
              if (isMounted) router.replace("/apply");
              return;
            }
          }
        }

        // 2. Parse Query Search Parameters (PKCE OAuth flow: ?code=... or ?error=...)
        const searchParams = new URLSearchParams(window.location.search);
        const urlError = searchParams.get("error");
        const urlErrorDesc = searchParams.get("error_description");
        const code = searchParams.get("code");

        if (urlError) {
          console.error("[AUTH CALLBACK] URL error parameter:", urlError, urlErrorDesc);
          if (isMounted) setErrorMsg(urlErrorDesc || urlError || "Discord authorization was not completed.");
          return;
        }

        if (code) {
          console.log("[AUTH CALLBACK] Exchanging authorization code for session...");
          const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeErr && data?.session) {
            console.log("[AUTH CALLBACK] ✅ Code exchanged for session successfully!");
            if (isMounted) router.replace("/apply");
            return;
          } else if (exchangeErr) {
            console.warn("[AUTH CALLBACK] Code exchange warning:", exchangeErr.message);
          }
        }

        // 3. Check existing active session from client storage
        const { data: currentSess } = await supabase.auth.getSession();
        if (currentSess?.session) {
          console.log("[AUTH CALLBACK] ✅ Active session verified, routing to /apply");
          if (isMounted) router.replace("/apply");
          return;
        }

        // 4. Listen for auth state change
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("[AUTH CALLBACK] Auth state changed:", event, Boolean(session));
          if (session && isMounted) {
            authListener.subscription.unsubscribe();
            router.replace("/apply");
          }
        });

        // 5. Safety fallback timer (10 seconds)
        const timer = setTimeout(async () => {
          if (isMounted) {
            const { data: finalSess } = await supabase.auth.getSession();
            if (finalSess?.session) {
              router.replace("/apply");
            } else {
              setErrorMsg("Discord session could not be established. Please click the button below to sign in again.");
            }
          }
        }, 10000);

        return () => {
          clearTimeout(timer);
          authListener?.subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error("[AUTH CALLBACK EXCEPTION]", err);
        if (isMounted) setErrorMsg(err?.message || "Unexpected authentication error occurred.");
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#06080C] text-white px-4">
      <div className="glass-panel p-8 rounded-3xl border border-cyan-500/30 max-w-md w-full text-center space-y-5 shadow-[0_0_50px_rgba(0,240,255,0.15)]">
        {errorMsg ? (
          <div className="space-y-4">
            <div className="p-3 w-fit rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white font-heading tracking-wide">
              Authentication Notice
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">{errorMsg}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => router.replace("/")}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Back to Home
              </button>
              <button
                onClick={() => loginWithDiscord()}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(88,101,242,0.4)]"
              >
                Sign In with Discord
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <h2 className="text-base font-bold text-white tracking-wider font-heading">
              AUTHENTICATING WITH DISCORD
            </h2>
            <p className="text-xs text-slate-400">
              Synchronizing your Discord credentials and permissions...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
