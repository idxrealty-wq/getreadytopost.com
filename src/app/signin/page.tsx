"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/contexts/UserContext";

export default function SignInPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    router.push("/agent-vault");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/agent-vault");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    router.push("/auth/google");
  };

  return (
    <main className="pt-24 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] px-6">
      <div className="max-w-md mx-auto bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur-sm">
        <h1 className="text-white text-3xl font-bold mb-2">
          {isSignUp ? "Create Account" : "Sign In"}
        </h1>
        <p className="text-gray-200 text-sm mb-6">
          {isSignUp ? "Join GetReadyToPost today" : "Welcome back"}
        </p>
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/40 p-3 text-sm text-red-100">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#c9a227] hover:bg-[#b8911f] text-white font-bold py-2 transition disabled:opacity-60"
          >
            {loading ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>
        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="w-full rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-bold py-2 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        <div className="flex items-center justify-between pt-4 text-sm">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-200 hover:text-white underline"
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </button>
          <Link href="/forgot-password" className="text-gray-200 hover:text-white underline">
            Forgot password?
          </Link>
        </div>
      </div>
    </main>
  );
}
