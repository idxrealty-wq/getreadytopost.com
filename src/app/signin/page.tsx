"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmail, signInWithGooglePopup } from "@/lib/auth";
import { useUser } from "@/contexts/UserContext";

export default function SignInPage() {
  const router = useRouter();
  const { user } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  const handleSignIn = async () => {
    setErr("");
    setLoading(true);
    try {
      const u: any = await signInWithEmail(email, password);
      if (!u || !u.uid) throw new Error("Sign in failed");
      router.push("/");
    } catch (e: any) {
      setErr(e?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErr("");
    setLoading(true);
    try {
      const u: any = await signInWithGooglePopup();
      if (!u || !u.uid) throw new Error("Google sign-in failed");
      router.push("/");
    } catch (e: any) {
      setErr(e?.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] px-6">
      <div className="max-w-md mx-auto bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
        <h1 className="text-white text-3xl font-bold mb-2">Sign in</h1>
        <p className="text-gray-200 text-sm mb-6">Access your Agent Vault.</p>

        {err && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/40 p-3 text-sm text-red-100">
            {err}
          </div>
        )}

        <div className="space-y-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full rounded-lg bg-[#c9a227] hover:bg-[#b8911f] text-white font-bold py-2 transition disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full rounded-lg border border-white/30 bg-white/5 hover:bg-white/10 text-white font-bold py-2 transition disabled:opacity-60"
          >
            Continue with Google
          </button>

          <div className="flex items-center justify-between pt-4 text-sm">
            <Link href="/forgot-password" className="text-gray-200 hover:text-white underline">
              Forgot password?
            </Link>
            <Link href="/signin" className="text-gray-200 hover:text-white underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
