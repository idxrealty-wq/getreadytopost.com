"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

const BG_URL =
  "https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/e2af6091-9b63-4698-8f57-f02cfe21cfc7/image.png?w=1200&h=896";

type TierKey = "monthly" | "semiannual" | "annual" | "elite" | "credits" | "unknown";

function normalizeTier(raw: string | null): TierKey {
  if (!raw) return "unknown";
  const v = String(raw).toLowerCase().trim();
  if (v === "monthly") return "monthly";
  if (v === "semiannual" || v === "semi-annual" || v === "6month" || v === "6-month") return "semiannual";
  if (v === "annual") return "annual";
  if (v === "elite") return "elite";
  if (v === "credits") return "credits";
  return "unknown";
}

function tierLabel(tier: TierKey) {
  if (tier === "monthly") return "Monthly Membership";
  if (tier === "semiannual") return "Semi-Annual Membership";
  if (tier === "annual") return "Annual Membership";
  if (tier === "elite") return "Elite Membership";
  if (tier === "credits") return "Credits Purchase";
  return "Purchase";
}

function PurchaseSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();

  const tier = useMemo(() => normalizeTier(searchParams.get("tier")), [searchParams]);

  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [creditsError, setCreditsError] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!user?.uid) return;

      setLoadingCredits(true);
      setCreditsError("");

      try {
        const res = await fetch(`/api/credits/balance?userId=${user.uid}`, { method: "GET" });
        const data = await res.json();

        if (!res.ok) {
          setCreditsError(data?.error || "Could not load your credit balance.");
          setCredits(null);
          return;
        }

        const bal = typeof data?.balance === "number" ? data.balance : null;
        setCredits(bal);
      } catch (e) {
        setCreditsError(String(e));
        setCredits(null);
      } finally {
        setLoadingCredits(false);
      }
    };

    run();
  }, [user?.uid]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl font-bold text-white mb-4">Payment Complete</h1>
          <p className="text-gray-300 mb-6">
            Your payment was received. Please sign in to see your updated credits and access your tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/signin")}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-6 rounded-lg border border-white/15"
            >
              Go Home
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            If you don't see your credits within 2 minutes, refresh this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative pt-28 pb-16 px-6">
      <div className="fixed inset-0 z-0">
        <img src={BG_URL} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0b1220]/80" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="bg-slate-900/55 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-4xl font-bold text-white mb-3">Payment Received</h1>
            <p className="text-gray-300 text-lg mb-2">{tierLabel(tier)}</p>
            <p className="text-gray-400 mb-8">
              Your account will update automatically. If you don't see the new balance right away, refresh in a minute.
            </p>
          </div>

          <div className="bg-black/25 border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-gray-200">Current Credits</span>
              <span className="text-yellow-400 font-bold text-2xl">
                {loadingCredits ? "Loading..." : credits === null ? "—" : credits}
              </span>
            </div>
            {creditsError ? (
              <p className="text-red-200 text-sm mt-3">
                {creditsError}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/workspace"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-lg text-center transition"
            >
              Go to Workspace
            </Link>
            <Link
              href="/agent-vault"
              className="w-full bg-white/10 hover:bg-white/15 text-white font-bold py-4 rounded-lg text-center border border-white/15 transition"
            >
              Go to Vault
            </Link>
          </div>

          <div className="text-center mt-8">
            <Link href="/our-deals" className="text-gray-300 hover:text-white underline">
              Back to Deals
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>}>
      <PurchaseSuccessContent />
    </Suspense>
  );
}
