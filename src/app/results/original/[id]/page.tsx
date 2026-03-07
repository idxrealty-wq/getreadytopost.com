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

type Category = { grade?: Grade | string; feedback?: string };

type SubmissionDoc = {
  listingText?: string;
  status?: string;
  analysis?: {
    original?: {
      overall?: Grade | string;
      categories?: Record<string, Category>;
      recommendations?: string[];
    };
    rewrite?: any;
  };
  notes?: {
    userNotes?: string;
    updatedAt?: string;
  };
};

export default function OriginalResultsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const submissionId = params?.id;

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<SubmissionDoc | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesStatus, setNotesStatus] = useState<"idle" | "saved" | "error">("idle");

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
          setNotes(String(data?.notes?.userNotes || ""));
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

  useEffect(() => {
    if (!submissionId) return;
    if (!submission) return;

    setNotesStatus("idle");
    const t = setTimeout(async () => {
      try {
        setSavingNotes(true);
        const res = await fetch("/api/submissions/save-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissionId, userNotes: notes }),
        });
        if (!res.ok) throw new Error("Save failed");
        setNotesStatus("saved");
      } catch (e) {
        console.error(e);
        setNotesStatus("error");
      } finally {
        setSavingNotes(false);
      }
    }, 700);

    return () => clearTimeout(t);
  }, [notes, submissionId, submission]);

  const analysisOriginal = submission?.analysis?.original as any;
  const overall = String(analysisOriginal?.overall || "N/A") as Grade;
  const overallColor = gradeColor(overall);

  const categories = useMemo(() => {
    const obj = analysisOriginal?.categories || {};
    return Object.entries(obj);
  }, [analysisOriginal?.categories]);

  if (loading) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading original report...</p>
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

  if (!analysisOriginal) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <p className="text-white/80">Analysis not available yet.</p>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Original Listing Report</h1>
            <p className="text-white/80">This is what you submitted — unchanged — plus the grades and your notes.</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => router.push(`/results/rewrite/${submissionId}`)}
              className="px-5 py-3 bg-[#c9a227] hover:bg-[#b8911f] text-white rounded-lg font-semibold transition"
            >
              View Rewrite →
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
          <p className="text-white/60 text-sm uppercase tracking-wide mb-2">Original Overall Grade</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Your Original Description</h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{String(submission.listingText || "")}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-2xl font-bold text-[#1a2b4a]">Your Notes</h2>
                <p className="text-gray-600 text-sm">Jot anything you want to remember. Auto-saves to this report.</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {savingNotes
                    ? "Saving..."
                    : notesStatus === "saved"
                      ? "Saved"
                      : notesStatus === "error"
                        ? "Save failed"
                        : ""}
                </p>
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              className="w-full border border-gray-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Example: Mention the new roof, add neighborhood name, remove any 'great schools' language, etc."
            />

            <p className="text-xs text-gray-500 mt-3">
              Tip: This is saved to Firestore under <code>notes.userNotes</code>.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6">Original Listing Grades</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.length > 0 ? (
              categories.map(([key, cat]) => {
                const c = cat as any;
                return (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-[#1a2b4a] capitalize">{String(key)}</h3>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: gradeColor(String(c?.grade || "")) }}
                      >
                        {String(c?.grade || "?")}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{String(c?.feedback || "No feedback provided.")}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-600">No category grades available.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6">Recommendations</h2>

          {(analysisOriginal?.recommendations as string[])?.length > 0 ? (
            <ol className="space-y-4">
              {(analysisOriginal.recommendations as string[]).map((rec: string, idx: number) => (
                <li key={idx} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#c9a227] text-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-gray-800 pt-1">{rec}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-600">No recommendations available.</p>
          )}
        </div>
      </div>
    </main>
  );
}
