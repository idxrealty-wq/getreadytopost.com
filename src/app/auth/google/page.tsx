"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function GoogleAuthRedirectPage() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const signIn = async () => {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        router.push('/');
      } catch (e: any) {
        console.error('[auth/google] Popup error:', e);
        // If popup blocked, fall back to redirect
        if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user') {
          const { signInWithGoogleRedirect } = await import('@/lib/auth');
          await signInWithGoogleRedirect();
        }
      }
    };

    signIn();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] px-6">
      <div className="max-w-md w-full bg-white/10 border border-white/20 rounded-2xl p-6 text-center backdrop-blur-sm">
        <h1 className="text-white text-2xl font-bold mb-2">Signing you in...</h1>
        <p className="text-gray-200 text-sm">
          A Google sign-in window should appear. If nothing happens, please allow popups and try again.
        </p>
      </div>
    </main>
  );
}
