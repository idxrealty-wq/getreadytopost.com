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

const GRADE_COLOR: Record<string, string> = {
  A: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  B: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  C: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
  D: "bg-orange-500/20 border-orange-500/40 text-orange-300",
  F: "bg-red-500/20 border-red-500/40 text-red-300",
};

const GRADE_BADGE: Record<string, string> = {
  A: "bg-emerald-500 text-white",
  B: "bg-blue-500 text-white",
  C: "bg-yellow-500 text-white",
  D: "bg-orange-500 text-white",
  F: "bg-red-500 text-white",
};

function CategoryCard({ label, original, rewrite }: { label: string; original: any; rewrite: any; }) {
  const [open, setOpen] = useState(false);
  const og = original?.grade || "—";
  const rw = rewrite?.grade || "—";
  const needsExplain = og !== "A";
  return (
    <div className={`rounded-xl border p-4 ${needsExplain ? GRADE_COLOR[og] || GRADE_COLOR["F"] : "bg-white/5 border-white/10"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-bold text-sm">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded font-bold ${GRADE_BADGE[og] || GRADE_BADGE["F"]}`}>{og}</span>
          {og !== rw && (
            <>
              <span className="text-gray-400 text-xs">→</span>
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${GRADE_BADGE[rw] || GRADE_BADGE["F"]}`}>{rw}</span>
            </>
          )}
        </div>
      </div>
      {needsExplain && (
        <>
          <button onClick={() => setOpen(!open)} className="text-xs text-white/70 hover:text-white underline mt-1">
            {open ? "Hide details ▲" : "Why this grade? ▼"}
          </button>
          {open && (
            <div className="mt-3 space-y-3">
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-xs font-bold text-red-300 mb-1">❌ Why it failed:</p>
                <p className="text-xs text-gray-200 leading-relaxed">{original?.feedback || original?.auditTrail || "No details available."}</p>
                {Array.isArray(original?.evidence) && original.evidence.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {original.evidence.map((e: string, i: number) => <li key={i} className="text-xs text-gray-300 italic">"{e}"</li>)}
                  </ul>
                )}
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-xs font-bold text-emerald-300 mb-1">✅ What we fixed:</p>
                <p className="text-xs text-gray-200 leading-relaxed">{rewrite?.feedback || rewrite?.auditTrail || "Rewrite optimized for this category."}</p>
                {Array.isArray(rewrite?.evidence) && rewrite.evidence.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {rewrite.evidence.map((e: string, i: number) => <li key={i} className="text-xs text-gray-300 italic">"{e}"</li>)}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default function Tab3Listing({ address, propertyData, nearby, listing, setListing, onNext }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [draftListing, setDraftListing] = useState<string>("");

  useEffect(() => {
    setDraftListing((prev) => (prev.trim().length ? prev : String(listing || "")));
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
      if (draftListing.trim().length < 50) throw new Error("Paste at least 50 characters of the original listing before generating.");
      const createRes = await fetch("/api/submissions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: String(address).trim(),
          propertyDetails: propertyData || {},
          nearby: nearby || null,
          listingText: String(draftListing || "").trim(),
          uid: uid || null,
          email: String(email).trim(),
        }),
      });
      const createJson: any = await createRes.json().catch(() => ({}));
      if (!createRes.ok) throw new Error(createJson?.error || createJson?.message || "Failed to create submission");
      const subId = String(createJson?.submissionId || "").trim();
      if (!subId) throw new Error("Create succeeded but no submissionId in response.");
      setSubmissionId(subId);
      const analysisRes = await fetch("/api/submissions/run-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: subId }),
      });
      const analysisJson: any = await analysisRes.json().catch(() => ({}));
      if (!analysisRes.ok) throw new Error(analysisJson?.error || analysisJson?.message || "Analysis failed");
      const directRewrite = String(analysisJson?.rewriteText || "").trim();
      const directAnalysis = analysisJson?.analysis || null;
      if (directRewrite) { setListing(directRewrite); setAnalysis(directAnalysis); return; }
      const getRes = await fetch(`/api/submissions/get?submissionId=${encodeURIComponent(subId)}`);
      const getJson: any = await getRes.json().catch(() => ({}));
      if (!getRes.ok) throw new Error(getJson?.error || getJson?.message || "Failed to fetch results");
      const storedAnalysis = getJson?.submission?.analysis || getJson?.analysis || null;
      const storedRewrite = String(storedAnalysis?.rewrite?.text || "").trim();
      if (!storedRewrite) throw new Error("No rewrite text returned from analysis.");
      setListing(storedRewrite);
      setAnalysis(storedAnalysis);
    } catch (err: any) {
      setError(err?.message || "Failed to generate listing. Please try again.");
      setListing("");
      setAnalysis(null);
    } finally { setLoading(false); }
  };

  const copyListing = () => {
    if (!listing) return;
    navigator.clipboard.writeText(listing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    { label: "Headline", key: "headline" },
    { label: "Length", key: "length" },
    { label: "Emotion", key: "emotion" },
    { label: "Keywords", key: "keywords" },
    { label: "CTA", key: "cta" },
    { label: "Compliance", key: "compliance" },
  ];
  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">AI Listing Builder</h2>
        <p className="text-gray-300 mb-6">
          Paste your current MLS description below. We'll grade it across 6 categories,
          explain every issue, and generate an improved MLS-safe rewrite.
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
        </div>
        <button onClick={generateListing} disabled={loading || !canGenerate}
          className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50">
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
          <p className="text-gray-300">Grading your listing across 6 categories and generating your A+ rewrite...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/60 backdrop-blur-md rounded-2xl p-6 border-2 border-red-500/40">
          <p className="text-red-200 font-bold">{error}</p>
        </div>
      )}

      {listing && !loading && analysis && (
        <>
          {analysis?.original && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black ${GRADE_BADGE[analysis.original.overall] || GRADE_BADGE["F"]}`}>
                  {analysis.original.overall}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Original Listing Audit</h3>
                  <p className="text-gray-400 text-sm">Click any grade below A to see why and what we fixed</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <CategoryCard key={cat.key} label={cat.label}
                    original={analysis.original.categories?.[cat.key]}
                    rewrite={analysis.rewrite.categories?.[cat.key]} />
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-emerald-900/60 to-green-900/40 backdrop-blur-md rounded-2xl p-8 border-2 border-emerald-500/40">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black ${GRADE_BADGE[analysis.rewrite.overall] || GRADE_BADGE["F"]}`}>
                {analysis.rewrite.overall}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Your Professional Rewrite</h3>
                <p className="text-gray-400 text-sm">MLS-compliant · Fair Housing safe · {listing.trim().split(/\s+/).filter(Boolean).length} words</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-4">
              <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{listing}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={copyListing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition">
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
              <button onClick={onNext}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition border border-white/20">
                Next Step →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
