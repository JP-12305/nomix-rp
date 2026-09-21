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
        // 1. Check existing session from client
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth callback error:", error);
          if (isMounted) setErrorMsg(error.message);
          return;
        }

        if (data.session) {
          if (isMounted) router.replace("/apply");
          return;
        }

        // 2. Listen for auth state change
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (session && isMounted) {
            authListener.subscription.unsubscribe();
            router.replace("/apply");
          }
        });

        // 3. Fallback timeout to prevent permanent hanging
        const timer = setTimeout(() => {
          if (isMounted) {
            supabase.auth.getSession().then(({ data: sessData }) => {
              if (sessData?.session) {
                router.replace("/apply");
              } else {
                router.replace("/");
              }
            });
          }
        }, 3500);

        return () => {
          clearTimeout(timer);
          authListener?.subscription.unsubscribe();
        };
      } catch (err: any) {
        if (isMounted) setErrorMsg(err?.message || "Authentication failed");
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
            <button
              onClick={() => router.replace("/")}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              Back to Home
            </button>
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
