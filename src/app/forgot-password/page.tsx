"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Password reset link sent! Check your email (and spam folder).");
      setEmail("");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with that email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err?.message || "Failed to send reset link. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] px-6">
      <div className="max-w-md mx-auto bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
        <h1 className="text-white text-3xl font-bold mb-2">Reset Password</h1>
        <p className="text-gray-200 text-sm mb-6">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {message && (
          <div className="mb-4 rounded-lg bg-green-500/20 border border-green-400/40 p-3 text-sm text-green-100">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/40 p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full rounded-lg bg-[#c9a227] hover:bg-[#b8911f] text-white font-bold py-2 transition disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>

          <div className="flex items-center justify-between pt-4 text-sm">
            <Link href="/signin" className="text-gray-200 hover:text-white underline">
              Back to Sign In
            </Link>
            <Link href="/signup" className="text-gray-200 hover:text-white underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
