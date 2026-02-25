"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

const gradingCategories = [
  { icon: "🎣", title: "Hook", description: "Does your opening line stop a buyer mid-scroll? The first sentence is everything.", color: "bg-blue-500/20 border-blue-400/40" },
  { icon: "🏠", title: "Features", description: "Are your key property details highlighted in a way that excites — not just informs?", color: "bg-green-500/20 border-green-400/40" },
  { icon: "🌅", title: "Lifestyle", description: "Does your description paint a picture of what it feels like to actually live there?", color: "bg-purple-500/20 border-purple-400/40" },
  { icon: "⚖️", title: "Compliance", description: "Is your language Fair Housing compliant and MLS-safe? One wrong word can cost you.", color: "bg-red-500/20 border-red-400/40" },
  { icon: "📖", title: "Flow", description: "Is it easy to read? Short sentences, active voice, no walls of text.", color: "bg-amber-500/20 border-amber-400/40" },
  { icon: "📣", title: "Call to Action", description: "Does it drive the buyer to schedule a showing — or just describe a house?", color: "bg-pink-500/20 border-pink-400/40" },
];

export default function RateMyListingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [email, setEmail] = useState("");
  const [listing, setListing] = useState("");
  const [loading, setLoading] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [error, setError] = useState("");

  const wordCount = listing.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (user) fetchCreditBalance();
  }, [user?.uid]);

  const fetchCreditBalance = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/credits/balance?userId=${user.uid}`);
      const data = await res.json();
      setCreditBalance(data.balance || 0);
    } catch (err) {
      console.error("Failed to fetch credit balance:", err);
      setCreditBalance(0);
    }
  };

  const deductAndGoToResults = async (submissionId: string) => {
    if (!user) return;

    const res = await fetch("/api/credits/deduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.uid, listingId: submissionId }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error || "Failed to deduct credit.");
    }

    setCreditBalance(data.newBalance ?? 0);
    router.push(`/results?id=${submissionId}&source=credit`);
  };

  const handlePrimaryAction = async () => {
    if (!user) {
      setError("Please sign in to submit a listing.");
      return;
    }

    if (!email || !listing) {
      setError("Please fill in email and listing description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const docRef = await addDoc(collection(db, "submissions"), {
        userId: user.uid,
        email,
        listingText: listing,
        wordCount,
        status: "pending_payment",
        createdAt: new Date().toISOString(),
      });

      if ((creditBalance ?? 0) > 0) {
        await deductAndGoToResults(docRef.id);
        return;
      }

      router.push("/checkout?pkg=single");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Rate My Listing</h1>
          <p className="text-gray-300 text-lg">Get instant AI feedback on your real estate listing</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
          <div className="mb-8">
            <label className="block text-white font-bold mb-3">Your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#c9a227]"
            />
          </div>

          <div className="mb-8">
            <label className="block text-white font-bold mb-3">Your Listing Description</label>
            <textarea
              value={listing}
              onChange={(e) => setListing(e.target.value)}
              placeholder="Paste your MLS listing description here..."
              rows={8}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#c9a227] resize-none"
            />
            <p className="text-gray-400 text-sm mt-2">{wordCount} words</p>
          </div>

          {error && <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 mb-6 text-red-300">{error}</div>}

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <button
              onClick={handlePrimaryAction}
              disabled={loading || !user}
              className="flex-1 bg-[#c9a227] hover:bg-[#b8911f] disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-xl"
            >
              {loading ? "Submitting..." : creditBalance && creditBalance > 0 ? `Use 1 Credit (${creditBalance} left)` : "Buy Credits & Analyze"}
            </button>
            <Link href="/" className="flex-1 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition text-center">
              Back Home
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gradingCategories.map((cat, i) => (
              <div key={i} className={`${cat.color} border rounded-lg p-4`}>
                <div className="text-2xl mb-2">{cat.icon}</div>
                <h3 className="text-white font-bold mb-1">{cat.title}</h3>
                <p className="text-gray-300 text-sm">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
