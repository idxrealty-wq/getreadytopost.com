"use client";

import { useEffect } from "react";
import { signInWithGoogleRedirect } from "@/lib/auth";

export default function GoogleAuthRedirectPage() {
  useEffect(() => {
    // Start redirect immediately
    signInWithGoogleRedirect();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] px-6">
      <div className="max-w-md w-full bg-white/10 border border-white/20 rounded-2xl p-6 text-center backdrop-blur-sm">
        <h1 className="text-white text-2xl font-bold mb-2">Signing you in…</h1>
        <p className="text-gray-200 text-sm">
          If nothing happens, please allow popups/redirects and try again.
        </p>
      </div>
    </main>
  );
}
