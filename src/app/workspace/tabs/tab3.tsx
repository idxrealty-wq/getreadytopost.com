"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";

export default function Tab3Listing({
  address,
  propertyData,
  nearby,
  listing,
  setListing,
  onNext,
}: any) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const generateListing = async () => {
    if (!address) return;

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const uid = auth.currentUser?.uid || null;
      const email = auth.currentUser?.email || null;

      if (!email) {
        throw new Error("You must be signed in (email missing).");
      }

      // 1) Create submission
      const createRes = await fetch("/api/submissions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          propertyDetails: propertyData,
          nearby,
          listingText: listing || "",
          uid,
          email,
        }),
      });

      const createJson = await createRes.json().catch(() => ({}));
      if (!createRes.ok) {
        throw new Error(createJson?.error || "Failed to create submission");
      }

      const subId = String(createJson?.submissionId || "").trim();
      if (!subId) throw new Error("Create succeeded but no submissionId returned.");

      setSubmissionId(subId);
      // 2) Run analysis
      const analysisRes = await fetch("/api/submissions/run-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: subId }),
      });

      const analysisJson = await analysisRes.json().catch(() => ({}));
      if (!analysisRes.ok) {
        throw new Error(analysisJson?.error || "Analysis failed");
      }

      // 3) Fetch completed submission
      const getRes = await fetch(`/api/submissions/get?submissionId=${encodeURIComponent(subId)}`);
      const getJson = await getRes.json().catch(() => ({}));
      if (!getRes.ok) {
        throw new Error(getJson?.error || "Failed to fetch results");
      }

      const rewriteText = String(getJson?.analysis?.rewrite?.text || "").trim();
      if (!rewriteText) {
        throw new Error("No rewrite returned.");
      }

      setListing(rewriteText);
      setAnalysis(getJson?.analysis || null);
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
          Generate a professional, MLS-ready listing description using all your property and
          neighborhood data. Includes AI grading across 6 categories.
        </p>

        <button
          onClick={generateListing}
          disabled={loading || !address}
          className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
        >
          {loading ? "Generating..." : listing ? "Regenerate Listing" : "Generate A+ Listing"}
        </button>

        {submissionId && (
          <p className="text-gray-400 text-xs mt-3">Submission: {submissionId}</p>
        )}
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
