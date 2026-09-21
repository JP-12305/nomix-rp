"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        if (typeof window === "undefined") return;

        // 1. Check for OAuth Error params in URL
        const searchParams = new URLSearchParams(window.location.search);
        const urlError = searchParams.get("error");
        const urlErrorDesc = searchParams.get("error_description");
        const code = searchParams.get("code");

        if (urlError) {
          console.error("[AUTH CALLBACK] OAuth Error from provider:", urlError, urlErrorDesc);
          if (isMounted) setErrorMsg(urlErrorDesc || urlError || "Discord authentication was rejected.");
          return;
        }

        // 2. If code is present in query params, explicitly exchange it for a session (PKCE)
        if (code) {
          console.log("[AUTH CALLBACK] Exchanging authorization code for session...");
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn("[AUTH CALLBACK] exchangeCodeForSession warning:", exchangeError.message);
            // Check if session was already auto-established by detectSessionInUrl
            const { data: currentSess } = await supabase.auth.getSession();
            if (currentSess?.session) {
              if (isMounted) router.replace("/apply");
              return;
            }
          } else if (data?.session) {
            console.log("[AUTH CALLBACK] ✅ Session successfully established from code!");
            if (isMounted) router.replace("/apply");
            return;
          }
        }

        // 3. Check for existing active session in client storage
        const { data: sessData, error: sessErr } = await supabase.auth.getSession();
        if (sessData?.session) {
          console.log("[AUTH CALLBACK] ✅ Existing session found, redirecting to /apply");
          if (isMounted) router.replace("/apply");
          return;
        }

        // 4. Listen for auth state change (e.g. SIGNED_IN or INITIAL_SESSION)
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("[AUTH CALLBACK] Auth state change event:", event, Boolean(session));
          if (session && isMounted) {
            authListener.subscription.unsubscribe();
            router.replace("/apply");
          }
        });

        // 5. Fallback safety timer (10 seconds) with explicit button instead of premature force-redirect
        const timer = setTimeout(() => {
          if (isMounted) {
            supabase.auth.getSession().then(({ data: finalData }) => {
              if (finalData?.session) {
                router.replace("/apply");
              } else {
                setErrorMsg("Authentication session could not be confirmed. Please try logging in again.");
              }
            });
          }
        }, 8000);

        return () => {
          clearTimeout(timer);
          authListener?.subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error("[AUTH CALLBACK ERROR]", err);
        if (isMounted) setErrorMsg(err?.message || "Authentication process failed.");
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#06080C] text-white px-4">
      <div className="glass-panel p-8 rounded-2xl border border-cyan-500/30 max-w-md w-full text-center space-y-4 shadow-[0_0_50px_rgba(0,240,255,0.15)]">
        {errorMsg ? (
          <div className="space-y-3">
            <div className="text-red-400 font-bold text-lg">Authentication Failed</div>
            <p className="text-xs text-slate-400">{errorMsg}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => router.replace("/")}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all"
              >
                Back to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg transition-all"
              >
                Retry
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
