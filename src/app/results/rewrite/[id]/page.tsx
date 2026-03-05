"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Grade = "A" | "B" | "C" | "D" | "F";

function gradeColor(grade: string) {
  switch (grade) {
    case "A":
      return "#27ae60";
    case "B":
      return "#f39c12";
    case "C":
      return "#e74c3c";
    case "D":
      return "#c0392b";
    case "F":
      return "#95a5a6";
    default:
      return "#7f8c8d";
  }
}

function gradeLabel(grade: string) {
  switch (grade) {
    case "A":
      return "Excellent";
    case "B":
      return "Good";
    case "C":
      return "Fair";
    case "D":
      return "Poor";
    case "F":
      return "Incomplete";
    default:
      return "Unknown";
  }
}

type Category = { grade: Grade; feedback?: string };

type SubmissionDoc = {
  listingText?: string;
  status?: string;
  analysis?: {
    original?: {
      overall?: Grade;
      categories?: Record<string, Category>;
      recommendations?: string[];
    };
    rewrite?: {
      overall?: Grade;
      text?: string;
      wordCount?: number;
      categories?: Record<string, Category>;
    };
  };
  saved?: boolean;
};

export default function RewriteResultsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const submissionId = params?.id;

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<SubmissionDoc | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!submissionId) return;

    const run = async () => {
      setLoading(true);
      try {
        const ref = doc(db, "submissions", submissionId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as SubmissionDoc;
          setSubmission(data);
        } else {
          setSubmission(null);
        }
      } catch (e) {
        console.error(e);
        setSubmission(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [submissionId]);

  const handleReanalyze = async () => {
    if (!submissionId) return;
    setReanalyzing(true);
    try {
      const res = await fetch("/api/submissions/run-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });

      if (!res.ok) throw new Error("Reanalyze failed");

      const ref = doc(db, "submissions", submissionId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSubmission(snap.data() as SubmissionDoc);
      }
    } catch (e) {
      console.error(e);
      alert("Error reanalyzing. Please try again.");
    } finally {
      setReanalyzing(false);
    }
  };

  const handleSaveToVault = async () => {
    if (!submissionId) return;
    setSaving(true);
    try {
      const docRef = doc(db, "submissions", submissionId);
      // Keep it simple: mark saved on the document (same as your previous results-content.tsx)
      // This avoids relying on a separate API route that may not exist.
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(docRef, { saved: true, savedAt: new Date().toISOString() });

      setSubmission((prev) => (prev ? { ...prev, saved: true } : null));
      alert("Saved to Vault!");
    } catch (e) {
      console.error(e);
      alert("Error saving to vault");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyRewrite = () => {
    const text = submission?.analysis?.rewrite?.text;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadRewrite = () => {
    const text = submission?.analysis?.rewrite?.text;
    if (!text) return;
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `rewrite-${submissionId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const rewrite = submission?.analysis?.rewrite;
  const overall = String(rewrite?.overall || "") as Grade;
  const overallColor = gradeColor(overall);

  const categories = useMemo(() => {
    const obj = rewrite?.categories || {};
    return Object.entries(obj);
  }, [rewrite?.categories]);
  if (loading) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading rewrite report...</p>
        </div>
      </main>
    );
  }

  if (!submissionId) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <p className="text-white/80">Missing submission id.</p>
      </main>
    );
  }

  if (!submission) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <p className="text-white/80">Submission not found.</p>
      </main>
    );
  }

  if (!rewrite) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <p className="text-white/80">Rewrite analysis not available yet.</p>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">MLS-Ready Rewrite</h1>
            <p className="text-white/80">
              This is your rewrite, graded separately, plus next steps and upsells.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => router.push(`/results/original/${submissionId}`)}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg font-semibold transition"
            >
              ← View Original
            </button>
            <a
              href="/agent-vault"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg font-semibold transition"
            >
              Agent Vault
            </a>
          </div>
        </div>

        <div className="bg-white/10 border border-white/15 rounded-2xl p-6 mb-8">
          <p className="text-white/60 text-sm uppercase tracking-wide mb-2">Rewrite Overall Grade</p>
          <div className="flex items-center gap-4">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-4xl"
              style={{ backgroundColor: overallColor }}
            >
              {overall}
            </div>
            <div>
              <p className="text-white text-lg font-semibold">{gradeLabel(overall)}</p>
              <p className="text-white/70 text-sm">Based on 6 categories + compliance</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1a2b4a]">Your Rewrite</h2>
              <p className="text-gray-600 text-sm">
                Word count: <strong>{rewrite.wordCount || 0} words</strong>
              </p>
            </div>
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {reanalyzing ? "Analyzing..." : "Refresh"}
            </button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {String(rewrite.text || "")}
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleCopyRewrite}
              className="px-6 py-3 bg-[#c9a227] hover:bg-[#b8911f] text-white rounded-lg font-semibold transition"
            >
              {copied ? "Copied!" : "Copy Rewrite"}
            </button>
            <button
              onClick={handleDownloadRewrite}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
            >
              Download
            </button>
            <button
              onClick={handleSaveToVault}
              disabled={saving || submission.saved}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                submission.saved
                  ? "bg-green-600 text-white cursor-default"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {saving ? "Saving..." : submission.saved ? "Saved to Vault" : "Save to Vault"}
            </button>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="bg-white rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6">Rewrite Grades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map(([key, cat]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[#1a2b4a] capitalize">{key}</h3>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: gradeColor(cat?.grade) }}
                    >
                      {cat?.grade}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{cat?.feedback || "No feedback provided."}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <p className="text-[#c9a227] font-bold text-lg mb-1">Ready to close more deals?</p>
            <p className="text-white/80">Take these tools for a spin with your listing data already loaded:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href={`/property-tax?submissionId=${submissionId}`}
              className="bg-[#1e3a5f] hover:bg-[#2a4f7a] border border-white/20 rounded-xl p-5 text-center transition group"
            >
              <div className="text-4xl mb-2">🏠</div>
              <h3 className="text-white font-bold mb-1">Property Tax Estimator</h3>
              <p className="text-gray-400 text-sm">Estimate 2025 Orange County taxes for this property</p>
              <p className="text-[#c9a227] text-sm mt-2 font-semibold group-hover:underline">Open Estimator</p>
            </a>

            <a
              href={`/closing-costs?submissionId=${submissionId}`}
              className="bg-[#1e3a5f] hover:bg-[#2a4f7a] border border-white/20 rounded-xl p-5 text-center transition group"
            >
              <div className="text-4xl mb-2">💰</div>
              <h3 className="text-white font-bold mb-1">Closing Cost Calculator</h3>
              <p className="text-gray-400 text-sm">Full TRID-style buyer & seller cost breakdown</p>
              <p className="text-[#c9a227] text-sm mt-2 font-semibold group-hover:underline">Open Calculator</p>
            </a>

            <a
              href="/workspace"
              className="bg-[#1e3a5f] hover:bg-[#2a4f7a] border border-white/20 rounded-xl p-5 text-center transition group"
            >
              <div className="text-4xl mb-2">📋</div>
              <h3 className="text-white font-bold mb-1">Agent Workspace</h3>
              <p className="text-gray-400 text-sm">Build your full listing package with AI assistance</p>
              <p className="text-[#c9a227] text-sm mt-2 font-semibold group-hover:underline">Open Workspace</p>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
