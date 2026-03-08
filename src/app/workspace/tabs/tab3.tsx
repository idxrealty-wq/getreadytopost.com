"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

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

  const [authReady, setAuthReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid || null);
      setEmail(u?.email || null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const generateListing = async () => {
    if (!address) return;

    setLoading(true);
    setError("");
    setAnalysis(null);
    setSubmissionId(null);

    try {
      if (!authReady) {
        throw new Error("Auth is still loading. Try again in 1 second.");
      }
      if (!email) {
        throw new Error("You must be signed in (email missing).");
      }

      // 1) Create submission
      const createPayload = {
        address: String(address).trim(),
        propertyDetails: propertyData || {},
        nearby: nearby || null,
        listingText: String(listing || "").trim(),
        uid: uid || null,
        email: String(email).trim(),
      };

      console.log("[Tab3] Creating submission with payload:", createPayload);

      const createRes = await fetch("/api/submissions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      const createJson = await createRes.json().catch(() => ({}));
      console.log("[Tab3] Create response:", createRes.status, createJson);

      if (!createRes.ok) {
        throw new Error(
          createJson?.error || createJson?.message || "Failed to create submission"
        );
      }

      const subId = String(createJson?.submissionId || "").trim();
      if (!subId) {
        throw new Error("Create succeeded but no submissionId in response.");
      }

      setSubmissionId(subId);
      console.log("[Tab3] Submission created:", subId);

      // 2) Run analysis
      const analysisPayload = { submissionId: subId };
      console.log("[Tab3] Running analysis with payload:", analysisPayload);

      const analysisRes = await fetch("/api/submissions/run-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisPayload),
      });

      const analysisJson = await analysisRes.json().catch(() => ({}));
      console.log("[Tab3] Analysis response:", analysisRes.status, analysisJson);

      if (!analysisRes.ok) {
        throw new Error(
          analysisJson?.error || analysisJson?.message || "Analysis failed"
        );
      }

      // 3) Fetch completed submission
      const getUrl = `/api/submissions/get?submissionId=${encodeURIComponent(subId)}`;
      console.log("[Tab3] Fetching results from:", getUrl);

      const getRes = await fetch(getUrl);
      const getJson = await getRes.json().catch(() => ({}));
      console.log("[Tab3] Get response:", getRes.status, getJson);

      if (!getRes.ok) {
        throw new Error(getJson?.error || getJson?.message || "Failed to fetch results");
      }

      const rewriteText = String(getJson?.analysis?.rewrite?.text || "").trim();
      if (!rewriteText) {
        throw new Error("No rewrite text returned from analysis.");
      }

      setListing(rewriteText);
      setAnalysis(getJson?.analysis || null);
      console.log("[Tab3] Success! Rewrite and analysis set.");
    } catch (err: any) {
      const msg = err?.message || "Failed to generate listing. Please try again.";
      console.error("[Tab3] Error:", msg);
      setError(msg);
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
