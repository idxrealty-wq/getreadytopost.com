"use client";

import { useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type Props = {
  address: string;
  propertyData: any;
  nearby: any;
  listing: string;
  setListing: (v: string) => void;
  onNext: () => void;
};

export default function Tab3Listing({
  address,
  propertyData,
  nearby,
  listing,
  setListing,
  onNext,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const [authReady, setAuthReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Local editable input (original listing). We do NOT want to overwrite it with the rewrite.
  const [draftListing, setDraftListing] = useState<string>("");

  // Initialize draft once from incoming listing (if any)
  useEffect(() => {
    setDraftListing((prev) => (prev.trim().length ? prev : String(listing || "")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid || null);
      setEmail(u?.email || null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const originalCharCount = useMemo(() => draftListing.trim().length, [draftListing]);
  const canGenerate = !!address && authReady && !!email && originalCharCount >= 50;

  const generateListing = async () => {
    if (!address) return;

    setLoading(true);
    setError("");
    setAnalysis(null);
    setSubmissionId(null);

    try {
      if (!authReady) throw new Error("Auth is still loading. Try again in 1 second.");
      if (!email) throw new Error("You must be signed in (email missing).");
      if (draftListing.trim().length < 50) {
        throw new Error("Paste at least 50 characters of the original listing before generating.");
      }

      // 1) Create submission
      const createPayload = {
        address: String(address).trim(),
        propertyDetails: propertyData || {},
        nearby: nearby || null,
        listingText: String(draftListing || "").trim(),
        uid: uid || null,
        email: String(email).trim(),
      };

      const createRes = await fetch("/api/submissions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      const createJson: any = await createRes.json().catch(() => ({}));
      if (!createRes.ok) {
        throw new Error(createJson?.error || createJson?.message || "Failed to create submission");
      }

      const subId = String(createJson?.submissionId || "").trim();
      if (!subId) throw new Error("Create succeeded but no submissionId in response.");
      setSubmissionId(subId);

      // 2) Run analysis
      const analysisRes = await fetch("/api/submissions/run-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: subId }),
      });

      const analysisJson: any = await analysisRes.json().catch(() => ({}));
      if (!analysisRes.ok) {
        throw new Error(analysisJson?.error || analysisJson?.message || "Analysis failed");
      }

      // Prefer direct response (prevents Firestore race)
      const directRewrite = String(analysisJson?.rewriteText || "").trim();
      const directAnalysis = analysisJson?.analysis || null;

      if (directRewrite) {
        setListing(directRewrite);
        setAnalysis(directAnalysis);
        return;
      }

      // 3) Fallback: fetch from Firestore
      const getRes = await fetch(
        `/api/submissions/get?submissionId=${encodeURIComponent(subId)}`
      );
      const getJson: any = await getRes.json().catch(() => ({}));
      if (!getRes.ok) {
        throw new Error(getJson?.error || getJson?.message || "Failed to fetch results");
      }

      const storedAnalysis = getJson?.submission?.analysis || getJson?.analysis || null;
      const storedRewrite = String(storedAnalysis?.rewrite?.text || "").trim();

      if (!storedRewrite) throw new Error("No rewrite text returned from analysis.");

      setListing(storedRewrite);
      setAnalysis(storedAnalysis);
    } catch (err: any) {
      setError(err?.message || "Failed to generate listing. Please try again.");
      setListing("");
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const copyListing = () => {
    if (!listing) return;
    navigator.clipboard.writeText(listing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">AI Listing Builder</h2>
        <p className="text-gray-300 mb-6">
          Paste your current MLS description below. We’ll grade it and generate an improved,
          MLS-safe rewrite using your property + neighborhood facts.
        </p>

        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between">
            <label className="text-white font-semibold">Original Listing (required)</label>
            <span className={`text-xs ${originalCharCount >= 50 ? "text-emerald-300" : "text-yellow-200"}`}>
              {originalCharCount} chars (min 50)
            </span>
          </div>
          <textarea
            value={draftListing}
            onChange={(e) => setDraftListing(e.target.value)}
            placeholder="Paste the original MLS listing description here..."
            className="w-full min-h-[140px] rounded-xl bg-white/10 border border-white/20 text-white p-4 outline-none focus:border-white/40"
          />
          <p className="text-gray-400 text-xs">
            Tip: even a rough draft works — the AI needs some starting text to rewrite safely.
          </p>
        </div>

        <button
          onClick={generateListing}
          disabled={loading || !canGenerate}
          className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
        >
          {loading ? "Generating..." : listing ? "Regenerate Listing" : "Generate A+ Listing"}
        </button>

        <div className="text-gray-400 text-xs mt-3 space-y-1">
          <div>Auth: {authReady ? "ready" : "loading..."}</div>
          <div>Email: {email || "—"}</div>
          {submissionId && <div>Submission: {submissionId}</div>}
        </div>
      </div>

      {loading && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="w-12 h-12 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">
            Crafting your A+ listing with real neighborhood data and AI grading...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/60 backdrop-blur-md rounded-2xl p-6 border-2 border-red-500/40">
          <p className="text-red-200 font-bold">{error}</p>
        </div>
      )}

      {listing && !loading && analysis && (
        <div className="bg-gradient-to-br from-emerald-900/60 to-green-900/40 backdrop-blur-md rounded-2xl p-8 border-2 border-emerald-500/40 relative">
          <div className="absolute top-4 left-4 bg-red-500 text-white px-5 py-2 rounded-lg font-black text-2xl shadow-2xl transform -rotate-6">
            {analysis?.rewrite?.overall || "—"}
          </div>

          <h2 className="text-2xl font-bold text-white mb-4 ml-20">Your Professional Listing</h2>

          {analysis?.rewrite?.categories && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                { label: "Headline", key: "headline" },
                { label: "Length", key: "length" },
                { label: "Emotion", key: "emotion" },
                { label: "Keywords", key: "keywords" },
                { label: "CTA", key: "cta" },
                { label: "Compliance", key: "compliance" },
              ].map((cat) => {
                const grade = analysis?.rewrite?.categories?.[cat.key]?.grade || "—";
                return (
                  <div
                    key={cat.key}
                    className="bg-white/10 rounded-lg p-3 text-center border border-white/20"
                  >
                    <p className="text-gray-300 text-sm">{cat.label}</p>
                    <p className="text-white font-bold text-lg">{grade}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-4">
            <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{listing}</p>
            <p className="text-gray-400 text-sm mt-4">
              Word count: {listing.trim().split(/\s+/).filter(Boolean).length}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyListing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition"
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!listing}
          className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
        >
          Next: Documents and Checklist
        </button>
      </div>
    </div>
  );
}

