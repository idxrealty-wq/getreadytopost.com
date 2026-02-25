"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogleRedirect, getGoogleRedirectResult } from "@/lib/auth";

export default function GoogleAuthRedirectPage() {
  const router = useRouter();
  const redirectStarted = useRef(false);
  const resultChecked = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      // First, check if we're coming back from a redirect
      if (!resultChecked.current) {
        resultChecked.current = true;
        try {
          const user = await getGoogleRedirectResult();
          if (user) {
            console.log('[auth/google] User logged in:', user.uid);
            // Redirect to home
            router.push('/');
            return;
          }
        } catch (e) {
          console.error('[auth/google] Redirect result error:', e);
        }
      }

      // If no result yet, start the redirect
      if (!redirectStarted.current) {
        redirectStarted.current = true;
        console.log('[auth/google] Starting Google redirect...');
        try {
          await signInWithGoogleRedirect();
        } catch (e) {
          console.error('[auth/google] Redirect error:', e);
        }
      }
    };

    handleAuth();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] px-6">
      <div className="max-w-md w-full bg-white/10 border border-white/20 rounded-2xl p-6 text-center backdrop-blur-sm">
        <h1 className="text-white text-2xl font-bold mb-2">Signing you in…</h1>
        <p className="text-gray-200 text-sm">
          Redirecting to Google. If nothing happens, please allow popups and try again.
        </p>
      </div>
    </main>
  );
}
